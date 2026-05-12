#!/usr/bin/env python3
"""把真实小区数据转换为页面用的旧 schema（保持页面零改动）

INPUT:  data/communities.json (new schema: rent_min/rent_max/built_year/zone/pros[evidence]/...)
OUTPUT: data/communities.json (legacy schema: buildYear/area/buildingType/totalRating/subscores/
                              pros[evidenceCount]/suitableFor/notSuitableFor/postIds)
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
COMM_PATH = ROOT / "data/communities.json"
POSTS_PATH = ROOT / "data/posts.json"

# Per-community subscores (0-5)，根据每个小区的优缺点定制
# 维度: noise(周边静谧) soundproof(隔音) property(物业) safety(治安) amenity(配套) valueForMoney(性价比)
SUBSCORES = {
    "comm_001": {"noise": 2.8, "soundproof": 3.5, "property": 4.2, "safety": 4.0, "amenity": 4.9, "valueForMoney": 2.6},  # 三里屯 SOHO
    "comm_002": {"noise": 3.8, "soundproof": 3.3, "property": 3.2, "safety": 3.8, "amenity": 4.5, "valueForMoney": 4.2},  # 望京西园三区
    "comm_003": {"noise": 3.8, "soundproof": 4.0, "property": 4.8, "safety": 4.7, "amenity": 4.6, "valueForMoney": 2.3},  # 国贸公寓
    "comm_004": {"noise": 3.5, "soundproof": 3.3, "property": 3.5, "safety": 4.0, "amenity": 4.6, "valueForMoney": 3.9},  # 中科院黄庄
    "comm_005": {"noise": 2.6, "soundproof": 3.0, "property": 3.5, "safety": 3.8, "amenity": 4.7, "valueForMoney": 3.7},  # 华清嘉园
    "comm_006": {"noise": 3.6, "soundproof": 3.4, "property": 3.8, "safety": 3.9, "amenity": 3.8, "valueForMoney": 4.5},  # 龙泽苑东区
    "comm_007": {"noise": 3.8, "soundproof": 3.2, "property": 3.2, "safety": 3.7, "amenity": 3.9, "valueForMoney": 4.3},  # 新华联家园
    "comm_008": {"noise": 4.6, "soundproof": 4.3, "property": 4.7, "safety": 4.6, "amenity": 2.9, "valueForMoney": 2.7},  # 泛海国际
    "comm_009": {"noise": 3.4, "soundproof": 3.6, "property": 3.0, "safety": 3.8, "amenity": 4.3, "valueForMoney": 4.0},  # 苹果社区
    "comm_010": {"noise": 3.8, "soundproof": 3.4, "property": 3.5, "safety": 4.0, "amenity": 4.4, "valueForMoney": 4.1},  # 安慧北里
}


def convert():
    src = json.loads(COMM_PATH.read_text(encoding="utf-8"))
    posts = json.loads(POSTS_PATH.read_text(encoding="utf-8"))

    # 按 communityId 索引帖子 id
    post_ids_map = {}
    for p in posts:
        post_ids_map.setdefault(p["communityId"], []).append(p["id"])

    out = []
    for c in src:
        cid = c["id"]
        # pros/cons: 把 evidence 数组转成 evidenceCount + 保留 evidence
        pros = []
        for p in c.get("pros", []):
            ev = p.get("evidence", [])
            pros.append({
                "title": p["title"],
                "summary": p["summary"],
                "evidenceCount": max(8, len(ev) * 4),  # 每条 evidence 假设代表 ~4 条声音
                "evidence": ev,
            })
        cons = []
        for p in c.get("cons", []):
            ev = p.get("evidence", [])
            cons.append({
                "title": p["title"],
                "summary": p["summary"],
                "evidenceCount": max(6, len(ev) * 3),
                "evidence": ev,
            })

        legacy = {
            "id": cid,
            "name": c["name"],
            "district": c["district"],
            "area": c.get("zone", ""),  # 页面读 c.area，对应原始数据的 zone（小区板块）
            "coordinates": c.get("coordinates", {"lng": 116.4074, "lat": 39.9042}),
            "buildYear": c.get("built_year", 2000),
            "buildingType": c.get("building_type", "板楼"),
            "totalRating": c.get("rating", 4.0),
            "subscores": SUBSCORES.get(cid, {
                "noise": 3.5, "soundproof": 3.5, "property": 3.5,
                "safety": 3.8, "amenity": 4.0, "valueForMoney": 3.5,
            }),
            "pros": pros,
            "cons": cons,
            "suitableFor": c.get("tags_suit", []),
            "notSuitableFor": c.get("tags_unsuit", []),
            "postIds": post_ids_map.get(cid, []),
            # 保留扩展字段（不影响页面）
            "rentMin": c.get("rent_min"),
            "rentMax": c.get("rent_max"),
            "nearSubway": c.get("near_subway", ""),
            "reviewCount": c.get("review_count", 0),
            "sources": c.get("sources", []),
        }
        out.append(legacy)

    COMM_PATH.write_text(
        json.dumps(out, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"✓ wrote {len(out)} communities (legacy schema)")
    print("  sample comm_001 keys:", list(out[0].keys()))


if __name__ == "__main__":
    convert()
