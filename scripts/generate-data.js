/**
 * 生成 mock 数据：apartments.json / communities.json / posts.json / conjoint-config.json
 *
 * 使用方法：node scripts/generate-data.js
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------- 1. conjoint-config.json ----------
const conjointConfig = {
  attributes: [
    {
      id: "price",
      name: "月租价格",
      icon: "💰",
      levels: [
        { id: "price_l1", value: "3000 元", numericValue: 3000 },
        { id: "price_l2", value: "5000 元", numericValue: 5000 },
        { id: "price_l3", value: "7500 元", numericValue: 7500 },
        { id: "price_l4", value: "10000 元", numericValue: 10000 },
      ],
    },
    {
      id: "roomType",
      name: "房型",
      icon: "🏠",
      levels: [
        { id: "room_l1", value: "合租单间" },
        { id: "room_l2", value: "整租开间" },
        { id: "room_l3", value: "一居室" },
        { id: "room_l4", value: "两居室" },
      ],
    },
    {
      id: "commute",
      name: "通勤时间",
      icon: "🚇",
      levels: [
        { id: "commute_l1", value: "20 分钟内", numericValue: 20 },
        { id: "commute_l2", value: "40 分钟内", numericValue: 40 },
        { id: "commute_l3", value: "60 分钟内", numericValue: 60 },
      ],
    },
    {
      id: "decoration",
      name: "装修档次",
      icon: "✨",
      levels: [
        { id: "deco_l1", value: "老破普装" },
        { id: "deco_l2", value: "普通装修" },
        { id: "deco_l3", value: "精装" },
        { id: "deco_l4", value: "网红装修" },
      ],
    },
    {
      id: "community",
      name: "小区品质",
      icon: "🏢",
      levels: [
        { id: "comm_l1", value: "老破小无物业" },
        { id: "comm_l2", value: "普通小区" },
        { id: "comm_l3", value: "优质物业小区" },
      ],
    },
    {
      id: "building",
      name: "楼栋类型",
      icon: "🏗️",
      levels: [
        { id: "bld_l1", value: "老破小" },
        { id: "bld_l2", value: "普通板楼" },
        { id: "bld_l3", value: "新塔楼" },
      ],
    },
  ],
  binaryFilters: [
    { id: "private_bath", label: "必须独卫", icon: "🛁" },
    { id: "pet_friendly", label: "必须能养宠物", icon: "🐱" },
    { id: "balcony", label: "必须有阳台", icon: "🌿" },
    { id: "elevator", label: "必须有电梯", icon: "🛗" },
    { id: "near_subway", label: "步行 10 分钟到地铁", icon: "🚇" },
  ],
};

fs.writeFileSync(
  path.join(DATA_DIR, "conjoint-config.json"),
  JSON.stringify(conjointConfig, null, 2),
  "utf8"
);

// ---------- 2. communities.json ----------
// 10 个虚构小区，覆盖北京主要区域
const communitiesRaw = [
  {
    id: "comm_001",
    name: "三里屯·朝阳门 SOHO 公寓",
    district: "朝阳区",
    area: "三里屯/朝阳门",
    coordinates: { lng: 116.434, lat: 39.924 },
    buildYear: 2010,
    buildingType: "塔楼",
    totalRating: 4.2,
    subscores: { noise: 3.2, soundproof: 3.8, property: 4.5, safety: 4.3, amenity: 4.9, valueForMoney: 3.0 },
    pros: [
      { title: "周边配套绝了", summary: "楼下就是太古里和工体，餐厅咖啡馆密度全城 Top", evidenceCount: 23 },
      { title: "10 号线 6 号线交汇", summary: "去哪都不用换乘，国贸 15 分钟，西单 20 分钟", evidenceCount: 18 },
      { title: "物业是真爱粉", summary: "报修响应快，电梯维护好，半夜空调坏了 20 分钟有人到", evidenceCount: 12 },
    ],
    cons: [
      { title: "性价比一言难尽", summary: "同等面积比周边贵 20-30%，溢价全在地段", evidenceCount: 28 },
      { title: "周末楼下吵到怀疑人生", summary: "太古里游客多，凌晨两点还有酒吧街声音", evidenceCount: 15 },
      { title: "户型紧凑像鸽子笼", summary: "新盘开间普遍 30 平起，没有传统大户型", evidenceCount: 9 },
    ],
    suitableFor: ["年轻白领", "社交达人", "数字游民"],
    notSuitableFor: ["居家办公需要安静", "有小孩的家庭"],
    postIds: ["post_001", "post_002", "post_003", "post_004"],
  },
  {
    id: "comm_002",
    name: "望京·阿里西溪国际",
    district: "朝阳区",
    area: "望京",
    coordinates: { lng: 116.477, lat: 39.997 },
    buildYear: 2008,
    buildingType: "塔楼",
    totalRating: 4.4,
    subscores: { noise: 4.0, soundproof: 4.0, property: 4.4, safety: 4.6, amenity: 4.5, valueForMoney: 4.0 },
    pros: [
      { title: "互联网人天堂", summary: "阿里、字节、美团都在 1 公里内，骑车 10 分钟到工位", evidenceCount: 31 },
      { title: "韩餐烤肉吃到饱", summary: "望京小街韩国料理一条街，下班直接续摊", evidenceCount: 20 },
      { title: "小区绿化超治愈", summary: "中央花园很大，晚上跑步遛狗的人很多", evidenceCount: 14 },
    ],
    cons: [
      { title: "早高峰地铁人贴人", summary: "15 号线望京站 8 点半挤到怀疑人生", evidenceCount: 22 },
      { title: "停车位永远不够", summary: "晚上 9 点回来基本没位，得停到隔壁小区", evidenceCount: 13 },
      { title: "餐饮单价偏贵", summary: "互联网公司多，餐厅人均比朝阳普通区贵 30%", evidenceCount: 10 },
    ],
    suitableFor: ["互联网打工人", "夜猫子", "韩餐爱好者"],
    notSuitableFor: ["预算极低的实习生", "讨厌人多的人"],
    postIds: ["post_005", "post_006", "post_007", "post_008"],
  },
  {
    id: "comm_003",
    name: "国贸·CBD 国际公寓",
    district: "朝阳区",
    area: "国贸/CBD",
    coordinates: { lng: 116.461, lat: 39.908 },
    buildYear: 2012,
    buildingType: "塔楼",
    totalRating: 4.0,
    subscores: { noise: 3.0, soundproof: 4.2, property: 4.7, safety: 4.7, amenity: 4.5, valueForMoney: 2.8 },
    pros: [
      { title: "金融民工通勤神器", summary: "走 5 分钟到国贸三期，再也不用挤地铁", evidenceCount: 27 },
      { title: "门禁安保堪比酒店", summary: "三道门禁 + 24 小时保安 + 监控全覆盖", evidenceCount: 17 },
      { title: "高楼层景观炸裂", summary: "30 楼以上能看到 CBD 整片夜景，朋友来都不肯走", evidenceCount: 11 },
    ],
    cons: [
      { title: "贵到肉疼", summary: "一居室 12k 起步，社畜两个月工资就没了", evidenceCount: 35 },
      { title: "周末空城感", summary: "周末楼下店铺很多不开，要找吃的得打车", evidenceCount: 14 },
      { title: "电梯排队等不停", summary: "早晚高峰电梯能等 5 分钟以上，迟到不要紧吧", evidenceCount: 8 },
    ],
    suitableFor: ["金融民工", "外企高管", "短期出差党"],
    notSuitableFor: ["预算有限的年轻人", "需要烟火气的人"],
    postIds: ["post_009", "post_010", "post_011"],
  },
  {
    id: "comm_004",
    name: "中关村·海淀黄庄学区房",
    district: "海淀区",
    area: "中关村/海淀黄庄",
    coordinates: { lng: 116.314, lat: 39.983 },
    buildYear: 1998,
    buildingType: "板楼",
    totalRating: 3.8,
    subscores: { noise: 3.5, soundproof: 3.0, property: 3.5, safety: 4.2, amenity: 4.0, valueForMoney: 3.8 },
    pros: [
      { title: "理工科码农聚集地", summary: "字节、百度、新东方都在 2 公里内，骑车好到爆", evidenceCount: 24 },
      { title: "教育资源拉满", summary: "周边人大附中、清华附小，连补课班都是顶配", evidenceCount: 19 },
      { title: "美食低调但实在", summary: "海淀黄庄的西少爷、好伦哥、小串店，人均 30 吃饱", evidenceCount: 12 },
    ],
    cons: [
      { title: "楼龄真的老", summary: "90 年代的房子，水管老化，冬天暖气也有点凉", evidenceCount: 21 },
      { title: "隔音是个谜", summary: "隔壁说话能听清，凌晨敲键盘都能传过来", evidenceCount: 18 },
      { title: "停车场永远满", summary: "老小区车位紧张，外来车停车费 10 元/小时", evidenceCount: 9 },
    ],
    suitableFor: ["程序员", "考研党", "有学龄孩子家庭"],
    notSuitableFor: ["注重装修和品质的人", "不愿意忍受老楼的人"],
    postIds: ["post_012", "post_013", "post_014", "post_015"],
  },
  {
    id: "comm_005",
    name: "五道口·宇宙中心青年社区",
    district: "海淀区",
    area: "五道口",
    coordinates: { lng: 116.337, lat: 39.992 },
    buildYear: 2005,
    buildingType: "板楼",
    totalRating: 4.1,
    subscores: { noise: 3.0, soundproof: 3.5, property: 4.0, safety: 4.4, amenity: 4.6, valueForMoney: 4.2 },
    pros: [
      { title: "夜生活永不打烊", summary: "清华北大旁边，凌晨 2 点烧烤店还在排队", evidenceCount: 26 },
      { title: "韩餐韩货一条街", summary: "雪绒花、姜虎东、各种韩国超市，比首尔还方便", evidenceCount: 18 },
      { title: "13 号线 + 15 号线", summary: "去望京 15 分钟，去回龙观也很快", evidenceCount: 14 },
    ],
    cons: [
      { title: "学生太多，吵到飞起", summary: "宿舍楼围着我，开学季楼下迎新喊话能持续一周", evidenceCount: 22 },
      { title: "性价比开始下滑", summary: "这两年涨得厉害，单间已经到 4000+ 了", evidenceCount: 13 },
      { title: "电梯坏的概率高", summary: "老楼电梯一年坏 3 次，爬 7 楼真的会哭", evidenceCount: 10 },
    ],
    suitableFor: ["留学生", "学生党", "互联网年轻人"],
    notSuitableFor: ["注重安静的人", "讨厌学生氛围的人"],
    postIds: ["post_016", "post_017", "post_018", "post_019"],
  },
  {
    id: "comm_006",
    name: "回龙观·龙泽苑东区",
    district: "昌平区",
    area: "回龙观",
    coordinates: { lng: 116.337, lat: 40.075 },
    buildYear: 2003,
    buildingType: "板楼",
    totalRating: 3.9,
    subscores: { noise: 4.2, soundproof: 3.8, property: 3.5, safety: 4.0, amenity: 3.8, valueForMoney: 4.7 },
    pros: [
      { title: "便宜！便宜！便宜！", summary: "一居室 4000 出头，比朝阳便宜一半还多", evidenceCount: 33 },
      { title: "码农刚需根据地", summary: "13 号线直达西二旗，互联网公司随便选", evidenceCount: 21 },
      { title: "生活配套挺成熟", summary: "回龙观体育公园、龙域中心都在 1 公里内", evidenceCount: 15 },
    ],
    cons: [
      { title: "早高峰挤到怀疑人生", summary: "13 号线霍营到西二旗，每天像沙丁鱼罐头", evidenceCount: 30 },
      { title: "回家就跟出差一样", summary: "市区聚会回来要 1.5 小时，社交基本断了", evidenceCount: 16 },
      { title: "物业松散", summary: "楼道堆杂物没人管，电梯报修要催 3 遍", evidenceCount: 9 },
    ],
    suitableFor: ["西二旗码农", "预算有限的年轻人", "省钱攒钱党"],
    notSuitableFor: ["需要市区夜生活", "讨厌长通勤"],
    postIds: ["post_020", "post_021", "post_022"],
  },
  {
    id: "comm_007",
    name: "通州·新华联家园",
    district: "通州区",
    area: "通州",
    coordinates: { lng: 116.658, lat: 39.909 },
    buildYear: 2014,
    buildingType: "塔楼",
    totalRating: 4.0,
    subscores: { noise: 4.3, soundproof: 4.0, property: 4.1, safety: 4.2, amenity: 3.8, valueForMoney: 4.5 },
    pros: [
      { title: "副中心红利肉眼可见", summary: "环球影城开了之后周边升级超快，地铁 7 号线也通了", evidenceCount: 19 },
      { title: "新房新装修舒服", summary: "10 年内的楼龄，户型方正，电梯不抢人", evidenceCount: 15 },
      { title: "通州餐饮性价比高", summary: "万达广场什么都有，人均比朝阳低 30%", evidenceCount: 12 },
    ],
    cons: [
      { title: "进城真的远", summary: "去国贸一趟单程 50 分钟起，下班晚根本不想动", evidenceCount: 25 },
      { title: "6 号线 7 号线高峰挤爆", summary: "果园站早上根本上不去，要等 3 班车", evidenceCount: 18 },
      { title: "夜生活几乎为零", summary: "晚上 10 点之后街上没人，叫不到滴滴", evidenceCount: 11 },
    ],
    suitableFor: ["通州工作的人", "预算中等的家庭", "环球影城粉"],
    notSuitableFor: ["在国贸/中关村上班的人", "夜店咖"],
    postIds: ["post_023", "post_024", "post_025"],
  },
  {
    id: "comm_008",
    name: "十里堡·泛海国际",
    district: "朝阳区",
    area: "十里堡",
    coordinates: { lng: 116.484, lat: 39.927 },
    buildYear: 2009,
    buildingType: "塔楼",
    totalRating: 4.3,
    subscores: { noise: 3.8, soundproof: 4.2, property: 4.6, safety: 4.5, amenity: 4.4, valueForMoney: 4.1 },
    pros: [
      { title: "性价比之王", summary: "比三里屯便宜 30%，但去国贸就 10 分钟车程", evidenceCount: 22 },
      { title: "6 号线一站到朝阳门", summary: "通勤朝阳门、东四的人非常省事", evidenceCount: 17 },
      { title: "华堂商场是隐藏宝藏", summary: "全北京最完整的日式百货，地下日料超正宗", evidenceCount: 13 },
    ],
    cons: [
      { title: "周边夜生活偏少", summary: "晚上 10 点之后街上都打烊了，不如三里屯热闹", evidenceCount: 14 },
      { title: "高峰时段电梯等很久", summary: "塔楼住户多，早 8 点电梯能等 5 分钟", evidenceCount: 9 },
      { title: "户型偏小", summary: "一居室 45 平起，能用但不算宽敞", evidenceCount: 8 },
    ],
    suitableFor: ["朝阳门/国贸通勤", "想要性价比的人", "日料爱好者"],
    notSuitableFor: ["需要丰富夜生活", "追求大户型"],
    postIds: ["post_026", "post_027", "post_028"],
  },
  {
    id: "comm_009",
    name: "双井·苹果社区",
    district: "朝阳区",
    area: "双井",
    coordinates: { lng: 116.464, lat: 39.895 },
    buildYear: 2007,
    buildingType: "塔楼",
    totalRating: 4.5,
    subscores: { noise: 4.0, soundproof: 4.3, property: 4.7, safety: 4.6, amenity: 4.7, valueForMoney: 4.0 },
    pros: [
      { title: "颜值即正义", summary: "苹果社区设计感拉满，住进来像住在 ins 照片里", evidenceCount: 25 },
      { title: "富力广场吃喝玩乐全包", summary: "下楼就是富力广场，电影、健身、商场一站搞定", evidenceCount: 18 },
      { title: "物业是真懂租客", summary: "宠物友好，可以挂窗帘，不像有些小区一堆禁令", evidenceCount: 16 },
    ],
    cons: [
      { title: "10 号线高峰挤", summary: "双井站早上能等好几班车，肉墙肉海", evidenceCount: 20 },
      { title: "网红打卡人多", summary: "周末楼下经常有人拍照，影响隐私", evidenceCount: 11 },
      { title: "租金涨得快", summary: "去年到今年涨了 500-800，业主有点飘", evidenceCount: 12 },
    ],
    suitableFor: ["年轻夫妻", "设计师", "追求生活品质"],
    notSuitableFor: ["预算紧张", "讨厌人多"],
    postIds: ["post_029", "post_030", "post_031"],
  },
  {
    id: "comm_010",
    name: "亚运村·安慧北里",
    district: "朝阳区",
    area: "亚运村",
    coordinates: { lng: 116.42, lat: 40.0 },
    buildYear: 1995,
    buildingType: "板楼",
    totalRating: 3.7,
    subscores: { noise: 4.2, soundproof: 3.2, property: 3.4, safety: 4.0, amenity: 4.1, valueForMoney: 4.4 },
    pros: [
      { title: "老北京味道浓郁", summary: "楼下就是国家奥体中心，早上大爷大妈遛弯特别治愈", evidenceCount: 17 },
      { title: "性价比不错", summary: "5 号线 + 8 号线，4500 能租一居室", evidenceCount: 14 },
      { title: "公园比朝阳多", summary: "奥森公园 + 元大都遗址，周末跑步好去处", evidenceCount: 13 },
    ],
    cons: [
      { title: "老楼问题一堆", summary: "水压不稳定，厨房卫生间瓷砖老旧，住得有点凑合", evidenceCount: 19 },
      { title: "隔音真的差", summary: "邻居半夜上厕所都能听见，敏感的人会崩溃", evidenceCount: 15 },
      { title: "没电梯爬楼", summary: "6 层老板楼基本没电梯，搬家时哭出声", evidenceCount: 10 },
    ],
    suitableFor: ["预算中等想住北边", "喜欢老北京氛围", "锻炼狂人"],
    notSuitableFor: ["怕老房子的人", "对装修要求高"],
    postIds: ["post_032", "post_033", "post_034"],
  },
];

fs.writeFileSync(
  path.join(DATA_DIR, "communities.json"),
  JSON.stringify(communitiesRaw, null, 2),
  "utf8"
);

// ---------- 3. apartments.json ----------
// 每个小区 3 套房源 = 30 套
const TAGS_POOL = ["近地铁", "独卫", "可养宠", "有阳台", "有电梯", "拎包入住", "采光好", "新装修", "可短租", "押一付一"];

function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

const ROOM_TYPES = ["合租单间", "整租开间", "一居室", "两居室"];
const FLOORS = ["低楼层", "中楼层", "高楼层"];
const DECORATIONS = ["老破普装", "普通装修", "精装", "网红装修"];
const BUILDING_TYPES = ["板楼", "塔楼"];

// 每个小区典型房源（手写以保证质量）
const apartmentSpecs = [
  // comm_001 三里屯
  { communityId: "comm_001", title: "三里屯·朝阳门站精装一居", price: 7500, roomType: "一居室", area: 55, subwayStation: "朝阳门", subwayDistance: 350, commute: 25, description: "窗外是国贸 CBD 夜景，走 5 分钟到朝阳门地铁站，10 号线 6 号线随便选。客厅采光特别好，下午能晒到太阳。" },
  { communityId: "comm_001", title: "三里屯 SOHO 网红开间", price: 6800, roomType: "整租开间", area: 38, subwayStation: "团结湖", subwayDistance: 280, commute: 22, description: "楼下就是太古里，闺蜜约咖啡不用打车。装修是去年翻新的，全屋智能灯，气氛拉满。" },
  { communityId: "comm_001", title: "工体北路两居·适合合租", price: 11000, roomType: "两居室", area: 88, subwayStation: "东四十条", subwayDistance: 450, commute: 28, description: "工体改造后再回来看就觉得人间值得，两个卧室带飘窗，主卧能看到工体的夜景。" },

  // comm_002 望京
  { communityId: "comm_002", title: "望京阿里西溪一居·南向", price: 6500, roomType: "一居室", area: 60, subwayStation: "望京", subwayDistance: 500, commute: 18, description: "骑车 8 分钟到字节，地铁 15 号线一站到将台。小区中央花园特别大，早上跑步很爽。" },
  { communityId: "comm_002", title: "望京 SOHO 旁合租单间", price: 3500, roomType: "合租单间", area: 18, subwayStation: "望京", subwayDistance: 380, commute: 20, description: "三人合租，主卧带独卫和飘窗。室友都是互联网行业，相处特别舒服。" },
  { communityId: "comm_002", title: "望京·南湖东园两居", price: 9000, roomType: "两居室", area: 92, subwayStation: "望京南", subwayDistance: 600, commute: 25, description: "南北通透的板楼，70 多平方米的客厅，楼下就是韩国超市。物业的大叔特别热情。" },

  // comm_003 国贸
  { communityId: "comm_003", title: "国贸三期旁高层一居", price: 11500, roomType: "一居室", area: 50, subwayStation: "国贸", subwayDistance: 200, commute: 8, description: "34 楼，能看到整个 CBD 夜景，朋友来都拍照拍到不想走。下楼就是国贸三期，金融民工救星。" },
  { communityId: "comm_003", title: "CBD 高端开间·短租可", price: 9800, roomType: "整租开间", area: 42, subwayStation: "永安里", subwayDistance: 350, commute: 12, description: "酒店式公寓，可以月付，下楼是 SKP。客户来北京我经常直接推荐这里。" },
  { communityId: "comm_003", title: "国贸·东三环两居", price: 13500, roomType: "两居室", area: 95, subwayStation: "国贸", subwayDistance: 400, commute: 15, description: "中央空调 + 地暖 + 智能门锁，住进来真的有种豪华酒店的感觉。物业不愧是号称北京 Top 3。" },

  // comm_004 中关村
  { communityId: "comm_004", title: "中关村·海淀黄庄一居", price: 6800, roomType: "一居室", area: 58, subwayStation: "海淀黄庄", subwayDistance: 320, commute: 12, description: "走路 12 分钟到字节中关村，房东人特别好，家电都是新换的。但隔音是真的薄。" },
  { communityId: "comm_004", title: "中关村合租主卧·程序员友好", price: 3800, roomType: "合租单间", area: 16, subwayStation: "中关村", subwayDistance: 280, commute: 10, description: "四人合租，主卧带独卫，室友三个码农一个产品经理，凌晨敲键盘没人嫌弃。" },
  { communityId: "comm_004", title: "海淀黄庄·学区房两居", price: 9500, roomType: "两居室", area: 85, subwayStation: "海淀黄庄", subwayDistance: 250, commute: 15, description: "正经学区房，旁边就是人大附小。楼是 98 年的，装修去年翻新过，住着体面。" },

  // comm_005 五道口
  { communityId: "comm_005", title: "五道口宇宙中心开间", price: 5500, roomType: "整租开间", area: 36, subwayStation: "五道口", subwayDistance: 220, commute: 16, description: "13 号线一站到知春路，五道口购物中心下楼就是。窗外能看到清华园，很有大学城感觉。" },
  { communityId: "comm_005", title: "五道口华清嘉园合租", price: 4200, roomType: "合租单间", area: 17, subwayStation: "五道口", subwayDistance: 180, commute: 14, description: "二人合租，主卧带飘窗，室友韩国人特别热情，经常给我送泡菜。" },
  { communityId: "comm_005", title: "五道口·智慧大厦一居", price: 7200, roomType: "一居室", area: 52, subwayStation: "五道口", subwayDistance: 350, commute: 18, description: "13 号线 + 15 号线双地铁，去望京也方便。楼下就是雪绒花韩餐和五道口购物中心。" },

  // comm_006 回龙观
  { communityId: "comm_006", title: "回龙观龙泽一居·西二旗通勤神器", price: 4500, roomType: "一居室", area: 50, subwayStation: "龙泽", subwayDistance: 280, commute: 30, description: "13 号线一站到西二旗，骑共享单车 15 分钟到百度。性价比真的高，4500 能租到这种品质。" },
  { communityId: "comm_006", title: "回龙观合租单间·性价比之王", price: 2800, roomType: "合租单间", area: 14, subwayStation: "霍营", subwayDistance: 350, commute: 35, description: "三人合租，独立卫生间。室友都是西二旗码农，每天 7:30 一起出门挤地铁，奇怪的战友情。" },
  { communityId: "comm_006", title: "龙域中心精装两居", price: 6800, roomType: "两居室", area: 80, subwayStation: "龙泽", subwayDistance: 400, commute: 32, description: "板楼方正户型，南北通透。下楼就是龙域中心万象汇，附近还有回龙观体育公园。" },

  // comm_007 通州
  { communityId: "comm_007", title: "通州·新华联家园一居", price: 4800, roomType: "一居室", area: 56, subwayStation: "通州北苑", subwayDistance: 320, commute: 40, description: "7 号线 + 6 号线，到环球影城打个车 10 分钟。家电是新换的，户型方正。" },
  { communityId: "comm_007", title: "通州·万达精装开间", price: 4200, roomType: "整租开间", area: 40, subwayStation: "九棵树", subwayDistance: 280, commute: 38, description: "通州万达广场旁边，下楼啥都有。地铁直达国贸 40 分钟，能接受的话超划算。" },
  { communityId: "comm_007", title: "通州两居·适合家庭", price: 6500, roomType: "两居室", area: 90, subwayStation: "土桥", subwayDistance: 380, commute: 45, description: "副中心房子，邻居很多年轻夫妻有娃。小区绿化好，遛娃溜娃溜宠物都方便。" },

  // comm_008 十里堡
  { communityId: "comm_008", title: "十里堡·泛海国际一居", price: 7200, roomType: "一居室", area: 50, subwayStation: "十里堡", subwayDistance: 280, commute: 18, description: "6 号线一站到朝阳门，两站到国贸。下楼就是华堂商场，地下日料是隐藏宝藏。" },
  { communityId: "comm_008", title: "十里堡精装两居·性价比高", price: 9500, roomType: "两居室", area: 85, subwayStation: "十里堡", subwayDistance: 350, commute: 22, description: "比三里屯便宜 30%，但通勤几乎一样。楼下就是 6 号线，附近还有家乐福和华堂。" },
  { communityId: "comm_008", title: "十里堡合租主卧", price: 3800, roomType: "合租单间", area: 17, subwayStation: "十里堡", subwayDistance: 250, commute: 15, description: "三人合租，主卧带独卫飘窗。室友都是 28+ 上班族，作息正常，安静。" },

  // comm_009 双井
  { communityId: "comm_009", title: "双井·苹果社区网红一居", price: 8200, roomType: "一居室", area: 55, subwayStation: "双井", subwayDistance: 220, commute: 15, description: "苹果社区颜值在线，装修是去年翻新的，全屋智能。下楼就是富力广场，电影健身一站搞定。" },
  { communityId: "comm_009", title: "双井·富力广场旁两居", price: 11500, roomType: "两居室", area: 92, subwayStation: "双井", subwayDistance: 280, commute: 18, description: "10 号线一站到国贸，三站到团结湖。客厅能看到 CBD 全景，朋友来超有面子。" },
  { communityId: "comm_009", title: "双井·苹果社区开间", price: 6500, roomType: "整租开间", area: 38, subwayStation: "广渠门外", subwayDistance: 320, commute: 20, description: "网红装修，墙是脏粉色，飘窗带绿植。物业可以养猫养狗，对宠物特别友好。" },

  // comm_010 亚运村
  { communityId: "comm_010", title: "亚运村·安慧北里一居", price: 4500, roomType: "一居室", area: 52, subwayStation: "北土城", subwayDistance: 380, commute: 28, description: "5 号线 + 8 号线，去鸟巢早上跑步特别方便。老房子但房东刷了大白墙，住起来还行。" },
  { communityId: "comm_010", title: "亚运村合租主卧·奥森旁", price: 3000, roomType: "合租单间", area: 15, subwayStation: "奥林匹克公园", subwayDistance: 450, commute: 32, description: "二人合租，旁边就是奥森公园。室友是个英语老师，每天早上 6 点跑步，作息正常。" },
  { communityId: "comm_010", title: "亚运村两居·学区房", price: 6800, roomType: "两居室", area: 78, subwayStation: "北土城", subwayDistance: 350, commute: 30, description: "亚运村板楼，南北通透，临近北辰购物中心。小区里大爷大妈多，老北京味道浓。" },
];

// 真实北京区域坐标基准（带微小随机抖动）
const BEIJING_COORDS = {
  comm_001: { lng: 116.434, lat: 39.924 },
  comm_002: { lng: 116.477, lat: 39.997 },
  comm_003: { lng: 116.461, lat: 39.908 },
  comm_004: { lng: 116.314, lat: 39.983 },
  comm_005: { lng: 116.337, lat: 39.992 },
  comm_006: { lng: 116.337, lat: 40.075 },
  comm_007: { lng: 116.658, lat: 39.909 },
  comm_008: { lng: 116.484, lat: 39.927 },
  comm_009: { lng: 116.464, lat: 39.895 },
  comm_010: { lng: 116.42, lat: 40.0 },
};

function jitter() {
  return (Math.random() - 0.5) * 0.008;
}

const apartments = apartmentSpecs.map((spec, idx) => {
  const id = `apt_${String(idx + 1).padStart(3, "0")}`;
  const base = BEIJING_COORDS[spec.communityId];
  const isPet = spec.description.includes("宠物") || Math.random() > 0.6;
  const baseTags = ["近地铁"];
  if (spec.roomType !== "合租单间") baseTags.push("独卫");
  if (isPet) baseTags.push("可养宠");
  baseTags.push(...pick(TAGS_POOL.filter((t) => !baseTags.includes(t)), 2 + Math.floor(Math.random() * 2)));
  return {
    id,
    title: spec.title,
    communityId: spec.communityId,
    price: spec.price,
    roomType: spec.roomType,
    area: spec.area,
    floor: FLOORS[Math.floor(Math.random() * FLOORS.length)],
    buildingType: BUILDING_TYPES[Math.floor(Math.random() * BUILDING_TYPES.length)],
    decoration: spec.price >= 9000 ? "精装" : spec.price >= 6000 ? (Math.random() > 0.5 ? "精装" : "网红装修") : "普通装修",
    subwayStation: spec.subwayStation,
    subwayDistance: spec.subwayDistance,
    commuteToSampleCompany: spec.commute,
    tags: baseTags,
    coordinates: { lng: +(base.lng + jitter()).toFixed(4), lat: +(base.lat + jitter()).toFixed(4) },
    images: [`/mock/${id}_1.jpg`, `/mock/${id}_2.jpg`],
    description: spec.description,
  };
});

fs.writeFileSync(
  path.join(DATA_DIR, "apartments.json"),
  JSON.stringify(apartments, null, 2),
  "utf8"
);

// ---------- 4. posts.json ----------
// 每个小区 3-4 条小红书风格帖子
const postsRaw = [
  // comm_001
  { id: "post_001", communityId: "comm_001", author: "在北漂的小鱼干", title: "三里屯 SOHO 住了一年的真实体验🏠", content: "刚搬出来一周，趁记忆还新鲜聊聊。\n优点确实多到爆，下楼就是太古里，闺蜜来根本不愁吃喝。物业是真的好，有次半夜空调坏了报修，20 分钟就到了。\n但缺点也明显，周末根本不敢开窗，楼下太吵。而且租金真的贵，同样的钱往东走两站，能租大一倍。", likes: 1247, comments: 89, publishDate: "2025-03-15" },
  { id: "post_002", communityId: "comm_001", author: "朝阳门社畜实录", title: "三里屯的夜晚到底多吵？亲测告诉你😅", content: "上周末凌晨 2 点被楼下酒吧街的喊麦吵醒，第二天去前台投诉，保安说\"这是常态\"。\n如果你是浅眠的人千万别选朝阳侧的房间。建议优先选东侧或者更高的楼层，能好不少。物业还是给力，会提供耳塞。", likes: 856, comments: 134, publishDate: "2025-04-02" },
  { id: "post_003", communityId: "comm_001", author: "北京搬家流浪记", title: "三里屯精装一居 7500 值不值？", content: "犹豫了一周才决定签下来，主要看中两点：1）通勤方便，朝阳门站走 5 分钟；2）周末社交方便，闺蜜来根本不用打车。\n但说实话，性价比一般。如果不是经常约朋友的人，建议看十里堡，便宜 1500-2000，通勤几乎一样。", likes: 2134, comments: 201, publishDate: "2025-03-28" },
  { id: "post_004", communityId: "comm_001", author: "工体打卡机", title: "工体改造后，三里屯真的回血了！", content: "工体球场重新开放之后整个三里屯氛围都不一样了。下楼能直接去看比赛，楼下的咖啡馆周末爆满。\n物业最近也做了小升级，电梯换了新的，大堂重新装修。租金虽然涨了，但住起来确实舒服。", likes: 678, comments: 56, publishDate: "2025-04-10" },

  // comm_002
  { id: "post_005", communityId: "comm_002", author: "字节早八人", title: "望京西溪国际，互联网人的家🏢", content: "在阿里西溪国际住第三年了，最大的感受就是\"方便\"。骑车 8 分钟到字节大厦，加班晚了走路也能回家。\n小区中央花园特别大，下班跑步遛狗都很多人。物业偶尔有点松，但安全感很足。", likes: 1893, comments: 167, publishDate: "2025-03-20" },
  { id: "post_006", communityId: "comm_002", author: "韩餐评论家", title: "望京吃了一年，韩餐推荐避雷🥩", content: "住望京最幸福的就是吃。楼下的金达莱烤肉、雪绒花、姜虎东都是常去。雪绒花周末要等位 1 小时，建议工作日去。\n小区配套很成熟，韩国超市 K-Mart 应有尽有。但缺点是房租真的不便宜，跟朝阳差不多了。", likes: 2456, comments: 312, publishDate: "2025-04-05" },
  { id: "post_007", communityId: "comm_002", author: "望京码农日记", title: "15 号线望京站早高峰多可怕😱", content: "今天 8:25 到地铁站，等了 3 班车才挤上去。整个车厢人贴人，下车的时候衣服都被拉变形了。\n建议住望京的姐妹们：要么 8 点前出门，要么 9 点后出门，要么直接骑车。15 号线高峰真的是地狱模式。", likes: 1567, comments: 224, publishDate: "2025-03-30" },
  { id: "post_008", communityId: "comm_002", author: "望京遛狗大队", title: "望京小区氛围超治愈🐕", content: "搬来一个月最大的惊喜就是小区里养狗的特别多。中央花园下午 6 点之后全是遛狗的，我家小柯基已经交了 10 个朋友。\n物业对宠物特别友好，不像有些小区不让带狗进电梯。这点对铲屎官来说太加分了。", likes: 998, comments: 87, publishDate: "2025-04-12" },

  // comm_003
  { id: "post_009", communityId: "comm_003", author: "金融民工的家", title: "国贸三期旁公寓，12k 一居值不值💰", content: "签下来三个月，说实话有点心疼钱包。每月 12k，半年工资就没了一大半。\n但优点也很明显：通勤 8 分钟，下楼就是 SKP，保安看见我都点头。隐私和安全感是真的好，但夜生活几乎没有，周末跟空城一样。", likes: 1789, comments: 178, publishDate: "2025-03-18" },
  { id: "post_010", communityId: "comm_003", author: "CBD 短租体验官", title: "国贸高层夜景太炸裂了🌃", content: "出差住在 30 楼以上的房间，晚上从窗户看出去整个 CBD 夜景一览无余。\n楼下下午 5 点之后人慢慢多起来，店铺很多元化。但缺点是周末空荡荡，没有烟火气。如果你是社交达人，不建议长住。", likes: 1234, comments: 98, publishDate: "2025-04-08" },
  { id: "post_011", communityId: "comm_003", author: "外企打工人 Lily", title: "国贸住三年的真实反馈", content: "在国贸住了三年，最大的好处是通勤。下楼直接进国贸三期写字楼，加班到 11 点也不怕没车。\n但租金真的劝退，每年涨 500-1000，住到第三年已经在考虑搬家。如果你不是金融或外企，真没必要。", likes: 2345, comments: 256, publishDate: "2025-03-25" },

  // comm_004
  { id: "post_012", communityId: "comm_004", author: "海淀黄庄学区房", title: "中关村住了两年，码农真实感受", content: "走路 12 分钟到字节中关村，骑车 6 分钟，太方便了。周边吃饭也不贵，西少爷、和合谷一应俱全。\n但老房子的毛病一个不少：隔音差、水管老、暖气也只能勉强达标。我冬天得穿羽绒服在家里。", likes: 1456, comments: 167, publishDate: "2025-03-22" },
  { id: "post_013", communityId: "comm_004", author: "考研北漂", title: "中关村适合考研党吗🤔", content: "在中关村二战考研，整体觉得还行。周边自习室特别多，新东方、海文一抓一大把。\n图书馆资源也方便，国图、首图都不远。但宿舍楼一样的老板楼，隔音真的差，我隔壁敲键盘我都能听到。", likes: 876, comments: 122, publishDate: "2025-04-01" },
  { id: "post_014", communityId: "comm_004", author: "海淀大妈实录", title: "中关村老小区到底老成什么样", content: "98 年的楼，电梯是改造过的，水管偶尔锈水。冬天暖气只有 18 度，不达标投诉过没用。\n但优点是邻居都是知识分子，安全感很足。楼道也没什么乱七八糟的人。如果你能忍受老房子，这里其实挺安心。", likes: 654, comments: 89, publishDate: "2025-04-15" },
  { id: "post_015", communityId: "comm_004", author: "中关村程序员", title: "想搬来海淀黄庄的看过来", content: "在这里住了 5 年，给想搬来的朋友几条建议：\n1）一定要选 2005 年后翻新过的房子，老的真的不能住\n2）地铁选海淀黄庄 > 中关村，前者更安静\n3）能选朝南就别朝北，海淀冬天采光是命根子", likes: 1789, comments: 198, publishDate: "2025-03-28" },

  // comm_005
  { id: "post_016", communityId: "comm_005", author: "五道口夜猫子", title: "宇宙中心的夜晚什么样🌙", content: "凌晨 2 点饿了，下楼走 3 分钟就能找到 24 小时烧烤店和韩餐厅。这种宇宙中心的快乐没住过的不懂。\n但代价是吵。学生多，开学季楼下迎新喊话能持续一周。我用了三个月才适应。", likes: 1567, comments: 178, publishDate: "2025-03-19" },
  { id: "post_017", communityId: "comm_005", author: "留学生在北京", title: "五道口住了 2 年的韩国留学生👋", content: "我是来清华读硕士的韩国人，住五道口最大的好处就是有家的感觉。韩国超市、韩餐、韩货应有尽有。\n小区里 50% 都是韩国留学生，邻里关系特别好。但缺点是租金涨得太快，比 2 年前贵了 30%。", likes: 2134, comments: 245, publishDate: "2025-04-03" },
  { id: "post_018", communityId: "comm_005", author: "清北码农", title: "五道口性价比开始劝退😅", content: "毕业后留在五道口住了一年，最近在考虑搬走。一居室从 6000 涨到 7200，单间从 3500 涨到 4200。\n如果是学生党还好，工作的人建议看看望京或者北苑，性价比高很多。", likes: 1234, comments: 167, publishDate: "2025-03-26" },
  { id: "post_019", communityId: "comm_005", author: "五道口烧烤帝", title: "五道口必吃榜！来五道口必看", content: "雪绒花韩餐：永远的神，周末等位 1 小时\n灶台一品：东北菜烫到流泪，凌晨还在排队\n姜虎东：肉质好但贵\n隐藏宝藏：海底捞旁边那家串店，人均 50 吃饱", likes: 3456, comments: 412, publishDate: "2025-04-09" },

  // comm_006
  { id: "post_020", communityId: "comm_006", author: "回龙观码农老张", title: "回龙观真实通勤记录📊", content: "在回龙观住了 3 年，每天 13 号线通勤西二旗。早上 7:50 出门，8:30 到工位，晚上 8 点下班 8:40 到家。\n说实话挤是真挤，但便宜也是真便宜。我一居室 4500，朝阳得 7000 起。剩下的钱可以多吃几顿火锅。", likes: 2345, comments: 234, publishDate: "2025-03-20" },
  { id: "post_021", communityId: "comm_006", author: "回龙观新邻居", title: "为什么大家都在劝退回龙观", content: "搬来一个月，体验到为什么大家说\"回家像出差\"。市区聚会回来 1.5 小时，社交基本断了。\n但便宜真的香，2800 能租到独卫单间。如果你是攒钱党、不爱社交，这里就是天堂。", likes: 987, comments: 156, publishDate: "2025-04-06" },
  { id: "post_022", communityId: "comm_006", author: "西二旗后端", title: "在回龙观住了 5 年的心得", content: "回龙观最大的优势是：13 号线一站到西二旗，骑共享单车 15 分钟到百度。\n生活配套也比想象中好：龙域中心万象汇、华联超市、回龙观体育公园应有尽有。\n缺点：物业松散，楼道堆杂物没人管。需要自己主动维护。", likes: 1456, comments: 178, publishDate: "2025-03-25" },

  // comm_007
  { id: "post_023", communityId: "comm_007", author: "通州副中心", title: "通州副中心红利肉眼可见📈", content: "在通州住了 2 年，最大的感受就是变化太快了。环球影城开了，地铁 7 号线通了，万达广场开了。\n房价虽然涨了，但租金还算稳定。从国贸通勤过来 40 分钟，能接受的话性价比超高。", likes: 1234, comments: 134, publishDate: "2025-03-23" },
  { id: "post_024", communityId: "comm_007", author: "通州环球粉", title: "住通州=住在环球影城旁边🎢", content: "环球影城年卡在手，下班 6 点过去玩到 10 点关门。第二天起床还能去坐两次过山车，太爽了。\n但通州进城真的远，去国贸 50 分钟，去望京 1 小时。建议在通州找工作或者远程办公。", likes: 1567, comments: 198, publishDate: "2025-04-04" },
  { id: "post_025", communityId: "comm_007", author: "通州小夫妻", title: "通州住房真实评价", content: "我和老公在通州买不起，但租得起。一居室 4800 在朝阳是单间价。\n小区里年轻夫妻有娃的特别多，每天下午 6 点园区里全是遛娃的。环境治愈，适合躺平。\n缺点：晚上 10 点之后街上没人，叫不到滴滴。", likes: 876, comments: 87, publishDate: "2025-03-29" },

  // comm_008
  { id: "post_026", communityId: "comm_008", author: "十里堡省钱党", title: "十里堡=平民版三里屯💰", content: "对比了朝阳很多区域，最后选了十里堡。一居室 7200，比三里屯便宜 1500，但 6 号线一站到朝阳门。\n华堂商场地下日料是隐藏宝藏，便利店密度全朝阳前三。住下来真的很舒服。", likes: 1789, comments: 167, publishDate: "2025-03-21" },
  { id: "post_027", communityId: "comm_008", author: "十里堡老租客", title: "十里堡住了 4 年的总结", content: "性价比真的高。同样预算可以住到一居室+独卫+精装+电梯，朝阳很多区域都做不到。\n但夜生活基本为零，晚上 10 点之后街上没人。如果你不是社交达人，这点反而是优点：安静。", likes: 1234, comments: 145, publishDate: "2025-04-07" },
  { id: "post_028", communityId: "comm_008", author: "六号线打工人", title: "十里堡通勤真实体验", content: "6 号线一站到朝阳门，两站到东四，五站到金融街。东西向通勤神器，比 10 号线还方便。\n但 6 号线高峰时段也挤，建议提前 15 分钟出门。物业不错，电梯有专人巡查。", likes: 567, comments: 78, publishDate: "2025-04-11" },

  // comm_009
  { id: "post_029", communityId: "comm_009", author: "苹果社区设计师", title: "苹果社区颜值太能打了🎨", content: "刚搬进来一个月，每天回家都像在 ins 上看图片。墙是脏粉色，飘窗带绿植，全屋智能灯。\n小区设计感拉满，建筑外立面是真的好看。但租金也对得起这个颜值，比双井其他小区贵 15-20%。", likes: 2345, comments: 234, publishDate: "2025-03-17" },
  { id: "post_030", communityId: "comm_009", author: "双井铲屎官", title: "苹果社区对铲屎官真的太友好🐱", content: "搬来之前担心物业不让养猫，结果发现这里宠物友好度满分。可以挂窗帘、可以养猫狗、可以遛狗进电梯。\n楼下富力广场还有宠物店和宠物医院，特别方便。物业管家会主动问你家猫今天有没有吃好。", likes: 1567, comments: 198, publishDate: "2025-04-05" },
  { id: "post_031", communityId: "comm_009", author: "双井打卡党", title: "苹果社区被打卡的人快烦死了😅", content: "周末楼下经常有小红书、抖音的人来拍照。我家窗户朝外，经常能看到镜头对着我家拍。\n虽然小区漂亮是事实，但隐私真的受影响。希望物业能加强管理，禁止外人随便进入拍照。", likes: 876, comments: 134, publishDate: "2025-04-13" },

  // comm_010
  { id: "post_032", communityId: "comm_010", author: "亚运村老北京", title: "亚运村老北京味道真的浓", content: "在亚运村住了 10 年，最喜欢的就是这里的烟火气。楼下大爷大妈遛弯下棋，早上 6 点奥森公园全是跑步的。\n房子是老板楼，毛病一堆但便宜。4500 一居室在朝阳几乎不可能找到。", likes: 1234, comments: 167, publishDate: "2025-03-24" },
  { id: "post_033", communityId: "comm_010", author: "奥森跑步党", title: "为了奥森公园搬到亚运村", content: "奥森公园真的是北京最好的跑步圣地，没有之一。环线 5 公里 + 10 公里随便选。\n住亚运村就是为了这个。每天早上跑步，下班再去散步。代价是老板楼隔音差，邻居说话能听见。", likes: 987, comments: 98, publishDate: "2025-04-02" },
  { id: "post_034", communityId: "comm_010", author: "北漂老阿姨", title: "亚运村值得搬来吗", content: "性价比中等，老房子毛病一堆但租金便宜。如果你预算有限想住北边，这里是个选择。\n但建议选有电梯的楼，6 层老板楼基本没电梯，搬家时哭出声。\n5 号线 + 8 号线交通还行，但去朝阳要换乘。", likes: 654, comments: 87, publishDate: "2025-04-08" },
];

// 补充必需字段：tags / authorAvatar
const posts = postsRaw.map((p) => ({
  ...p,
  authorAvatar: `/mock/avatar_${p.id.replace("post_", "")}.jpg`,
  tags: ["租房日记", "北漂", communitiesRaw.find((c) => c.id === p.communityId)?.area || "北京"],
}));

fs.writeFileSync(
  path.join(DATA_DIR, "posts.json"),
  JSON.stringify(posts, null, 2),
  "utf8"
);

console.log("✅ mock 数据生成完毕");
console.log(`  - conjoint-config.json: ${conjointConfig.attributes.length} attrs, ${conjointConfig.binaryFilters.length} filters`);
console.log(`  - communities.json: ${communitiesRaw.length} 个小区`);
console.log(`  - apartments.json: ${apartments.length} 套房源`);
console.log(`  - posts.json: ${posts.length} 条帖子`);
