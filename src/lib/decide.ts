/**
 * 决策助手核心算法
 * 流程：双房源 → 差异向量 → 题面匹配 → 用户作答 → 加权决策
 *
 * 设计原则：
 * 1. 规则保底 (差异检测 + 题面池匹配) 永远可用，不依赖外部 API
 * 2. 可选融合 quiz 偏好画像 (PreferenceResult.weights) 做先验加权
 */

import questionPool from "../../data/question-pool.json";
import type { PreferenceResult } from "@/types";

// ========== 候选房源输入 schema ==========
export interface CandidateApartment {
  label: "A" | "B";
  title: string;
  price: number; // 月租 元
  roomType: "shared" | "studio" | "1bed" | "2bed";
  area: number; // ㎡
  commuteMin: number; // 通勤分钟
  decoration: 1 | 2 | 3 | 4; // 1=老破普装 4=网红装修
  communityQuality: 1 | 2 | 3; // 1=老破小无物业 3=优质物业
  buildingType: 1 | 2 | 3; // 1=老破小 3=新塔楼
  notes?: string;
}

const ROOM_TYPE_RANK: Record<CandidateApartment["roomType"], number> = {
  shared: 1,
  studio: 2,
  "1bed": 3,
  "2bed": 4,
};
const ROOM_TYPE_LABEL: Record<CandidateApartment["roomType"], string> = {
  shared: "合租单间",
  studio: "整租开间",
  "1bed": "一居室",
  "2bed": "两居室",
};
const DECO_LABEL: Record<number, string> = {
  1: "老破普装",
  2: "普通装修",
  3: "精装",
  4: "网红装修",
};
const COMM_LABEL: Record<number, string> = {
  1: "老破小无物业",
  2: "普通小区",
  3: "优质物业小区",
};
const BLD_LABEL: Record<number, string> = {
  1: "老破小",
  2: "普通板楼",
  3: "新塔楼",
};

// ========== 题面池类型 ==========
interface PoolQuestion {
  id: string;
  dimension: string; // price/commuteMin/decoration/...
  diffLevel: "large" | "medium" | "small" | "none";
  favoredSide: "A" | "B" | "neutral";
  title: string;
  body: string;
  options: { label: string; endorsedSide: "A" | "B" }[];
}

const POOL = questionPool as PoolQuestion[];

// ========== 差异检测 ==========
export interface DimDiff {
  dimension: string;
  diffLevel: "large" | "medium" | "small" | "none";
  favoredSide: "A" | "B" | "neutral";
  rawDiff: number; // 真实差值（用于占位符替换）
  importance: number; // 0-1，差距重要性，用于排序
}

function classifyPriceDiff(diff: number) {
  const abs = Math.abs(diff);
  if (abs < 800) return { level: "small" as const, importance: abs / 800 };
  if (abs <= 2500) return { level: "medium" as const, importance: 0.6 };
  return { level: "large" as const, importance: 1 };
}

function classifyCommuteDiff(diff: number) {
  const abs = Math.abs(diff);
  if (abs < 8) return { level: "small" as const, importance: abs / 8 };
  if (abs <= 25) return { level: "medium" as const, importance: 0.6 };
  return { level: "large" as const, importance: 1 };
}

function classifyAreaDiff(diff: number) {
  const abs = Math.abs(diff);
  if (abs < 8) return { level: "small" as const, importance: abs / 8 };
  if (abs <= 25) return { level: "medium" as const, importance: 0.6 };
  return { level: "large" as const, importance: 1 };
}

function classifyEnumDiff(diff: number, maxStep: number) {
  const abs = Math.abs(diff);
  if (abs === 0) return { level: "none" as const, importance: 0 };
  if (abs === 1) return { level: "small" as const, importance: 0.4 };
  if (abs === 2) return { level: "medium" as const, importance: 0.7 };
  return { level: "large" as const, importance: 1 };
}

export function detectDiffs(a: CandidateApartment, b: CandidateApartment): DimDiff[] {
  const diffs: DimDiff[] = [];

  // price (A - B)，A 贵 → B 是省钱方
  const priceDiff = a.price - b.price;
  const pc = classifyPriceDiff(priceDiff);
  diffs.push({
    dimension: "price",
    diffLevel: pc.level,
    favoredSide: priceDiff > 0 ? "B" : priceDiff < 0 ? "A" : "neutral",
    rawDiff: Math.abs(priceDiff),
    importance: pc.importance,
  });

  // commute (B - A)，B 通勤更长 → A 是短通勤方
  const commuteDiff = b.commuteMin - a.commuteMin;
  const cc = classifyCommuteDiff(commuteDiff);
  diffs.push({
    dimension: "commuteMin",
    diffLevel: cc.level,
    favoredSide: commuteDiff > 0 ? "A" : commuteDiff < 0 ? "B" : "neutral",
    rawDiff: Math.abs(commuteDiff),
    importance: cc.importance,
  });

  // area (A - B)，A 大 → A 是大面积方
  const areaDiff = a.area - b.area;
  const ac = classifyAreaDiff(areaDiff);
  diffs.push({
    dimension: "area",
    diffLevel: ac.level,
    favoredSide: areaDiff > 0 ? "A" : areaDiff < 0 ? "B" : "neutral",
    rawDiff: Math.abs(areaDiff),
    importance: ac.importance,
  });

  // decoration (1-4)
  const decoDiff = a.decoration - b.decoration;
  const dc = classifyEnumDiff(decoDiff, 3);
  diffs.push({
    dimension: "decoration",
    diffLevel: dc.level,
    favoredSide: decoDiff > 0 ? "A" : decoDiff < 0 ? "B" : "neutral",
    rawDiff: Math.abs(decoDiff),
    importance: dc.importance,
  });

  // community quality
  const commDiff = a.communityQuality - b.communityQuality;
  const qc = classifyEnumDiff(commDiff, 2);
  diffs.push({
    dimension: "communityQuality",
    diffLevel: qc.level,
    favoredSide: commDiff > 0 ? "A" : commDiff < 0 ? "B" : "neutral",
    rawDiff: Math.abs(commDiff),
    importance: qc.importance,
  });

  // building type
  const bldDiff = a.buildingType - b.buildingType;
  const bc = classifyEnumDiff(bldDiff, 2);
  diffs.push({
    dimension: "buildingType",
    diffLevel: bc.level,
    favoredSide: bldDiff > 0 ? "A" : bldDiff < 0 ? "B" : "neutral",
    rawDiff: Math.abs(bldDiff),
    importance: bc.importance,
  });

  // room type
  const rtDiff = ROOM_TYPE_RANK[a.roomType] - ROOM_TYPE_RANK[b.roomType];
  const rc = classifyEnumDiff(rtDiff, 3);
  diffs.push({
    dimension: "roomType",
    diffLevel: rc.level,
    favoredSide: rtDiff > 0 ? "A" : rtDiff < 0 ? "B" : "neutral",
    rawDiff: Math.abs(rtDiff),
    importance: rc.importance,
  });

  return diffs;
}

// ========== 题面匹配与渲染 ==========

export interface RenderedQuestion {
  id: string;
  dimension: string;
  title: string;
  body: string;
  options: { label: string; endorsedSide: "A" | "B" }[];
  rawDiff: DimDiff;
}

function fillPlaceholders(text: string, diff: DimDiff, a: CandidateApartment, b: CandidateApartment): string {
  return text
    .replace(/\{priceDiff\}/g, String(Math.abs(a.price - b.price)))
    .replace(/\{yearDiff\}/g, String(Math.abs(a.price - b.price) * 12))
    .replace(/\{commuteDiff\}/g, String(Math.abs(b.commuteMin - a.commuteMin)))
    .replace(/\{areaDiff\}/g, String(Math.abs(a.area - b.area)));
}

/**
 * 从题面池里挑题：
 * 1. 取所有 importance > 0 的差异维度
 * 2. 按 importance 降序排
 * 3. 每个维度匹配池里 dimension+diffLevel 一致的题，随机挑一条
 * 4. 渲染占位符 + 反转 favoredSide（如果池里题假设 A 是省钱方但实际 B 是省钱方）
 * 5. 不足 5 题用 tie 收尾题补
 */
export function pickQuestions(
  a: CandidateApartment,
  b: CandidateApartment,
  diffs: DimDiff[],
  targetCount = 5
): RenderedQuestion[] {
  const sorted = [...diffs].filter((d) => d.diffLevel !== "none").sort((a, b) => b.importance - a.importance);

  const picked: RenderedQuestion[] = [];

  for (const diff of sorted) {
    if (picked.length >= targetCount) break;
    const candidates = POOL.filter(
      (q) => q.dimension === diff.dimension && q.diffLevel === diff.diffLevel
    );
    if (candidates.length === 0) continue;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    // 反转：池里假设的 favoredSide vs 实际 favoredSide
    const poolFavor = chosen.favoredSide; // "A" 或 "B"
    const realFavor = diff.favoredSide; // 实际倒向哪边
    const needSwap = poolFavor !== "neutral" && realFavor !== "neutral" && poolFavor !== realFavor;

    const options = chosen.options.map((opt) => ({
      label: opt.label.replace(/\bA\b/g, needSwap ? "B" : "A").replace(/\bB\b/g, needSwap ? "A" : "B"),
      endorsedSide: needSwap ? (opt.endorsedSide === "A" ? "B" : "A") : opt.endorsedSide,
    })) as { label: string; endorsedSide: "A" | "B" }[];

    picked.push({
      id: chosen.id + (needSwap ? "_swap" : ""),
      dimension: diff.dimension,
      title: fillPlaceholders(chosen.title, diff, a, b),
      body: fillPlaceholders(chosen.body, diff, a, b),
      options,
      rawDiff: diff,
    });
  }

  // 不够数 → 用 tie 题补
  if (picked.length < targetCount) {
    const tieQs = POOL.filter((q) => q.dimension === "tie");
    const shuffled = [...tieQs].sort(() => Math.random() - 0.5);
    for (const q of shuffled) {
      if (picked.length >= targetCount) break;
      picked.push({
        id: q.id,
        dimension: "tie",
        title: q.title,
        body: q.body,
        options: q.options,
        rawDiff: {
          dimension: "tie",
          diffLevel: "none",
          favoredSide: "neutral",
          rawDiff: 0,
          importance: 0,
        },
      });
    }
  }

  return picked;
}

// ========== 最终决策 ==========

export interface DecisionAnswer {
  questionId: string;
  dimension: string;
  endorsedSide: "A" | "B";
  importance: number; // 来自题的 rawDiff.importance
}

export interface DecisionResult {
  winner: "A" | "B" | "tie";
  scoreA: number;
  scoreB: number;
  /** 推荐方的最强理由（用户表态最一致的几个维度）*/
  topReasons: { dimension: string; label: string; weight: number; fact: string; voice: string }[];
  /** 反方的不可忽视的优势（让用户知道权衡）*/
  counterPoints: { dimension: string; label: string; fact: string }[];
  /** 调试用：每个维度的累计倾向 */
  dimensionBreakdown: Record<string, number>;
}

const DIM_LABEL: Record<string, string> = {
  price: "月租预算",
  commuteMin: "通勤时间",
  area: "面积大小",
  decoration: "装修档次",
  communityQuality: "小区品质",
  buildingType: "楼栋年代",
  roomType: "房型独立性",
  tie: "整体直觉",
};

/**
 * 计算决策结果
 * - 每道题：用户表态那边得 importance 分（最低 0.3，避免 tie 题没意义）
 * - 如果用户做过 quiz，融合先验：用户偏好权重 × 该维度的客观胜出方
 */
export function computeDecision(
  a: CandidateApartment,
  b: CandidateApartment,
  diffs: DimDiff[],
  answers: DecisionAnswer[],
  prefResult?: PreferenceResult | null
): DecisionResult {
  let scoreA = 0;
  let scoreB = 0;
  const breakdown: Record<string, number> = {};

  // 1) 用户表态分
  for (const ans of answers) {
    const w = Math.max(ans.importance, 0.3); // 至少 0.3，避免 tie 全 0
    if (ans.endorsedSide === "A") scoreA += w;
    else scoreB += w;
    breakdown[ans.dimension] = (breakdown[ans.dimension] || 0) + (ans.endorsedSide === "A" ? w : -w);
  }

  // 2) 偏好画像先验融合
  if (prefResult) {
    const dimToAttr: Record<string, string> = {
      price: "price",
      commuteMin: "commute",
      decoration: "decoration",
      communityQuality: "community",
      buildingType: "building",
      roomType: "roomType",
    };
    for (const diff of diffs) {
      if (diff.favoredSide === "neutral") continue;
      const attrId = dimToAttr[diff.dimension];
      if (!attrId) continue;
      const w = prefResult.weights.find((x) => x.attributeId === attrId);
      if (!w) continue;
      // 偏好权重 × 客观差异重要性，按比例 0.5x 注入（不喧宾夺主）
      const bonus = w.weight * diff.importance * 0.5;
      if (diff.favoredSide === "A") scoreA += bonus;
      else scoreB += bonus;
      breakdown[diff.dimension] = (breakdown[diff.dimension] || 0) + (diff.favoredSide === "A" ? bonus : -bonus);
    }
  }

  // 3) winner
  const margin = Math.abs(scoreA - scoreB);
  const total = scoreA + scoreB;
  const winner: DecisionResult["winner"] = total === 0 ? "tie" : margin / total < 0.08 ? "tie" : scoreA > scoreB ? "A" : "B";

  // 4) 选出推荐方的 top reasons（按 breakdown 倾向于 winner 的最大维度）
  const winnerSign = winner === "A" ? 1 : winner === "B" ? -1 : 0;
  const sortedDims = Object.entries(breakdown).sort(
    ([, v1], [, v2]) => Math.abs(v2) - Math.abs(v1)
  );

  // 生成事实描述（数字驱动）
  function factForDim(dim: string, favoredSide: "A" | "B" | "neutral"): string {
    if (favoredSide === "neutral") return "";
    const winner = favoredSide === "A" ? a : b;
    const loser = favoredSide === "A" ? b : a;
    const winLabel = favoredSide === "A" ? "方案 A" : "方案 B";
    const loseLabel = favoredSide === "A" ? "方案 B" : "方案 A";
    switch (dim) {
      case "price": {
        const d = Math.abs(a.price - b.price);
        return `${winLabel} 每月便宜 ${d} 元（年省 ${(d * 12).toLocaleString()} 元）`;
      }
      case "commuteMin": {
        const d = Math.abs(a.commuteMin - b.commuteMin);
        return `${winLabel} 单程通勤快 ${d} 分钟（每天多睡 ${Math.round(d * 2 / 5) * 5} 分钟）`;
      }
      case "area": {
        const d = Math.abs(a.area - b.area);
        return `${winLabel} 面积大 ${d.toFixed(0)}㎡`;
      }
      case "decoration":
        return `${winLabel} 是${DECO_LABEL[winner.decoration]}，${loseLabel} 只是${DECO_LABEL[loser.decoration]}`;
      case "communityQuality":
        return `${winLabel} 是${COMM_LABEL[winner.communityQuality]}，${loseLabel} 是${COMM_LABEL[loser.communityQuality]}`;
      case "buildingType":
        return `${winLabel} 是${BLD_LABEL[winner.buildingType]}，${loseLabel} 是${BLD_LABEL[loser.buildingType]}`;
      case "roomType":
        return `${winLabel} 是${ROOM_TYPE_LABEL[winner.roomType]}，${loseLabel} 是${ROOM_TYPE_LABEL[loser.roomType]}`;
      default:
        return "";
    }
  }

  // 以 dim 查 favoredSide
  const dimToFav: Record<string, "A" | "B" | "neutral"> = {};
  for (const d of diffs) dimToFav[d.dimension] = d.favoredSide;

  // 用户语气 voice（贴近 user-facing 的心里话）
  const VOICE: Record<string, string> = {
    price: "钱的权重在你心里是第一位——宁愿多走几步也不愿年底后悔",
    commuteMin: "你每题都倒向“能多睡一会”，这口气拼不回来",
    area: "你不愿意把个人空间压缩到当快递柜，面积是你的底线",
    decoration: "你是拍朝阳、发朋友圈的那类人，装修是你每天的快乐源",
    communityQuality: "你在物业题上最果断，安静和安全感是刚需",
    buildingType: "隔音、电梯、卫生间设计——老房的坏你受不了",
    roomType: "独立空间不可交换，你明确不愿与人同住",
  };

  // topReasons：用户表态方向 与 客观差异方向一致的维度（用户选 B 且 B 客观也胜出）
  const winnerLetter: "A" | "B" | null = winner === "A" ? "A" : winner === "B" ? "B" : null;

  const topReasons = sortedDims
    .filter(([dim, v]) => {
      if (winnerSign === 0) return true; // tie 时都展示
      if (v * winnerSign <= 0) return false; // 用户不偏向 winner
      // 客观差异也要偏向 winner（或 neutral）
      const fav = dimToFav[dim];
      if (fav && winnerLetter && fav !== "neutral" && fav !== winnerLetter) return false;
      return true;
    })
    .slice(0, 3)
    .map(([dim, v]) => {
      const fav = (dimToFav[dim] && dimToFav[dim] !== "neutral")
        ? dimToFav[dim]
        : (v > 0 ? "A" : "B");
      return {
        dimension: dim,
        label: DIM_LABEL[dim] || dim,
        weight: Math.abs(v),
        fact: factForDim(dim, fav as "A" | "B"),
        voice: VOICE[dim] || "",
      };
    });

  // counterPoints：客观差异偏向输家的维度（提醒用户权衡）
  const counterPoints: { dimension: string; label: string; fact: string }[] = [];
  if (winnerLetter) {
    const loserLetter = winnerLetter === "A" ? "B" : "A";
    for (const diff of diffs) {
      if (diff.favoredSide === loserLetter && diff.importance > 0.1) {
        counterPoints.push({
          dimension: diff.dimension,
          label: DIM_LABEL[diff.dimension] || diff.dimension,
          fact: factForDim(diff.dimension, loserLetter),
        });
        if (counterPoints.length >= 3) break;
      }
    }
  }

  return {
    winner,
    scoreA: Math.round(scoreA * 100) / 100,
    scoreB: Math.round(scoreB * 100) / 100,
    topReasons,
    counterPoints,
    dimensionBreakdown: breakdown,
  };
}

// ========== 示例数据 ==========
export const SAMPLE_A: CandidateApartment = {
  label: "A",
  title: "三里屯·朝阳门 SOHO 一居室",
  price: 9500,
  roomType: "1bed",
  area: 52,
  commuteMin: 22,
  decoration: 4,
  communityQuality: 3,
  buildingType: 3,
  notes: "通勤近、装修网红，但月租上万",
};
export const SAMPLE_B: CandidateApartment = {
  label: "B",
  title: "回龙观·龙泽社区 整租一居",
  price: 4800,
  roomType: "1bed",
  area: 58,
  commuteMin: 62,
  decoration: 2,
  communityQuality: 2,
  buildingType: 2,
  notes: "便宜一大半，但通勤一小时，老小区",
};

// 工具：把候选房源转成可读字符串
export function formatApartmentSummary(apt: CandidateApartment): string {
  return [
    `¥${apt.price}/月`,
    ROOM_TYPE_LABEL[apt.roomType],
    `${apt.area}㎡`,
    `通勤 ${apt.commuteMin}分钟`,
    DECO_LABEL[apt.decoration],
    COMM_LABEL[apt.communityQuality],
    BLD_LABEL[apt.buildingType],
  ].join(" · ");
}

export { ROOM_TYPE_LABEL, DECO_LABEL, COMM_LABEL, BLD_LABEL, DIM_LABEL };
