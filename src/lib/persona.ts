/**
 * 租房人格（Rent-MBTI）
 *
 * 把 Conjoint 的 6 维度 importance + part-worth 压缩成 4 字母人格代号。
 * 每个字母来自一个二分轴，轴本身是从用户的 β 权重里直接算出来的——
 * 这是真正的潜变量分析（latent variable analysis），不是预设量表。
 *
 * 4 个轴：
 *   - P (Price 价格) vs Q (Quality 品质)
 *   - E (Efficiency 效率) vs L (Living 生活)
 *   - S (Solo 独居) vs C (Communal 合居)
 *   - R (Realist 务实) vs A (Aesthete 讲究)
 *
 * 4 × 2 = 16 种人格，跟 MBTI 完全同构。
 */
import type { Importance, PartWorth } from "@/lib/conjoint-v2/core";

// ============================================================
// 4 个轴的计算
// ============================================================

/** 把多个维度的 importance 加起来，找不到就当 0 */
function sumImportance(
  importance: Importance[],
  ids: string[]
): number {
  return ids.reduce((sum, id) => {
    const item = importance.find((i) => i.attrId === id);
    return sum + (item?.importance ?? 0);
  }, 0);
}

/** 一个轴的得分：左极 vs 右极，返回 -1..+1 的偏向值（负=左极，正=右极） */
export interface AxisScore {
  /** 左极字母，如 "P" */
  leftLetter: string;
  /** 右极字母，如 "Q" */
  rightLetter: string;
  /** 左极名字 */
  leftName: string;
  /** 右极名字 */
  rightName: string;
  /** -1..+1，负=偏左极，正=偏右极 */
  bias: number;
  /** 最终落在哪个字母 */
  letter: string;
  /** 强度：|bias| × 100，0-100，用来画轴 */
  strength: number;
}

function makeAxis(
  leftLetter: string,
  rightLetter: string,
  leftName: string,
  rightName: string,
  leftScore: number,
  rightScore: number
): AxisScore {
  const total = leftScore + rightScore;
  // 如果两边都是 0（用户根本没选这两组维度），bias 设为 0，默认偏向右极
  const bias = total === 0 ? 0 : (rightScore - leftScore) / total;
  return {
    leftLetter,
    rightLetter,
    leftName,
    rightName,
    bias,
    letter: bias >= 0 ? rightLetter : leftLetter,
    strength: Math.round(Math.abs(bias) * 100),
  };
}

/**
 * 价格 vs 品质轴：
 *   - 左极 P (Price-driven)：租金权重高
 *   - 右极 Q (Quality-driven)：面积+装修+楼龄的权重之和高
 */
function computePQ(importance: Importance[]): AxisScore {
  const price = sumImportance(importance, ["price"]);
  const quality = sumImportance(importance, ["area", "decoration", "buildingAge"]);
  return makeAxis("P", "Q", "价格敏感", "品质追求", price, quality);
}

/**
 * 效率 vs 生活轴：
 *   - 左极 E (Efficiency)：通勤 + 地铁步行 权重高
 *   - 右极 L (Living)：采光 + 阳台 + 宠物 权重高
 */
function computeEL(importance: Importance[]): AxisScore {
  const efficiency = sumImportance(importance, ["commute", "subwayWalk"]);
  const living = sumImportance(importance, [
    "lighting",
    "balcony",
    "petFriendly",
  ]);
  return makeAxis("E", "L", "效率优先", "生活优先", efficiency, living);
}

/**
 * 独居 vs 合居轴：
 *   - 左极 S (Solo)：整租独居 part-worth 最高
 *   - 右极 C (Communal)：合租 part-worth 最高
 *
 * 当用户没勾选 rentType 时，看「独立卫浴」part-worth 作为代理：
 * 完全独立 utility 越高 = 越偏 S，合用 utility 越高 = 越偏 C。
 */
function computeSC(
  importance: Importance[],
  partWorths: PartWorth[]
): AxisScore {
  const rentType = partWorths.find((p) => p.attrId === "rentType");
  if (rentType && rentType.levels.length >= 3) {
    // levels[0] 三人合租, levels[1] 两人合租, levels[2] 整租独居
    const solo = rentType.levels[2].utility;
    const communal = (rentType.levels[0].utility + rentType.levels[1].utility) / 2;
    // 把 utility 平移到 ≥0 再加起来
    const offset = Math.abs(Math.min(solo, communal, 0)) + 0.001;
    return makeAxis(
      "S",
      "C",
      "独立空间",
      "合居共享",
      Math.max(0, solo + offset),
      Math.max(0, communal + offset)
    );
  }
  // Fallback：看 privateBath
  const pb = partWorths.find((p) => p.attrId === "privateBath");
  if (pb && pb.levels.length >= 3) {
    const solo = pb.levels[2].utility;
    const communal = pb.levels[0].utility;
    const offset = Math.abs(Math.min(solo, communal, 0)) + 0.001;
    return makeAxis(
      "S",
      "C",
      "独立空间",
      "合居共享",
      Math.max(0, solo + offset),
      Math.max(0, communal + offset)
    );
  }
  // 都没勾，默认偏 S（多数年轻人独居倾向）
  return makeAxis("S", "C", "独立空间", "合居共享", 0.6, 0.4);
}

/**
 * 务实 vs 讲究轴：
 *   - 左极 R (Realist)：电梯 + 独立卫浴 权重高（基础设施控）
 *   - 右极 A (Aesthete)：装修 + 采光 权重高（颜值控）
 */
function computeRA(importance: Importance[]): AxisScore {
  const realist = sumImportance(importance, ["elevator", "privateBath"]);
  const aesthete = sumImportance(importance, ["decoration", "lighting"]);
  return makeAxis("R", "A", "基础务实", "颜值讲究", realist, aesthete);
}

// ============================================================
// 16 种人格元数据
// ============================================================

export interface PersonaMeta {
  code: string;
  name: string;
  emoji: string;
  /** 一句话 tagline */
  tagline: string;
  /** 2-3 句详细描述 */
  description: string;
  /** 你会被这种房子打动 */
  loves: string[];
  /** 与你高度相似的群体 */
  cohort: string;
  /** 对照人格代号 */
  opposite: string;
  /** 人口占比（基于设计直觉的估计，Demo 用） */
  rarity: number; // 0-1
  /** 主色调（hex） */
  color: string;
}

/**
 * 16 种人格的完整字典。
 * 命名遵循 MBTI 习惯：先给一个 4 字母代号，再起一个本地化的称号。
 */
export const PERSONA_DICT: Record<string, PersonaMeta> = {
  // ============ P 开头：价格敏感 ============
  PESR: {
    code: "PESR",
    name: "精打细算合伙人",
    emoji: "🧮",
    tagline: "钱要花在刀刃上，通勤越短越好，能跟人合住没问题",
    description:
      "你是典型的初入职场北漂——预算紧、时间贵、对装修阳台没什么执念。你会为了离公司近 10 分钟接受合租，也会为了便宜 500 块接受老房子。",
    loves: ["地铁 5 分钟内", "6000 元以下整租或两人合租", "电梯老破小也行"],
    cohort: "应届第 1-2 年、互联网/咨询初级岗、刚毕业实习生",
    opposite: "QLAA",
    rarity: 0.18,
    color: "#0F766E",
  },
  PESA: {
    code: "PESA",
    name: "网红出租屋玩家",
    emoji: "📸",
    tagline: "预算有限但颜值不能输，租金省下来花在装修和合租伙伴上",
    description:
      "你愿意为了一个能拍照的窗户和好看的客厅多花 500，但绝对不愿意花 2000 升级到整租。合租在你眼里不是退而求其次，是社交资产。",
    loves: ["精装合租", "南向阳台", "通勤 30 分钟可接受"],
    cohort: "做内容/设计/品牌的女生、社恐但又想认识人的人",
    opposite: "QESR",
    rarity: 0.09,
    color: "#DB2777",
  },
  PELR: {
    code: "PELR",
    name: "务实通勤族",
    emoji: "🚇",
    tagline: "租金最重要，通勤其次，颜值阳台都是浮云",
    description:
      "你的决策路径短到极致——先看价格能不能接受，再看通勤能不能忍。其余维度你都愿意妥协。你不是没追求，是把追求留给了别的地方。",
    loves: ["地铁口", "整租 6000 内", "户型方正能放下双人床和工位"],
    cohort: "理工科男生、考公考研中转期、攒钱阶段的所有人",
    opposite: "QLAA",
    rarity: 0.16,
    color: "#0369A1",
  },
  PELA: {
    code: "PELA",
    name: "性价比美学家",
    emoji: "🌿",
    tagline: "预算有限但生活感不能丢，宁可远一点也要采光好",
    description:
      "你不愿意为通勤牺牲采光，但也不愿意为采光多付租金。这是一个最难满足的人格——你的答案永远在第二环和第三环交界处。",
    loves: ["南向", "有阳台", "次新房 5000-7000 元"],
    cohort: "教师、出版/媒体从业者、回避型独居者",
    opposite: "QESR",
    rarity: 0.07,
    color: "#65A30D",
  },
  PCSR: {
    code: "PCSR",
    name: "合居精算师",
    emoji: "🏠",
    tagline: "省钱省心，跟朋友/室友拼一套大房子最划算",
    description:
      "你计算过——三人合租人均 3000 能住 100 平的次新房，比独居 5500 元的开间舒服一倍。合居对你是经济学问题，不是社交问题。",
    loves: ["三居 / 四居", "近地铁", "厨房客厅大"],
    cohort: "工作 2-5 年合租党、有稳定室友圈的人",
    opposite: "QSLA",
    rarity: 0.08,
    color: "#B45309",
  },
  PCSA: {
    code: "PCSA",
    name: "合居生活美学者",
    emoji: "🎨",
    tagline: "跟人合住但要有腔调——大客厅、好厨房、装修干净",
    description:
      "你是 Co-living 概念的天然受众——独居太贵也太孤独，普通合租又太将就。你要的是合租里有限的高品质。",
    loves: ["精装合租", "独立卫浴必备", "客厅大"],
    cohort: "海归回国第一年、独立设计师、自由职业者",
    opposite: "QELR",
    rarity: 0.05,
    color: "#7C3AED",
  },
  PCLR: {
    code: "PCLR",
    name: "通勤+合居双省党",
    emoji: "⏱️",
    tagline: "近地铁的合租房是终极性价比，能挤就挤",
    description:
      "你完全不浪漫——通勤 + 合租 = 经济效率最大化。但你在两个核心上一步不让：必须近地铁、必须能挤进合租平均价以下。",
    loves: ["地铁站走 5 分钟内", "两人合租 3500 元以下", "不挑装修"],
    cohort: "实习生、刚来北上广的应届生、长期出差党",
    opposite: "QSLA",
    rarity: 0.12,
    color: "#475569",
  },
  PCLA: {
    code: "PCLA",
    name: "合居颜值控",
    emoji: "✨",
    tagline: "合租也要有美感，至少阳台和客厅看着舒服",
    description:
      "你是合租里的颜值担当——会主动 DIY 客厅，会在意公共空间的采光。你愿意为这些多付 500-800 元。",
    loves: ["客厅有沙发", "南向阳台", "中等价位精装合租"],
    cohort: "做品牌/设计/HR 的合租生、回血状态的小镇做题家",
    opposite: "QELR",
    rarity: 0.04,
    color: "#E11D48",
  },

  // ============ Q 开头：品质追求 ============
  QESR: {
    code: "QESR",
    name: "硬核效率主义者",
    emoji: "🎯",
    tagline: "时间最贵，房子要够大够好——为效率付费",
    description:
      "你的预算不算特别紧，但你绝对不接受通勤超过 30 分钟。你愿意为整租 + 大面积 + 好基础设施付溢价，但不会为装修花钱。",
    loves: ["整租 1.5 居以上", "地铁 10 分钟内", "电梯 + 独卫"],
    cohort: "工作 3-5 年的中级岗、互联网/咨询/投行 P5-P6",
    opposite: "PCLA",
    rarity: 0.07,
    color: "#1E40AF",
  },
  QESA: {
    code: "QESA",
    name: "效率与品味兼顾",
    emoji: "🪞",
    tagline: "通勤要短，房子要好看——两个都不让",
    description:
      "你是高端通勤族的典型——CBD 步行可达、精装、阳台、采光，缺一不可。你愿意为这一整套付 8000+ 的租金。",
    loves: ["国贸/陆家嘴步行圈", "精装一居", "落地窗 + 阳台"],
    cohort: "投行/外企/科技公司中高级岗、Slasher",
    opposite: "PCLR",
    rarity: 0.05,
    color: "#9333EA",
  },
  QELR: {
    code: "QELR",
    name: "品质生活通勤族",
    emoji: "☀️",
    tagline: "通勤稍长可以忍，但房子必须舒服",
    description:
      "你愿意为采光、阳台、面积牺牲 10-15 分钟通勤。你的逻辑是——每天通勤的 30 分钟可以听播客，但回家面对的房子如果不好住，是一辈子的事。",
    loves: ["1.5-2 居整租", "南向", "次新房或精装"],
    cohort: "工作 5-10 年、有宠物、考虑长租 2 年以上",
    opposite: "PESA",
    rarity: 0.10,
    color: "#0891B2",
  },
  QELA: {
    code: "QELA",
    name: "都市美学独居者",
    emoji: "🌸",
    tagline: "生活感是第一位的——阳台、采光、装修一个都不能少",
    description:
      "你是租房博主和家居博主的核心受众。你会专门为了一个朝南的阳台多付 1500 元/月。你的房子是你的避风港，也是你的人格延伸。",
    loves: ["大阳台", "原木装修", "南北通透"],
    cohort: "30+ 都市独居女性、自由职业者、艺术从业者",
    opposite: "PCSR",
    rarity: 0.06,
    color: "#D97706",
  },
  QCSR: {
    code: "QCSR",
    name: "豪华合租派",
    emoji: "🏛️",
    tagline: "合租可以，但要住大房子——人均 5000 也接受",
    description:
      "你不是被迫合租，你是主动选择合租——同样的钱独居只能住开间，合租可以住三居豪华公寓。你的合租伙伴往往是同事或好友。",
    loves: ["三居豪华整租", "近地铁", "电梯洋房"],
    cohort: "金融/咨询年轻 VP、海归回国稳定后",
    opposite: "PELA",
    rarity: 0.03,
    color: "#7E22CE",
  },
  QCSA: {
    code: "QCSA",
    name: "Co-Living 美学家",
    emoji: "🪴",
    tagline: "高质量合居 + 高质量空间，社群也是生活的一部分",
    description:
      "你是 You+/魔方/泊寓那种品牌长租公寓的精准用户。你要的不只是房子，是一个有调性的社群。",
    loves: ["品牌长租公寓", "公共客厅 + 健身房", "南向独卧"],
    cohort: "互联网产品/运营、独立顾问、刚回国的留学生",
    opposite: "PELR",
    rarity: 0.04,
    color: "#A21CAF",
  },
  QCLR: {
    code: "QCLR",
    name: "通勤至上合居党",
    emoji: "🚆",
    tagline: "合租 + 通勤短 + 品质够，是务实的中高端选择",
    description:
      "你算过账——独居一居 8000，合租三居人均 4500，省下的 3500 是真金白银的生活费。你接受合租，但底线是通勤和居住品质。",
    loves: ["地铁通勤 25 分钟内", "三居人均 4000-5000", "精装"],
    cohort: "外企/互联网中级、有信任合租伙伴",
    opposite: "PESA",
    rarity: 0.06,
    color: "#0D9488",
  },
  QCLA: {
    code: "QCLA",
    name: "合居高颜值玩家",
    emoji: "🍃",
    tagline: "合住也要美，装修和阳台是底线",
    description:
      "你是合租里的'刺头'——绝不接受丑装修，绝不接受没阳台，绝不接受没采光。你愿意为这些把人均预算抬到独居线附近。",
    loves: ["精装三居", "南向阳台", "客厅落地窗"],
    cohort: "做内容/品牌的设计师、追求 Vibe 的合租党",
    opposite: "PESR",
    rarity: 0.04,
    color: "#BE185D",
  },
};

// ============================================================
// 主接口：从 result 算出完整人格画像
// ============================================================

export interface PersonaResult {
  /** 4 字母代号，如 "PELR" */
  code: string;
  /** 4 个轴的得分细节，按 P/E/S/R 顺序 */
  axes: [AxisScore, AxisScore, AxisScore, AxisScore];
  /** 完整元数据 */
  meta: PersonaMeta;
  /** 对照人格元数据（用于「你的反面是…」对话） */
  opposite: PersonaMeta;
  /** Top-3 维度（用于 tagline 内的金句） */
  top3: { attrId: string; importance: number }[];
}

export function computePersona(
  importance: Importance[],
  partWorths: PartWorth[]
): PersonaResult {
  const axisPQ = computePQ(importance);
  const axisEL = computeEL(importance);
  const axisSC = computeSC(importance, partWorths);
  const axisRA = computeRA(importance);

  const code = axisPQ.letter + axisEL.letter + axisSC.letter + axisRA.letter;

  // 如果字典里找不到（理论上 16 种都覆盖了），用一个通用 fallback
  const meta =
    PERSONA_DICT[code] ?? {
      code,
      name: "独特组合",
      emoji: "🧩",
      tagline: "你的偏好组合比较少见，是个有想法的租客",
      description: "你的 4 个轴显示出一个非典型的组合，这意味着你比大多数人更清楚自己想要什么。",
      loves: [],
      cohort: "稀有组合",
      opposite: code,
      rarity: 0.02,
      color: "#64748B",
    };

  const oppositeCode = meta.opposite;
  const opposite = PERSONA_DICT[oppositeCode] ?? meta;

  const top3 = [...importance]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3)
    .map((i) => ({ attrId: i.attrId, importance: i.importance }));

  return {
    code,
    axes: [axisPQ, axisEL, axisSC, axisRA],
    meta,
    opposite,
    top3,
  };
}
