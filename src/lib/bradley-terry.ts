/**
 * Bradley-Terry 模型：用两两比较的胜负数据估计候选项的相对排名
 *
 * Phase 0：函数签名占位 + 简单 mock 实现
 * Phase 1：实现 MM 算法 / Newton-Raphson 迭代
 */

export interface BradleyTerryInput {
  /** 候选项 id 列表 */
  items: string[];
  /** 比较结果：[winnerId, loserId][] */
  comparisons: Array<[string, string]>;
  /** 最大迭代次数 */
  maxIter?: number;
  /** 收敛阈值 */
  tolerance?: number;
}

export interface BradleyTerryResult {
  /** 每个 item 的相对实力分数 */
  scores: Record<string, number>;
  /** 排序后的 items（强 -> 弱） */
  ranking: string[];
}

/**
 * Bradley-Terry 模型主函数
 *
 * Phase 0：mock 实现——按出现频次返回伪 score
 * Phase 1：完整实现 MM 算法
 */
export function bradleyTerry(input: BradleyTerryInput): BradleyTerryResult {
  const { items, comparisons } = input;
  const scores: Record<string, number> = {};
  for (const id of items) scores[id] = 1; // 初始等权重

  // 占位实现：每赢一次 score +0.2，每输一次 -0.1
  for (const [winner, loser] of comparisons) {
    if (scores[winner] !== undefined) scores[winner] += 0.2;
    if (scores[loser] !== undefined) scores[loser] -= 0.1;
  }

  const ranking = [...items].sort((a, b) => scores[b] - scores[a]);
  return { scores, ranking };
}
