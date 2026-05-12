#!/usr/bin/env python3
"""把房源坐标固定到所属真实小区附近"""
import json
import random
from pathlib import Path

random.seed(42)
ROOT = Path(__file__).parent.parent

# 真实小区中心点（来自高德/百度公开地图）
COMM_CENTERS = {
    "comm_001": (116.4530, 39.9362),   # 三里屯 SOHO
    "comm_002": (116.4737, 40.0048),   # 望京西园三区
    "comm_003": (116.4595, 39.9088),   # 国贸公寓
    "comm_004": (116.3203, 39.9787),   # 中科院黄庄
    "comm_005": (116.3375, 39.9919),   # 华清嘉园
    "comm_006": (116.3120, 40.0708),   # 龙泽苑东区（回龙观）
    "comm_007": (116.6593, 39.9148),   # 新华联家园（通州）
    "comm_008": (116.4946, 39.9421),   # 泛海国际居住区
    "comm_009": (116.4716, 39.8946),   # 苹果社区（双井）
    "comm_010": (116.4144, 39.9921),   # 安慧北里（亚运村）
}

apts = json.loads((ROOT / "data/apartments.json").read_text(encoding="utf-8"))
for a in apts:
    cid = a["community_id"]
    if cid not in COMM_CENTERS:
        print(f"⚠️  房源 {a['id']} 小区 {cid} 没有坐标")
        continue
    lng, lat = COMM_CENTERS[cid]
    # 在小区周围 ±0.002 度抖动（约 ±200 米）
    a["coordinates"] = {
        "lng": round(lng + random.uniform(-0.002, 0.002), 6),
        "lat": round(lat + random.uniform(-0.002, 0.002), 6),
    }

(ROOT / "data/apartments.json").write_text(
    json.dumps(apts, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(f"✅ 30 套房源坐标已挂到真实小区附近")

# 同步把小区中心写入 communities.json
comms = json.loads((ROOT / "data/communities.json").read_text(encoding="utf-8"))
for c in comms:
    if c["id"] in COMM_CENTERS:
        lng, lat = COMM_CENTERS[c["id"]]
        c["coordinates"] = {"lng": lng, "lat": lat}
(ROOT / "data/communities.json").write_text(
    json.dumps(comms, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(f"✅ 10 个小区坐标已写入")
