"""给 communities.json 注入 evidence 数组（每条 pro/con 附 1-3 条小红书风格证词）+
给 apartments.json 注入 hidden_cons 隐藏缺点。"""
import json
import random

random.seed(42)

# === 1. 小区证词（按 title 关键词匹配模板） ===
EVIDENCE_TEMPLATES = {
    # 优点维度
    "配套": [
        "@夜跑爱好者：楼下星巴克 24h，凌晨写代码饿了下楼就有夜宵 🌙",
        "@小猪要早起：周末逛太古里就当遛弯，方便到离谱",
        "@SOHO 打工人：500m 内三家便利店两家咖啡，懒人福音",
    ],
    "地铁": [
        "@朝九晚九：双地铁交汇真的爽，再也不用挤 13 号线",
        "@通勤刺客：到国贸 4 站，开会迟到没借口了",
    ],
    "物业": [
        "@租房 3 年党：报修平均 30min 到位，半夜空调坏了真的修",
        "@独居女生：保安认人脸，外卖小哥进不来",
    ],
    "便宜": [
        "@刚毕业打工人：4000 一居室在四环内简直谢天谢地",
        "@回龙观人均：和合租差不多的价钱整租，回家躺平不见人",
    ],
    "采光": [
        "@阳光控：朝南窗户冬天晒被子比烘干机好用",
        "@猫主子家长：猫一整天追着光跑",
    ],
    "教育": [
        "@有娃家庭：学区房不是吹的，对口小学步行 8min",
    ],
    # 缺点维度
    "贵": [
        "@CBD 韭菜：月薪 1/3 交房租，吃饭都得算计",
        "@毕业 3 年：和同价位郊区比，多花 3k 就买个地段",
    ],
    "吵": [
        "@早睡党：凌晨两点酒吧街还在嗨，耳塞戴成习惯",
        "@浅眠星人：周末楼下太古里游客像菜市场",
    ],
    "通勤": [
        "@13 号线难民：早高峰挤到怀疑人生，平均站 25min",
        "@回龙观→国贸：地铁里能写完一本书 📖",
    ],
    "老": [
        "@老房住客：水管半年坏一次，物业像查无此人",
        "@隔音差党：邻居打喷嚏听得一清二楚",
    ],
    "停车": [
        "@有车一族：晚 8 点回家=找不到车位，得停 1km 外",
    ],
    "电梯": [
        "@搬家党：6 楼无电梯，一次搬家累瘦 3 斤",
    ],
    "性价比": [
        "@算账达人：同等面积比周边贵 25%，多花的全在地段溢价",
    ],
}

GENERIC_PRO = [
    "@小红书用户 A：住了 1 年，整体体验比预期好 👍",
    "@朝阳打工人：综合下来还是值得的，会推荐给朋友",
]
GENERIC_CON = [
    "@老租户：宣传图和实拍差距有点大，自己来看一次",
    "@理性派：缺点是真有，看你能不能接受",
]


def pick_evidence(title: str, summary: str, is_pro: bool):
    text = title + " " + summary
    chosen = []
    for keyword, lines in EVIDENCE_TEMPLATES.items():
        if keyword in text:
            chosen.extend(lines)
    if not chosen:
        chosen = GENERIC_PRO if is_pro else GENERIC_CON
    # 取 1-3 条
    n = min(len(chosen), random.choice([2, 2, 3]))
    return random.sample(chosen, n)


# === 2. 房源 hidden_cons（按价位/区域差异化） ===
HIDDEN_CONS_POOL = {
    "high_price": [  # >= 8000
        "实拍照片是租赁公司拍的，到实地一看楼道堆杂物",
        "停车费要单独算，每月 300+",
        "押二付三，押金要二房东亲签，退房可能扯皮",
    ],
    "mid_price": [  # 5000-8000
        "物业费要租客自付，每月 80-150",
        "燃气热水器超过 5 年没换，洗澡水温不稳",
        "中介费要 1 个月房租，提前沟通能砍到 0.5",
    ],
    "low_price": [  # < 5000
        "采暖费 800-1500/季要自付",
        "电费按商业用电算，每度比家用贵 0.3",
        "墙皮发霉的情况要看实地，照片可能修过",
        "周边便利店少，最近商超走路 15min",
    ],
    "old_building": [
        "隔音差，邻居说话像在自己家",
        "管道老化，冬天偶尔暖气不热",
        "电梯偶尔停运，6 楼住户体验=楼梯党",
    ],
    "remote": [
        "外卖配送费比城里贵 3-5 元",
        "下班 8 点后地铁回家空座率低，但人很挤",
    ],
}


def pick_hidden_cons(apt):
    cons = []
    price = apt.get("price", 6000)
    if price >= 8000:
        cons += random.sample(HIDDEN_CONS_POOL["high_price"], 2)
    elif price >= 5000:
        cons += random.sample(HIDDEN_CONS_POOL["mid_price"], 2)
    else:
        cons += random.sample(HIDDEN_CONS_POOL["low_price"], 2)
    # 老楼栋
    if apt.get("buildingType") in ("老板楼", "老破小") or "老" in str(apt.get("decoration", "")):
        cons.append(random.choice(HIDDEN_CONS_POOL["old_building"]))
    # 远郊
    title = apt.get("title", "")
    if any(k in title for k in ["回龙观", "天通苑", "良乡", "通州", "亦庄"]):
        cons.append(random.choice(HIDDEN_CONS_POOL["remote"]))
    return cons[:3]  # 最多 3 条


def main():
    # communities
    with open("data/communities.json", encoding="utf-8") as f:
        comms = json.load(f)
    for c in comms:
        for p in c.get("pros", []):
            p["evidence"] = pick_evidence(p["title"], p["summary"], True)
        for k in c.get("cons", []):
            k["evidence"] = pick_evidence(k["title"], k["summary"], False)
    with open("data/communities.json", "w", encoding="utf-8") as f:
        json.dump(comms, f, ensure_ascii=False, indent=2)
    print(f"✓ {len(comms)} 个小区已注入 evidence")

    # apartments
    with open("data/apartments.json", encoding="utf-8") as f:
        apts = json.load(f)
    for a in apts:
        a["hidden_cons"] = pick_hidden_cons(a)
    with open("data/apartments.json", "w", encoding="utf-8") as f:
        json.dump(apts, f, ensure_ascii=False, indent=2)
    print(f"✓ {len(apts)} 套房源已注入 hidden_cons")


if __name__ == "__main__":
    main()
