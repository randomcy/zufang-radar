/**
 * 北京地铁站全量拉取（基于高德 JS SDK PlaceSearch）
 *
 * 工作方式：
 *   - 高德 POI type 150500 = 地铁站
 *   - city='010' = 北京
 *   - 分页拉取（pageSize=50），直到 totalCount 取完
 *   - 缓存到 localStorage，24h 内复用
 *
 * 返回字段：
 *   - name 去掉 "(地铁站)" 后缀
 *   - line 解析自 address 字段（高德返回 "14号线;4号线/大兴线" 这种）
 */
import { loadAMap } from "./amap-loader";
import type { SubwayStation } from "./commute";

const CACHE_KEY = "zufang_bj_subway_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface CachedPayload {
  stations: SubwayStation[];
  cachedAt: number;
}

/** 去掉 "XX(地铁站)" 后缀 */
function cleanName(name: string): string {
  return name
    .replace(/\(地铁站\)$/g, "")
    .replace(/（地铁站）$/g, "")
    .trim();
}

/** 高德 address 字段示例：'14号线;4号线/大兴线' '1号线' '2号线;环线' */
function parseLine(address: string): string {
  if (!address) return "未知线路";
  // 用分号/逗号/斜杠拆，过滤空串
  const parts = address
    .split(/[;,；，]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.join("/") || address;
}

function readCache(): SubwayStation[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: CachedPayload = JSON.parse(raw);
    if (Date.now() - data.cachedAt > CACHE_TTL_MS) return null;
    if (!Array.isArray(data.stations) || data.stations.length < 50) return null;
    return data.stations;
  } catch {
    return null;
  }
}

function writeCache(stations: SubwayStation[]) {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedPayload = { stations, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // 配额满或私密模式，忽略
  }
}

/**
 * 拉取全部北京地铁站。
 * 优先返回缓存。失败时返回 fallback（调用方传入的本地 JSON）。
 */
export async function fetchAllBeijingStations(
  fallback: SubwayStation[]
): Promise<{ stations: SubwayStation[]; source: "cache" | "amap" | "fallback" }> {
  const cached = readCache();
  if (cached) return { stations: cached, source: "cache" };

  try {
    const AMap = await loadAMap();

    const stations: SubwayStation[] = await new Promise((resolve, reject) => {
      const collected: SubwayStation[] = [];
      const seen = new Set<string>();

      const placeSearch = new AMap.PlaceSearch({
        type: "150500", // 地铁站 POI 类型
        city: "010",
        citylimit: true,
        pageSize: 50,
        pageIndex: 1,
        extensions: "all",
      });

      let currentPage = 1;
      const maxPages = 12; // 最多翻 12 页 = 600 站,足够覆盖北京 ~436

      const fetchPage = (page: number) => {
        placeSearch.setPageIndex(page);
        placeSearch.search("地铁站", (status: string, result: any) => {
          if (status !== "complete" || !result.poiList || !result.poiList.pois) {
            // 第一页就失败 = 整体失败
            if (page === 1) return reject(new Error(`AMap search failed: ${status}`));
            // 后续页失败 = 已取完
            return resolve(collected);
          }

          const pois = result.poiList.pois as any[];
          for (const poi of pois) {
            const id = poi.id || `${poi.location?.lng}_${poi.location?.lat}`;
            if (seen.has(id)) continue;
            seen.add(id);

            const lng = Number(poi.location?.lng);
            const lat = Number(poi.location?.lat);
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;

            collected.push({
              id,
              name: cleanName(poi.name || ""),
              line: parseLine(poi.address || ""),
              lng,
              lat,
            });
          }

          const total = result.poiList.count || 0;
          const totalPages = Math.ceil(total / 50);

          if (page >= Math.min(maxPages, totalPages) || pois.length < 50) {
            return resolve(collected);
          }

          currentPage = page + 1;
          // 高德 API 限流：稍微间隔一下
          setTimeout(() => fetchPage(currentPage), 80);
        });
      };

      fetchPage(1);
    });

    if (stations.length < 50) {
      throw new Error(`Too few stations returned: ${stations.length}`);
    }

    writeCache(stations);
    return { stations, source: "amap" };
  } catch (err) {
    console.warn("[subway-fetcher] AMap fetch failed, using fallback", err);
    return { stations: fallback, source: "fallback" };
  }
}
