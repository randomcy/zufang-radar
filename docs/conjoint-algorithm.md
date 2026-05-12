# Conjoint Analysis 算法说明

> 这份文档是面试时讲算法的脚本，也是代码实现的参考。

## 一、为什么用 Conjoint

### 用户的根本问题

直接问"你最在乎什么"，用户会回答**理想答案**，不是**真实答案**：

- 直接问："价格和地段你更看重什么？"
- 用户答："都重要"（毫无信息量）

但如果给两套房子做选择：
- A：5000 元，通勤 50 分钟
- B：7000 元，通勤 20 分钟

用户必须暴露偏好。**Conjoint 的核心思想**：通过强制 trade-off 揭示隐性权重。

### 这是成熟方法

Conjoint Analysis 由 Paul Green 在 1971 年提出，50 多年来：
- 宝洁用它做产品定价
- 苹果用它做 iPhone 配置策略
- Marriott 用它设计酒店服务包
- 制药公司用它做药品上市决策

不是噱头，是工业界标准方法。

## 二、我们的简化版算法

完整 Conjoint 需要正交实验设计（OED）和层次贝叶斯估计，48 小时做不完。我们做"工业够用版"。

### 数据结构

```ts
// 一个 attribute 的定义
type Attribute = {
  id: string;          // 如 "price"
  name: string;        // 如 "月租价格"
  levels: Level[];     // 该 attribute 的所有取值
};

type Level = {
  id: string;          // 如 "price_low"
  value: string;       // 如 "3000 元"
  numericValue?: number; // 如 3000，用于排序展示
};

// 一道题
type Question = {
  id: number;
  optionA: Record<string, string>; // {price: "price_low", room: "room_studio", ...}
  optionB: Record<string, string>;
};

// 用户回答
type Answer = {
  questionId: number;
  chosen: "A" | "B";
};
```

### 题目生成（关键）

**目标**：在 8 道题里让每个 attribute 的每个 level 都出现足够多次，且 attribute 之间不共变。

**简化策略**：
1. 用拉丁方设计生成 16 个"虚构房源"
2. 随机配对成 8 道题，确保每对的 attribute 取值差异大于 3
3. 这不是严格正交，但对 demo 足够

```ts
function generateQuestions(attributes: Attribute[]): Question[] {
  const profiles = generateLatinSquareProfiles(attributes, 16);
  const questions: Question[] = [];
  for (let i = 0; i < 8; i++) {
    questions.push({
      id: i,
      optionA: profiles[i * 2],
      optionB: profiles[i * 2 + 1],
    });
  }
  return questions;
}
```

### Utility 计算

```ts
function calculateUtilities(
  attributes: Attribute[],
  questions: Question[],
  answers: Answer[]
): Record<string, number> {
  // levelId → score
  const scores: Record<string, number> = {};

  // 初始化所有 level 为 0
  attributes.forEach(attr => {
    attr.levels.forEach(level => {
      scores[level.id] = 0;
    });
  });

  // 每道题的"获胜方"所有 level +1，"失败方" -1
  answers.forEach(ans => {
    const q = questions.find(q => q.id === ans.questionId)!;
    const winner = ans.chosen === "A" ? q.optionA : q.optionB;
    const loser = ans.chosen === "A" ? q.optionB : q.optionA;
    Object.values(winner).forEach(levelId => scores[levelId] += 1);
    Object.values(loser).forEach(levelId => scores[levelId] -= 1);
  });

  return scores;
}
```

### Attribute 权重

```ts
function calculateAttributeWeights(
  attributes: Attribute[],
  utilities: Record<string, number>
): Record<string, number> {
  const ranges: Record<string, number> = {};

  attributes.forEach(attr => {
    const levelUtilities = attr.levels.map(l => utilities[l.id]);
    ranges[attr.id] = Math.max(...levelUtilities) - Math.min(...levelUtilities);
  });

  // 归一化为百分比
  const total = Object.values(ranges).reduce((a, b) => a + b, 0);
  const weights: Record<string, number> = {};
  Object.entries(ranges).forEach(([attrId, range]) => {
    weights[attrId] = total > 0 ? (range / total) * 100 : 0;
  });

  return weights;
}
```

### 人格标签生成

基于权重分布给用户贴标签：

```ts
function generatePersonality(weights: Record<string, number>): string {
  const sorted = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];

  const tagMap: Record<string, string> = {
    price: "极致性价比型",
    commute: "通勤优先型",
    decoration: "品质生活型",
    community: "安全感优先型",
    roomType: "空间优先型",
    building: "细节讲究型",
  };

  return tagMap[top] || "均衡型";
}
```

## 三、场景 B 的 Bradley-Terry 模型

### 算法

Bradley-Terry 是用两两比较结果估计候选实力的经典模型：

```
P(i beats j) = strength_i / (strength_i + strength_j)
```

用极大似然估计（MLE）解每个候选的 strength。

### 简化实现

我们用迭代版本（10-20 次迭代就收敛）：

```ts
function bradleyTerry(
  candidates: string[],
  pairwiseResults: { winner: string; loser: string }[]
): Record<string, number> {
  const strength: Record<string, number> = {};
  candidates.forEach(c => strength[c] = 1.0);

  // 统计 wins
  const wins: Record<string, number> = {};
  candidates.forEach(c => wins[c] = 0);
  pairwiseResults.forEach(r => wins[r.winner]++);

  // 迭代 20 次
  for (let iter = 0; iter < 20; iter++) {
    const newStrength: Record<string, number> = {};
    candidates.forEach(i => {
      let denominator = 0;
      pairwiseResults.forEach(r => {
        if (r.winner === i || r.loser === i) {
          const opponent = r.winner === i ? r.loser : r.winner;
          denominator += 1 / (strength[i] + strength[opponent]);
        }
      });
      newStrength[i] = denominator > 0 ? wins[i] / denominator : strength[i];
    });
    // 归一化
    const total = Object.values(newStrength).reduce((a, b) => a + b, 0);
    candidates.forEach(c => strength[c] = newStrength[c] / total * candidates.length);
  }

  return strength;
}
```

### 解释生成

```ts
function explainRanking(
  ranking: string[],
  candidates: Candidate[],
  pairwiseResults: PairResult[]
): string {
  // 统计在所有"胜出"比较里，哪个 attribute 差异最大
  // 那个就是用户最看重的
  // ...
  return `在 ${pairwiseResults.length} 次比较中，
          你 ${winCount} 次选择了 ${attribute} 更优的房源，
          这是你做决策的核心因素。`;
}
```

## 四、面试可能被问的问题

**Q：8 道题怎么能算准？工业界 Conjoint 至少 20 题。**

A：你说得对，严格 Conjoint 需要更多样本量保证统计显著性。我这里做了几个简化：
1. 每题给 6 个 attribute 一起 trade-off，信息密度高
2. 用拉丁方而非完全正交设计，牺牲一些精度换取题量
3. 输出的是相对权重而非绝对 utility，对噪音不敏感

如果做生产版本，我会用 Adaptive Conjoint（根据回答动态生成下一题）+ 层次贝叶斯估计。

**Q：用户乱选怎么办？**

A：可以加 "consistency check"——重复出现 1-2 道题，检查用户回答是否一致。不一致就提示重做。生产版本可以做注意力机制题（如显示一道明显的题，看用户是否在认真做）。

**Q：为什么不直接让用户拖滑块设权重？**

A：因为用户分不清"重要"和"非常重要"的差别，但能在具体房子里做选择。Conjoint 把抽象偏好转化为具体决策，认知负担更低，结果更准。
