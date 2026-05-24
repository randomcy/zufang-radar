/**
 * 通勤估算重校验证：跑几个真实场景对比
 *
 * 真实参考时间来自高德/百度地图公交规划（2025 抽样）
 */
import {
  estimateCommuteMinutes,
  estimateDriveMinutesOffline,
} from "../src/lib/commute";

type Case = {
  name: string;
  station: { lng: number; lat: number };
  company: { lng: number; lat: number };
  realMin: [number, number]; // 真实门到门区间
};

const cases: Case[] = [
  // 望京 → 中关村（你的真实场景）
  {
    name: "望京 → 中关村",
    station: { lng: 116.473, lat: 40.001 },
    company: { lng: 116.317, lat: 39.984 },
    realMin: [55, 70],
  },
  // 望京 → 国贸
  {
    name: "望京 → 国贸",
    station: { lng: 116.473, lat: 40.001 },
    company: { lng: 116.460, lat: 39.913 },
    realMin: [40, 55],
  },
  // 天通苑 → 国贸（典型远距离）
  {
    name: "天通苑 → 国贸",
    station: { lng: 116.418, lat: 40.077 },
    company: { lng: 116.460, lat: 39.913 },
    realMin: [60, 80],
  },
  // 上海 张江 → 陆家嘴
  {
    name: "张江 → 陆家嘴",
    station: { lng: 121.589, lat: 31.205 },
    company: { lng: 121.505, lat: 31.236 },
    realMin: [40, 55],
  },
  // 上海 莘庄 → 静安寺（跨区）
  {
    name: "莘庄 → 静安寺",
    station: { lng: 121.385, lat: 31.110 },
    company: { lng: 121.444, lat: 31.225 },
    realMin: [55, 75],
  },
  // 短距离 浦东 → 世纪大道
  {
    name: "浦东 → 世纪大道",
    station: { lng: 121.532, lat: 31.225 },
    company: { lng: 121.532, lat: 31.225 },
    realMin: [10, 20],
  },
];

console.log("\n通勤估算重校验证\n" + "=".repeat(60));
console.log(
  "场景".padEnd(22, " ") +
    "估算".padStart(8, " ") +
    "真实区间".padStart(14, " ") +
    "  评估"
);
console.log("-".repeat(60));

let ok = 0;
let total = cases.length;

for (const c of cases) {
  const est = estimateCommuteMinutes(
    { id: "x", name: "", line: "", ...c.station },
    { id: "y", name: "", ...c.company }
  );
  const [low, high] = c.realMin;
  const within = est >= low && est <= high;
  const offset = est < low ? low - est : est > high ? est - high : 0;
  const status = within
    ? "✅ 区间内"
    : offset <= 5
    ? "🟡 偏差≤5min"
    : "❌ 偏差>" + offset + "min";

  console.log(
    c.name.padEnd(22, " ") +
      `${est}min`.padStart(8, " ") +
      `${low}-${high}min`.padStart(14, " ") +
      "  " +
      status
  );
  if (within || offset <= 5) ok++;
}

console.log("-".repeat(60));
console.log(`地铁算法通过率：${ok}/${total} (含 ≤5min 偏差)\n`);

// ============================================================
// 驾车离线估算验证
// ============================================================

type DriveCase = {
  name: string;
  origin: { lng: number; lat: number };
  dest: { lng: number; lat: number };
  realMin: [number, number];
};

const driveCases: DriveCase[] = [
  // 望京 → 中关村（驾车高峰）
  {
    name: "望京 → 中关村驾车",
    origin: { lng: 116.473, lat: 40.001 },
    dest: { lng: 116.317, lat: 39.984 },
    realMin: [50, 75], // 高峰 60-70min、平峰 40-50min，默认估高峰
  },
  // 望京 → 国贸（东不太堵）
  {
    name: "望京 → 国贸驾车",
    origin: { lng: 116.473, lat: 40.001 },
    dest: { lng: 116.460, lat: 39.913 },
    realMin: [30, 50],
  },
  // 天通苑 → 国贸（远峰远距离）
  {
    name: "天通苑 → 国贸驾车",
    origin: { lng: 116.418, lat: 40.077 },
    dest: { lng: 116.460, lat: 39.913 },
    realMin: [55, 90],
  },
  // 上海 张江 → 陆家嘴
  {
    name: "张江 → 陆家嘴驾车",
    origin: { lng: 121.589, lat: 31.205 },
    dest: { lng: 121.505, lat: 31.236 },
    realMin: [30, 50],
  },
  // 短距离：浦东 → 世纪大道
  {
    name: "浦东 → 世纪大道驾车",
    origin: { lng: 121.532, lat: 31.225 },
    dest: { lng: 121.532, lat: 31.225 },
    realMin: [5, 15], // 同一站点，只有 buffer
  },
];

console.log("驾车离线估算验证\n" + "=".repeat(60));
console.log(
  "场景".padEnd(22, " ") +
    "估算".padStart(8, " ") +
    "真实区间".padStart(14, " ") +
    "  评估"
);
console.log("-".repeat(60));

let driveOk = 0;
for (const c of driveCases) {
  const est = estimateDriveMinutesOffline(c.origin, c.dest);
  const [low, high] = c.realMin;
  const within = est >= low && est <= high;
  const offset = est < low ? low - est : est > high ? est - high : 0;
  const status = within
    ? "✅ 区间内"
    : offset <= 5
    ? "🟡 偏差≤5min"
    : "❌ 偏差>" + offset + "min";

  console.log(
    c.name.padEnd(22, " ") +
      `${est}min`.padStart(8, " ") +
      `${low}-${high}min`.padStart(14, " ") +
      "  " +
      status
  );
  if (within || offset <= 5) driveOk++;
}
console.log("-".repeat(60));
console.log(
  `驾车离线通过率：${driveOk}/${driveCases.length} (含 ≤5min 偏差)\n`
);
console.log(
  "注：离线是降级方案，联网会调高德驾车 API 达到 ±3min 精准。\n"
);
