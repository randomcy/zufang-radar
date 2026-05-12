/**
 * Conjoint Analysis 算法实现（Phase 1）
 *
 * 工作流：
 *   generateQuestions(config, 8)       // 生成 8 道平衡题目
 *   ↓ 用户答题
 *   calculateUtilities(answers, config) // count-based part-worth
 *   ↓
 *   calculateAttributeWeights(utilities, config) // utility range -> 百分比
 *   ↓
 *   buildPreferenceResult(answers, config)       // 一键完整结果
 *
 * 参考 docs/conjoint-algorithm.md
 */
import type {
  AttributeWeight,
  ConjointAttribute,
  ConjointConfig,
  PreferenceResult,
  QuizAnswer,
  QuizOption,
  QuizQuestion,
} from "@/types";

// ============================================================
// 1. 题目生成：平衡设计（balanced design）
// ============================================================

/**
 * 为单个 attribute 生成一个"平衡的 level 序列"。
 *
 * 例如某 attribute 有 4 个 level，需要 8 个题位（A+B 各 8 = 16 个槽，
 * 但 A 和 B 分别要平衡，所以每边 8 个），那么序列里每个 level 出现 2 次，
 * 然后打乱。
 *
 * 这保证了所有 level 在测试里都被充分曝光，不会因为随机种子运气
 * 让某个 level 几乎不出现。
 */
function buildBalancedSequence<T>(items: T[], length: number, rand: () => number): T[] {
  const seq: T[] = [];
  while (seq.length < length) {
    // Fisher-Yates 洗牌（真随机）——避免 sort 在 V8 里的偏偏
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (const item of shuffled) {
      if (seq.length >= length) break;
      seq.push(item);
    }
  }
  return seq;
}

/**
 * 简单 LCG 伪随机，保证测试时可复现（如果需要 seed 的话）。
 * 这里只用 Math.random，足够 demo 使用。
 */
function defaultRand(): number {
  return Math.random();
}

/**
 * 生成 N 道平衡的 Conjoint 题目。
 *
 * 设计原则：
 * 1. 对每个 attribute，A 侧和 B 侧分别用 balanced 序列（确保 level 均匀曝光）
 * 2. 每道题 A 和 B 至少在一半 attribute 上不同（否则 trade-off 不存在）
 * 3. 不允许某道题 A 和 B 完全相同
 */
export function generateQuestions(
  config: ConjointConfig,
  count = 8
): QuizQuestion[] {
  const rand = defaultRand;
  const attributes = config.attributes;

  // 为每个 attribute 生成 A 侧和 B 侧的 level 序列（长度 = count）
  const sequencesA: Record<string, ConjointAttribute["levels"]> = {};
  const sequencesB: Record<string, ConjointAttribute["levels"]> = {};

  for (const attr of attributes) {
    sequencesA[attr.id] = buildBalancedSequence(attr.levels, count, rand);
    sequencesB[attr.id] = buildBalancedSequence(attr.levels, count, rand);
  }

  // 组装题目
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    let optionA: QuizOption = { levels: {} };
    let optionB: QuizOption = { levels: {} };

    for (const attr of attributes) {
      optionA.levels[attr.id] = sequencesA[attr.id][i];
      optionB.levels[attr.id] = sequencesB[attr.id][i];
    }

    // 校验：A 和 B 至少在 attributes.length / 2 个维度上不同
    const minDiff = Math.ceil(attributes.length / 2);
    const diffCount = attributes.filter(
      (attr) => optionA.levels[attr.id].id !== optionB.levels[attr.id].id
    ).length;

    if (diffCount < minDiff) {
      // 强制把 B 侧的前几个 attribute level 换成与 A 不同的
      let fixed = 0;
      for (const attr of attributes) {
        if (fixed + diffCount >= minDiff) break;
        if (optionA.levels[attr.id].id === optionB.levels[attr.id].id) {
          // 找一个不同的 level 顶上去
          const alt =
            attr.levels.find((l) => l.id !== optionA.levels[attr.id].id) ??
            attr.levels[0];
          optionB.levels[attr.id] = alt;
          fixed++;
        }
      }
    }

    questions.push({ id: i + 1, optionA, optionB });
  }

  return questions;
}

// ============================================================
// 2. Utility 计算：count-based part-worth
// ============================================================

/**
 * 基于用户的 8 个回答，计算每个 attribute 每个 level 的 part-worth utility。
 *
 * 算法（最简单工业可讲版本）：
 *   - 初始所有 level utility = 0
 *   - 每道题：胜方所有 level +1，败方所有 level -1
 *
 * 返回 { levelId: utility } 的映射。
 */
export function calculateUtilities(
  answers: QuizAnswer[],
  config: ConjointConfig
): Record<string, number> {
  const scores: Record<string, number> = {};

  // 初始化
  for (const attr of config.attributes) {
    for (const level of attr.levels) {
      scores[level.id] = 0;
    }
  }

  // 计票（只在两方该 attribute level 不同时才记票）
  //
  // 为什么这样改：如果 A 和 B 在某个 attribute 上 level 相同，那这个 attribute
  // 本来就没有 trade-off 信号——用户的选择跟这个维度无关。强行记票会稀释真正
  // 有差异维度的信号。
  for (const ans of answers) {
    const winner = ans.chosen === "A" ? ans.optionA : ans.optionB;
    const loser = ans.chosen === "A" ? ans.optionB : ans.optionA;

    for (const attrId in winner.levels) {
      const winLevel = winner.levels[attrId];
      const loseLevel = loser.levels[attrId];
      // 同 level 不记票
      if (winLevel.id === loseLevel.id) continue;
      scores[winLevel.id] += 1;
      scores[loseLevel.id] -= 1;
    }
  }

  return scores;
}

// ============================================================
// 3. Attribute 权重：utility range -> 百分比
// ============================================================

/**
 * 计算每个 attribute 的重要性权重。
 *
 * 采用「一致性打分」算法：对于每个 attribute，考查所有该维度存在
 * 差异的题目中，用户选择的胜方是否在此维度上一致偏向某一侧（高/低）。
 *
 * 为什么不用纯计票：纯计票会被“维度共变”污染（例如装修好的房也贵，
 * 用户在乎装修时会间接选贵的 level，让价格看起来也被在乎）。一致性打分看
 * 的是“用户在该维度上是否始终偏向同一个方向”，这才是“在乎”的真实信号。
 */
export function calculateAttributeWeights(
  answers: QuizAnswer[],
  config: ConjointConfig
): AttributeWeight[] {
  const scores: { attr: ConjointAttribute; score: number }[] = [];

  for (const attr of config.attributes) {
    // 收集该 attribute 上用户选择的 winner level 的“偏向分”
    //   - 如果该 level 有 numericValue（价格、通勤等可量化维度），用 numericValue 代表偏向
    //   - 如果没有 numericValue（房型、装修等分类变量），用 level index 代表偏向
    //
    // 然后统计：在所有该维度存在差异的题目里，用户选的胜方 level
    // 索引是否一致偏向高/低。偏向越一致，该维度越重要。

    let signedDiffSum = 0; // 累计有符号的 (winnerIdx - loserIdx)
    let totalAbsDiff = 0; // 总可能偏移量（用于归一化）

    const levelIdx = new Map<string, number>();
    attr.levels.forEach((l, idx) => levelIdx.set(l.id, idx));

    for (const ans of answers) {
      const winner = ans.chosen === "A" ? ans.optionA : ans.optionB;
      const loser = ans.chosen === "A" ? ans.optionB : ans.optionA;
      const wLevel = winner.levels[attr.id];
      const lLevel = loser.levels[attr.id];

      // 同 level 跳过——这道题该维度无信息
      if (wLevel.id === lLevel.id) continue;

      const wIdx = levelIdx.get(wLevel.id) ?? 0;
      const lIdx = levelIdx.get(lLevel.id) ?? 0;

      signedDiffSum += wIdx - lIdx;
      totalAbsDiff += Math.abs(wIdx - lIdx);
    }

    // 一致性强度 = |有符号总和| / 绝对值总和
    // 范围：0（随机选，不在乎） 到 1（每次都偏向同一端，非常在乎）
    const consistency = totalAbsDiff > 0 ? Math.abs(signedDiffSum) / totalAbsDiff : 0;

    // 为了让权重更有区分度，乘上「参与度」（该维度在题目里出现多少次差异）
    // 逻辑：如果某个维度只出现了 1 次差异，即使完全一致也不应该被赋予最高权重
    const participation = totalAbsDiff / (answers.length * (attr.levels.length - 1));
    const score = consistency * Math.pow(participation, 0.3); // 0.3 的次方让 participation 差别不过大

    scores.push({ attr, score });
  }

  const total = scores.reduce((sum, s) => sum + s.score, 0);

  if (total === 0) {
    return config.attributes.map((attr) => ({
      attributeId: attr.id,
      name: attr.name,
      icon: attr.icon,
      weight: 1 / config.attributes.length,
    }));
  }

  return scores.map(({ attr, score }) => ({
    attributeId: attr.id,
    name: attr.name,
    icon: attr.icon,
    weight: score / total,
  }));
}

// ============================================================
// 4. 人格标签生成
// ============================================================

/**
 * 基于 top-2 attribute 的组合给用户贴标签。
 * 比单一标签更有区分度（也更能让用户产生"懂我"的感觉）。
 */
export function inferPersonalityTag(weights: AttributeWeight[]): {
  tag: string;
  subTags: string[];
  description: string;
} {
  if (!weights.length) {
    return { tag: "全能均衡型", subTags: [], description: "你对各维度都没有特别强烈的偏好。" };
  }

  const sorted = [...weights].sort((a, b) => b.weight - a.weight);
  const top1 = sorted[0];
  const top2 = sorted[1];
  const bottom1 = sorted[sorted.length - 1];

  // 主标签：基于 top-1
  const mainTagMap: Record<string, string> = {
    price: "极致性价比型",
    roomType: "空间舒适型",
    commute: "通勤优先型",
    decoration: "颜值至上型",
    community: "品质生活型",
    building: "硬件挑剔型",
  };

  // 副标签：基于 top-2 和"可妥协"维度
  const subTagMap: Record<string, string> = {
    price: "对价格敏感",
    roomType: "在意空间感",
    commute: "在意通勤时间",
    decoration: "讲究装修",
    community: "看重小区品质",
    building: "在意楼栋类型",
  };

  const compromiseMap: Record<string, string> = {
    price: "不愿为价格妥协",
    roomType: "可以接受小户型",
    commute: "可以忍受长通勤",
    decoration: "不愿为颜值溢价",
    community: "对小区物业宽容",
    building: "对楼栋类型不挑",
  };

  const mainTag = mainTagMap[top1.attributeId] ?? "全能均衡型";
  const subTags = [
    subTagMap[top2.attributeId],
    compromiseMap[bottom1.attributeId],
  ].filter(Boolean);

  // 解读文案
  const desc =
    `你最看重 ${top1.name}（权重 ${(top1.weight * 100).toFixed(0)}%），` +
    `其次是 ${top2.name}（${(top2.weight * 100).toFixed(0)}%），` +
    `对 ${bottom1.name} 最为宽容（仅 ${(bottom1.weight * 100).toFixed(0)}%）。`;

  return { tag: mainTag, subTags, description: desc };
}

// ============================================================
// 5. 一键完整偏好结果
// ============================================================

export function buildPreferenceResult(
  answers: QuizAnswer[],
  config: ConjointConfig
): PreferenceResult {
  const weights = calculateAttributeWeights(answers, config);
  const sorted = [...weights].sort((a, b) => b.weight - a.weight);
  const personality = inferPersonalityTag(weights);

  return {
    weights, // 注意：保持 attributes 的原始顺序，便于雷达图轴顺序稳定
    sortedWeights: sorted,
    personalityTag: personality.tag,
    subTags: personality.subTags,
    description: personality.description,
    topAttributeId: sorted[0]?.attributeId ?? "",
    topAttributeName: sorted[0]?.name ?? "",
    bottomAttributeId: sorted[sorted.length - 1]?.attributeId ?? "",
    bottomAttributeName: sorted[sorted.length - 1]?.name ?? "",
    utilities: calculateUtilities(answers, config),
  };
}
