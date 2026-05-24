/**
 * 高德驾车路径规划 API（在线精准版）
 *
 * 文档：https://lbs.amap.com/api/webservice/guide/api/direction#driving
 *
 * 策略：
 * 1. 先查 sessionStorage 缓存（同一会话内不重复请求）
 * 2. 联网调高德 v3/direction/driving
 * 3. API 超时（>3s）或失败 → 抛错，调用方降级到 estimateDriveMinutesOffline
 *
 * 这是 C 方案的"双备份"上半层：联网精准 ±3min。
 */

import { AMAP_KEY } from "./amap-config";

const CACHE_PREFIX = "drive-cache:";
const REQUEST_TIMEOUT_MS = 3000;

interface DriveResult {
  /** 门到门分钟数 */
  minutes: number;
  /** 数据来源 */
  source: "amap" | "cache";
}

/** 缓存 key：起点终点 6 位小数精度 */
function cacheKey(
  origin: { lng: number; lat: number },
  dest: { lng: number; lat: number }
): string {
  const o = `${origin.lng.toFixed(6)},${origin.lat.toFixed(6)}`;
  const d = `${dest.lng.toFixed(6)},${dest.lat.toFixed(6)}`;
  return `${CACHE_PREFIX}${o}|${d}`;
}

/** 读缓存 */
function readCache(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(key);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

/** 写缓存 */
function writeCache(key: string, minutes: number): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, String(minutes));
  } catch {
    // 忽略配额错误
  }
}

/**
 * 调用高德驾车 API 估算精准时间
 *
 * @param origin 起点坐标
 * @param dest 终点坐标（公司位置）
 * @returns 分钟数 + 数据来源；失败抛错（调用方需 fallback）
 */
export async function fetchDriveMinutes(
  origin: { lng: number; lat: number },
  dest: { lng: number; lat: number }
): Promise<DriveResult> {
  const key = cacheKey(origin, dest);

  // 1) 缓存命中
  const cached = readCache(key);
  if (cached !== null) {
    return { minutes: cached, source: "cache" };
  }

  // 2) 调高德 API
  const url =
    `https://restapi.amap.com/v3/direction/driving?` +
    `origin=${origin.lng},${origin.lat}` +
    `&destination=${dest.lng},${dest.lat}` +
    `&strategy=4` + // 4 = 时间最短（综合）
    `&key=${AMAP_KEY}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Amap HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.status !== "1" || !data.route?.paths?.[0]) {
      throw new Error(`Amap status=${data.status} info=${data.info}`);
    }

    // 高德返回的是秒，转分钟，加 5 分钟停车 buffer
    const durationSec = Number(data.route.paths[0].duration);
    if (!Number.isFinite(durationSec) || durationSec <= 0) {
      throw new Error("Amap invalid duration");
    }
    const minutes = Math.round(durationSec / 60) + 5; // +5 找车位停车走到公司

    writeCache(key, minutes);
    return { minutes, source: "amap" };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}
