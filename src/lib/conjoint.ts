/**
 * Conjoint Analysis 算法占位实现
 *
 * Phase 0：mock 数据 + 简单随机配对
 * Phase 1：将实现正交设计 + 多项 Logit 估计
 *
 * 参考 docs/conjoint-algorithm.md
 */
import type {
  ConjointConfig,
  QuizQuestion,
  QuizAnswer,
  AttributeWeight,
  PreferenceResult,
} from "@/types";

/**
 * 生成 Conjoint 题目
 * Phase 0：随机配对生成（确保两个选项不完全相同）
 *
 * @param config Conjoint 配置
 * @param count  题目数量（默认 8）
 */
export function generateQuestions(
  config: ConjointConfig,
  count = 8
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const optionA: QuizQuestion["optionA"] = { levels: {} };
    const optionB: QuizQuestion["optionB"] = { levels: {} };

    for (const attr of config.attributes) {
      const idxA = Math.floor(Math.random() * attr.levels.length);
      let idxB = Math.floor(Math.random() * attr.levels.length);
      // 强制至少有 2 个 attribute 不同
      if (idxA === idxB && Math.random() > 0.3) {
        idxB = (idxA + 1) % attr.levels.length;
      }
      optionA.levels[attr.id] = attr.levels[idxA];
      optionB.levels[attr.id] = attr.levels[idxB];
    }

    questions.push({ id: i + 1, optionA, optionB });
  }
  return questions;
}

/**
 * 计算各 attribute level 的效用值（part-worth utility）
 *
 * Phase 0：占位
 * Phase 1：基于用户选择拟合多项 Logit / Bradley-Terry
 */
export function calculateUtilities(
  _answers: QuizAnswer[],
  _config: ConjointConfig
): Record<string, number> {
  // TODO: Phase 1 实现真正的 MLE 拟合
  return {};
}

/**
 * 计算每个 attribute 的相对权重
 *
 * Phase 0：返回 mock 权重（保证 6 项加起来 ≈ 1）
 * Phase 1：根据 utility range 算 importance
 */
export function calculateAttributeWeights(
  _answers: QuizAnswer[],
  config: ConjointConfig
): AttributeWeight[] {
  // 占位：用伪随机但稳定的权重（基于 answers 长度 seed）
  const mockWeights = [0.28, 0.22, 0.18, 0.14, 0.1, 0.08];
  return config.attributes.map((attr, i) => ({
    attributeId: attr.id,
    name: attr.name,
    icon: attr.icon,
    weight: mockWeights[i] ?? 0.05,
  }));
}

/**
 * 根据权重输出人格标签
 */
export function inferPersonalityTag(weights: AttributeWeight[]): string {
  if (!weights.length) return "未知型";
  const top = [...weights].sort((a, b) => b.weight - a.weight)[0];
  const map: Record<string, string> = {
    price: "性价比敏感型",
    roomType: "空间舒适型",
    commute: "通勤优先型",
    decoration: "颜值至上型",
    community: "品质生活型",
    building: "硬件挑剔型",
  };
  return map[top.attributeId] ?? "全能均衡型";
}

/**
 * 一键计算完整偏好结果
 */
export function buildPreferenceResult(
  answers: QuizAnswer[],
  config: ConjointConfig
): PreferenceResult {
  const weights = calculateAttributeWeights(answers, config);
  const personalityTag = inferPersonalityTag(weights);
  const top = [...weights].sort((a, b) => b.weight - a.weight)[0];
  return {
    weights,
    personalityTag,
    topAttributeId: top?.attributeId ?? "",
  };
}
