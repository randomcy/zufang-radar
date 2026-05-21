# Mock 数据结构

所有数据放在 `/data/*.json`，build 时直接读，零后端。

## 一、房源（apartments.json）

```json
{
  "id": "apt_001",
  "title": "三里屯·朝阳门站精装一居",
  "communityId": "comm_001",
  "price": 7500,
  "roomType": "一居室",
  "area": 55,
  "floor": "中楼层",
  "buildingType": "板楼",
  "decoration": "精装",
  "subwayStation": "朝阳门",
  "subwayDistance": 350,
  "commuteToSampleCompany": 25,
  "tags": ["近地铁", "独卫", "可养宠", "有阳台", "有电梯"],
  "coordinates": { "lng": 116.434, "lat": 39.924 },
  "images": ["/mock/apt_001_1.jpg"],
  "description": "..."
}
```

预生成 30 套，覆盖：
- 价格区间：3000 / 5000 / 7500 / 10000+
- 房型：合租单间 / 整租开间 / 一居室 / 两居室
- 区域：三里屯 / 望京 / 国贸 / 中关村 / 通州 / 回龙观

## 二、小区（communities.json）

```json
{
  "id": "comm_001",
  "name": "三里屯 SOHO",
  "district": "朝阳区",
  "coordinates": { "lng": 116.434, "lat": 39.924 },
  "buildYear": 2010,
  "buildingType": "塔楼",
  "totalRating": 4.2,
  "subscores": {
    "noise": 3.5,
    "soundproof": 4.0,
    "property": 4.5,
    "safety": 4.3,
    "amenity": 4.8,
    "valueForMoney": 3.0
  },
  "pros": [
    {
      "title": "周边配套绝了",
      "summary": "楼下就是太古里和工体，餐厅咖啡馆密度全城 Top",
      "evidenceCount": 23
    },
    {
      "title": "交通极其方便",
      "summary": "10 号线 + 6 号线双线交汇，去哪都不用换乘",
      "evidenceCount": 18
    },
    {
      "title": "物业靠谱",
      "summary": "报修响应快，电梯维护好，保安专业",
      "evidenceCount": 12
    }
  ],
  "cons": [
    {
      "title": "性价比一般",
      "summary": "同等面积比周边贵 20-30%，溢价主要在地段",
      "evidenceCount": 28
    },
    {
      "title": "周末人多嘈杂",
      "summary": "太古里游客多，周末楼下人声鼎沸",
      "evidenceCount": 15
    },
    {
      "title": "户型紧凑",
      "summary": "新盘普遍开间小，没有传统大三居",
      "evidenceCount": 9
    }
  ],
  "suitableFor": ["年轻白领", "社交达人", "数字游民"],
  "notSuitableFor": ["需要安静的居家办公", "有小孩的家庭"],
  "postIds": ["post_001", "post_002", "post_003"]
}
```

预生成 10 个小区，分布在不同区域和价位。

## 三、小红书帖子（posts.json）

```json
{
  "id": "post_001",
  "communityId": "comm_001",
  "author": "在北漂的小鱼干",
  "authorAvatar": "/mock/avatar_001.jpg",
  "title": "三里屯 SOHO 住了一年的真实体验🏠",
  "content": "刚搬出来一周，趁记忆还新鲜聊聊...\n\n优点确实多到爆，下楼就是太古里，闺蜜来根本不愁吃喝。物业是真的好，有次半夜空调坏了报修，20 分钟就到了。\n\n但缺点也明显，周末根本不敢开窗，楼下太吵。而且租金真的贵，同样的钱往东走两站，能租大一倍...",
  "likes": 1247,
  "comments": 89,
  "tags": ["租房日记", "三里屯", "北漂"],
  "publishDate": "2025-03-15"
}
```

每个小区 20-30 条，用 GPT 批量生成，保证"真实感"。

## 四、Conjoint 题库（conjoint-config.json）

```json
{
  "attributes": [
    {
      "id": "price",
      "name": "月租价格",
      "icon": "💰",
      "levels": [
        { "id": "price_l1", "value": "3000 元", "numericValue": 3000 },
        { "id": "price_l2", "value": "5000 元", "numericValue": 5000 },
        { "id": "price_l3", "value": "7500 元", "numericValue": 7500 },
        { "id": "price_l4", "value": "10000 元", "numericValue": 10000 }
      ]
    },
    {
      "id": "roomType",
      "name": "房型",
      "icon": "🏠",
      "levels": [
        { "id": "room_l1", "value": "合租单间" },
        { "id": "room_l2", "value": "整租开间" },
        { "id": "room_l3", "value": "一居室" },
        { "id": "room_l4", "value": "两居室" }
      ]
    },
    {
      "id": "commute",
      "name": "通勤时间",
      "icon": "🚇",
      "levels": [
        { "id": "commute_l1", "value": "20 分钟内", "numericValue": 20 },
        { "id": "commute_l2", "value": "40 分钟内", "numericValue": 40 },
        { "id": "commute_l3", "value": "60 分钟内", "numericValue": 60 }
      ]
    },
    {
      "id": "decoration",
      "name": "装修档次",
      "icon": "✨",
      "levels": [
        { "id": "deco_l1", "value": "老破普装" },
        { "id": "deco_l2", "value": "普通装修" },
        { "id": "deco_l3", "value": "精装" },
        { "id": "deco_l4", "value": "网红装修" }
      ]
    },
    {
      "id": "community",
      "name": "小区品质",
      "icon": "🏢",
      "levels": [
        { "id": "comm_l1", "value": "老破小无物业" },
        { "id": "comm_l2", "value": "普通小区" },
        { "id": "comm_l3", "value": "优质物业小区" }
      ]
    },
    {
      "id": "building",
      "name": "楼栋类型",
      "icon": "🏗️",
      "levels": [
        { "id": "bld_l1", "value": "老破小" },
        { "id": "bld_l2", "value": "普通板楼" },
        { "id": "bld_l3", "value": "新塔楼" }
      ]
    }
  ],
  "binaryFilters": [
    { "id": "private_bath", "label": "必须独卫", "icon": "🛁" },
    { "id": "pet_friendly", "label": "必须能养宠物", "icon": "🐱" },
    { "id": "balcony", "label": "必须有阳台", "icon": "🌿" },
    { "id": "elevator", "label": "必须有电梯", "icon": "🛗" },
    { "id": "near_subway", "label": "步行 10 分钟到地铁", "icon": "🚇" }
  ]
}
```

## 五、目录结构

```
RentCheck/
├── README.md
├── docs/
│   ├── product-design.md
│   ├── dev-plan.md
│   ├── conjoint-algorithm.md
│   └── data-schema.md
├── data/
│   ├── apartments.json
│   ├── communities.json
│   ├── posts.json
│   └── conjoint-config.json
├── public/
│   └── mock/                  # mock 图片
├── src/
│   ├── app/
│   │   ├── page.tsx           # 首页
│   │   ├── quiz/page.tsx      # 场景 A 人格测试
│   │   ├── compare/page.tsx   # 场景 B 决策助手
│   │   ├── result/page.tsx    # 结果页（两个场景共用）
│   │   ├── map/page.tsx       # 功能二·通勤地图
│   │   └── community/[id]/page.tsx  # 功能三·小区体检
│   ├── components/
│   │   ├── ui/                # shadcn 组件
│   │   ├── quiz/              # 测试相关
│   │   ├── compare/           # 比较相关
│   │   ├── map/               # 地图相关
│   │   └── community/         # 小区相关
│   ├── lib/
│   │   ├── conjoint.ts        # conjoint 算法
│   │   ├── bradley-terry.ts   # BT 模型
│   │   ├── matching.ts        # 偏好匹配度计算
│   │   └── utils.ts
│   └── store/
│       └── preference.ts      # zustand store
├── package.json
└── next.config.js
```
