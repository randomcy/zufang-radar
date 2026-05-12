# 决策助手 · 差异维度设计

## 8 个核心差异维度（来自 quiz config 一致）
1. price · 月租金
2. roomType · 房型（合租间/一居室/两居室）
3. commuteMin · 通勤分钟数
4. decoration · 装修档次（普通/精装/品牌公寓）
5. communityQuality · 小区品质（老破小/普通/优质物业）
6. buildingType · 楼栋类型（老破小/普通/新塔楼）
7. area · 面积（㎡）
8. amenities · 配套（独卫/阳台/电梯/可养宠/近地铁）

## 差异档位
对每个数值维度，差异分 small / medium / large 三档：
- price: <1000 / 1000-2500 / >2500 元差
- commuteMin: <10 / 10-25 / >25 分钟差
- area: <10 / 10-25 / >25 ㎡差
- 枚举维度（roomType/decoration/communityQuality/buildingType）: 同档=small / 隔一档=medium / 跨大档=large
- amenities: 数量差对应

## 题面 schema
{
  "id": "p_price_large_a",
  "dimension": "price",
  "diffLevel": "large",
  "favoredSide": "B",      // 这条题面预设 B 是"省钱方"
  "title": "省下的钱够你做什么？",
  "body": "A 比 B 贵 {priceDiff} 元/月，一年下来差不多是 {yearDiff} 元——大概是一次东南亚旅行 + 一台 iPad。如果钱省下来不会让你住得心烦，这笔账其实很划算。",
  "options": [
    { "label": "我宁愿多花钱住得更舒服", "weight": { "price": -1 } },
    { "label": "省下来的钱更重要", "weight": { "price": +1 } }
  ]
}

## 目标数量
- 每个维度 × 3 档差距 × 2-3 个版本 = 约 60-72 条
- 加 6-8 条「平局/微差」收尾型 = 约 70 条
