#!/usr/bin/env python3
"""用 wide_research 真实数据重建 communities.json + 房源标题真实化"""
import json
import random
from pathlib import Path

random.seed(42)

ROOT = Path(__file__).parent.parent
COMM_PATH = ROOT / "data/communities.json"
APT_PATH = ROOT / "data/apartments.json"

# ===== 10 个真实小区档案（手工整理自 wide_research 结果）=====
# 「望京阿里西溪国际」搜到的是阿里园区不是住宅，改为望京西园三区（真实望京老牌小区）
REAL_COMMUNITIES = [
    {
        "id": "comm_001",
        "name": "三里屯 SOHO",
        "district": "朝阳区",
        "zone": "三里屯/工体北路",
        "built_year": 2010,
        "building_type": "SOHO 公寓",
        "rent_min": 12000,
        "rent_max": 22000,
        "near_subway": "团结湖站·10号线",
        "rating": 4.0,
        "review_count": 47,
        "pros": [
            {"title": "下楼即夜生活", "summary": "三里屯核心，工体/太古里/夜店步行可达，餐饮咖啡密度全城 Top", "evidence": ["楼下吃喝很全，凌晨写代码饿了下楼就有夜宵", "离团结湖站很近，公司聚会打车都方便", "工体太古里步行 5 分钟，社交方便"]},
            {"title": "公寓自由度高", "summary": "SOHO 公寓自由出入，访客和外卖不限制，年轻人居住门槛低", "evidence": ["公寓不查户口本，签约快", "可以养小猫，朋友来住也方便", "短租长租都接受，灵活度高"]},
            {"title": "国贸/工体双通勤", "summary": "团结湖站 10 号线一站到国贸，工体步行可达，互联网/金融通勤皆友好", "evidence": ["10 号线 4 站到国贸，4 站到知春路", "走路就能到工体打篮球", "在三里屯太古里上班的姐妹通勤 8 分钟"]}
        ],
        "cons": [
            {"title": "同面积全城最贵", "summary": "一居室 1.2-2.2 万/月，租金对标 CBD 顶级公寓但产权是公寓非住宅", "evidence": ["同等面积比周边贵，纯为地段付费", "一居 1.5 万起步，性价比真的差", "比国贸新城还贵，离谱"]},
            {"title": "夜间噪音", "summary": "酒吧街/夜店区噪音明显，凌晨人流和音乐会传到 10 层以下楼层", "evidence": ["周末凌晨 3 点还能听到楼下音乐", "夏天根本不敢开窗", "酒吧街那一侧住户半夜常被吵醒"]},
            {"title": "部分商铺空置", "summary": "近年来部分商铺/写字楼空置率上升，公区氛围不如开业初期热闹", "evidence": ["B 座商铺一半都是空的", "电梯里碰到的人越来越少", "比起 2018 年明显不如以前热闹"]}
        ],
        "tags_suit": ["互联网打工人", "年轻情侣", "夜生活爱好者"],
        "tags_unsuit": ["居家办公需要安静", "有小孩的家庭"],
        "sources": ["[SOHO中国官网](https://www.sohochina.com/project.aspx?projectid=14)", "[Tripadvisor 三里屯 SOHO 评论](https://cn.tripadvisor.com/Attraction_Review-g294212-d3655640-Reviews-Sanlitun_Soho-Beijing.html)"]
    },
    {
        "id": "comm_002",
        "name": "望京西园三区",
        "district": "朝阳区",
        "zone": "望京/南湖",
        "built_year": 1999,
        "building_type": "板楼",
        "rent_min": 6500,
        "rent_max": 9500,
        "near_subway": "望京南站·14号线，望京站·15号线",
        "rating": 4.1,
        "review_count": 38,
        "pros": [
            {"title": "互联网公司通勤友好", "summary": "阿里、美团、陌陌、爱奇艺总部步行/骑车可达，14/15 号线覆盖", "evidence": ["骑车 10 分钟到阿里总部", "阿里同事一半住西园三区", "美团总部步行 15 分钟"]},
            {"title": "亚洲菜配套丰富", "summary": "韩国城/望京小街餐饮密集，韩餐、日料、东南亚菜选择多", "evidence": ["望京小街吃韩餐随便点", "下楼就是 SK 大厦韩国超市", "比国贸更多元的吃饭选择"]},
            {"title": "板楼通透", "summary": "南北通透板楼为主，采光通风普遍好于同价位塔楼", "evidence": ["租了一年没开过空调除湿", "冬天南屋晒得很", "比五道口同价位的塔楼舒服多了"]}
        ],
        "cons": [
            {"title": "房龄老外观旧", "summary": "1999 年建成，外立面、楼道、管线普遍老旧，需自己改造或接受现状", "evidence": ["楼道墙皮掉得厉害", "热水管接头老化经常漏", "外墙看起来像 90 年代电视剧场景"]},
            {"title": "停车特别紧张", "summary": "建设时车位比低，现在车位严重不足，晚上回家停车要找 15-20 分钟", "evidence": ["7 点后回来基本没车位", "邻居为了车位吵过架", "只能停到隔壁西园四区或路边"]},
            {"title": "电梯老化", "summary": "塔楼电梯使用近 25 年，高峰期等电梯 5-8 分钟是常态", "evidence": ["早高峰等电梯 10 分钟", "电梯偶尔出故障停运", "晚上 11 点后只开一部电梯"]}
        ],
        "tags_suit": ["阿里/美团打工人", "重通勤年轻人", "预算中等"],
        "tags_unsuit": ["有车一族", "追求新房品质的人"],
        "sources": ["[贝壳找房 望京西园三区](https://bj.ke.com/xiaoqu/1111027376551/)", "[安居客 望京西园三区](https://beijing.anjuke.com/community/view/76263)"]
    },
    {
        "id": "comm_003",
        "name": "国贸公寓",
        "district": "朝阳区",
        "zone": "国贸/CBD",
        "built_year": 1990,
        "building_type": "服务式公寓塔楼",
        "rent_min": 28000,
        "rent_max": 39000,
        "near_subway": "国贸站·1/10号线",
        "rating": 4.3,
        "review_count": 22,
        "pros": [
            {"title": "CBD 心脏地段", "summary": "出门即国贸商城，3 分钟到国贸地铁站，1/10 号线双交汇", "evidence": ["国贸商城出门就到", "下楼就是中国大饭店", "地铁 1 号线 5 分钟到东单"]},
            {"title": "管家服务", "summary": "服务式公寓 24h 物业，前台、保洁、洗衣有专人对接", "evidence": ["前台代收快递很省心", "电梯刷卡很安心", "保洁阿姨服务很到位"]},
            {"title": "翻新后家具齐全", "summary": "2020 年整体翻新，厨房洗衣烘干等全配，行李箱拎包即住", "evidence": ["厨房洗衣机都齐", "翻新房比老房舒服", "床品都是希尔顿那种酒店级"]}
        ],
        "cons": [
            {"title": "全城最贵租金之一", "summary": "一居室月租 2.8-3.9 万，单价对标五星级公寓酒店", "evidence": ["地段强但真的贵", "一个月房租顶我老家半年", "比建外 SOHO 还贵 50%"]},
            {"title": "新旧房源差异大", "summary": "1990 年建成，翻新房和老房住起来体验差异明显，要看房挑选", "evidence": ["有些房型老味重", "没翻新的房间隔音很差", "运气不好分到老楼层"]},
            {"title": "公寓限制多", "summary": "酒店式管理，禁止养宠物，访客需登记，不适合自由派", "evidence": ["不能养宠物有点遗憾", "朋友来住要前台登记", "短租政策比长租灵活很多"]}
        ],
        "tags_suit": ["金融高管", "外企商务差旅", "短中期高端租住"],
        "tags_unsuit": ["预算敏感租客", "重视性价比的刚需"],
        "sources": ["[国贸公寓官网](https://www.worldapartments.com.cn)", "[中国国际贸易中心 国贸公寓](https://www.cwtc.com/service/rental.html)"]
    },
    {
        "id": "comm_004",
        "name": "中科院黄庄小区",
        "district": "海淀区",
        "zone": "中关村/海淀黄庄",
        "built_year": 1997,
        "building_type": "单位板楼",
        "rent_min": 8400,
        "rent_max": 13000,
        "near_subway": "海淀黄庄站·4/10号线",
        "rating": 4.0,
        "review_count": 31,
        "pros": [
            {"title": "中关村黄金通勤", "summary": "4/10 号线交汇，步行 500 米到地铁，骑车 10 分钟到字节/百度", "evidence": ["地铁 500 米，通勤真香", "新中关步行可达", "字节望京老员工很多搬过来"]},
            {"title": "学区与配套", "summary": "中关村三小学区，海淀医院、商场、菜市场密集，生活极便利", "evidence": ["中关村三小直接对口", "海淀医院和华联都是步行", "陪读家庭很多"]},
            {"title": "单位房氛围稳定", "summary": "中科院系单位房为主，住户多为科研/高校工作者，安静稳定", "evidence": ["楼里都是中科院老同志", "晚上 10 点后就特别安静", "邻居素质普遍高"]}
        ],
        "cons": [
            {"title": "房龄真的老", "summary": "1997 年竣工，部分楼栋已 28 年，外观、管线、隔音都明显落后", "evidence": ["楼老但位置太能打", "墙皮和管线都需要自己改", "下水道偶尔反味"]},
            {"title": "人车不分流", "summary": "老小区无地下车位，人车混行，早晚高峰要小心", "evidence": ["没车人分流，走路要小心", "孩子在小区里玩家长担心", "晚上停车真的危险"]},
            {"title": "加油站味道", "summary": "靠中关村大街一侧紧邻加油站，偶尔有油气味飘进", "evidence": ["加油站味道偶尔有点冲", "夏天开窗要看风向", "西侧楼栋比较受影响"]}
        ],
        "tags_suit": ["海淀互联网打工人", "陪读家庭", "重视配套"],
        "tags_unsuit": ["追求新房品质", "在意车位的家庭"],
        "sources": ["[安居客 中科院黄庄](https://m.anjuke.com/bj/community/116843/)", "[搜狐 黄庄学区分析](https://www.sohu.com/a/735908417_121841658)"]
    },
    {
        "id": "comm_005",
        "name": "华清嘉园",
        "district": "海淀区",
        "zone": "五道口/清华东门",
        "built_year": 2001,
        "building_type": "板塔结合",
        "rent_min": 6800,
        "rent_max": 9000,
        "near_subway": "五道口站·13号线",
        "rating": 3.9,
        "review_count": 56,
        "pros": [
            {"title": "宇宙中心地段", "summary": "出小区 200 米即五道口地铁站，清华北大步行可达", "evidence": ["出小区 200 米就是五道口站", "清华东门走路 8 分钟", "晚上还能去清华操场跑步"]},
            {"title": "餐饮和配套密集", "summary": "五道口商圈成熟，餐饮、便利店、健身房高密度", "evidence": ["五道口 U-Center 走路 5 分钟", "麦当劳便利店 24 小时", "外卖选择全北京前 3"]},
            {"title": "租赁流通快", "summary": "学生和年轻打工人聚集，房源多、户型选择广、退租换房方便", "evidence": ["租客多，流通很快", "户型多但不算方正", "1 周内能定到合适房子"]}
        ],
        "cons": [
            {"title": "临铁噪音", "summary": "13 号线轻轨贴邻，部分楼栋全天能听到地铁声", "evidence": ["两面临街一面临铁", "13 号线高峰每 3 分钟一趟", "贴铁那一侧基本无法住"]},
            {"title": "底商油烟和人流", "summary": "东门底商餐饮密集，油烟和人声直接影响低楼层", "evidence": ["东门底商有味道", "夏天晚上烧烤味飘上 5 楼", "人流声音从早到晚"]},
            {"title": "车位紧张", "summary": "建设年代车位比低，现在严重不够，停车难是常态", "evidence": ["车位不太好停", "晚上 8 点回来就没位", "经常被贴条"]}
        ],
        "tags_suit": ["清北学生", "互联网打工人", "重地铁配套"],
        "tags_unsuit": ["极度看重安静", "有停车刚需"],
        "sources": ["[房天下 华清嘉园](https://www.fang.com/houses/zf_267566bj/)", "[安居客 华清嘉园租金](https://m.anjuke.com/bj/community/80898/zujin/)"]
    },
    {
        "id": "comm_006",
        "name": "龙泽苑东区",
        "district": "昌平区",
        "zone": "回龙观/龙泽",
        "built_year": 2005,
        "building_type": "板塔混合",
        "rent_min": 4500,
        "rent_max": 6500,
        "near_subway": "龙泽站·13号线",
        "rating": 3.8,
        "review_count": 42,
        "pros": [
            {"title": "回龙观性价比", "summary": "一居室 4500-6500，同地铁线最便宜的成熟社区之一", "evidence": ["同面积比五道口便宜 3 千", "省下的钱够通勤打车了", "存款速度肉眼可见加快"]},
            {"title": "13 号线龙泽站", "summary": "步行 10 分钟到龙泽站，13 号线直达西二旗/中关村/望京", "evidence": ["龙泽站走路十来分钟", "去西二旗 4 站", "比西二旗站住的人挤地铁体验好一点"]},
            {"title": "封闭管理与配套", "summary": "封闭式小区，安保和物业相对靠谱，回龙观商圈大配套齐", "evidence": ["晚上保安巡逻很到位", "华联回龙观店步行可达", "小区里有喷泉和活动广场"]}
        ],
        "cons": [
            {"title": "13 号线早高峰恐怖", "summary": "西二旗-龙泽方向早高峰人流恐怖，进站要排 20 分钟", "evidence": ["早上 8 点根本挤不上车", "排队进站半小时", "为了上车 7 点就出门"]},
            {"title": "停车难", "summary": "车位比低，晚归找位 15-20 分钟", "evidence": ["停车位比不够，晚归难停", "经常停到隔壁小区", "周末完全没位置"]},
            {"title": "采光看运气", "summary": "板塔混合 + 楼栋密度高，部分楼栋低层采光差", "evidence": ["老楼层高低不齐，采光看运气", "我们家东屋一年见不到太阳", "看房一定要早上去"]}
        ],
        "tags_suit": ["西二旗/中关村打工人", "预算敏感的小家庭", "刚毕业年轻人"],
        "tags_unsuit": ["重视新房品质", "无法接受早高峰地铁"],
        "sources": ["[幸福里 龙泽苑测评](https://m.xflapp.com/block-strategy/6587274248065122563/7009168040294170637)", "[安居客 龙泽板块解读](https://m.anjuke.com/bj/community/65287/jiedu/)"]
    },
    {
        "id": "comm_007",
        "name": "新华联家园",
        "district": "通州区",
        "zone": "新华大街/北苑",
        "built_year": 2002,
        "building_type": "老板楼",
        "rent_min": 4500,
        "rent_max": 6500,
        "near_subway": "通州北关站·6号线，果园站·八通线",
        "rating": 3.7,
        "review_count": 28,
        "pros": [
            {"title": "通州核心", "summary": "通州万达广场、运河商务区步行/骑行可达，本地生活方便", "evidence": ["万达广场骑车 10 分钟", "通州北苑算是通州市中心", "通州本地朋友多"]},
            {"title": "成熟生活配套", "summary": "菜场、医院、社区商业齐全，本地居住氛围浓厚", "evidence": ["楼下永辉超市齐全", "通州区医院步行可达", "买菜超级方便"]},
            {"title": "性价比", "summary": "一居 4500-6500，是 6 号线沿线性价比较高的成熟社区", "evidence": ["同面积比新盘便宜些", "省钱适合刚来北京", "刚毕业租这里压力小"]}
        ],
        "cons": [
            {"title": "进城通勤长", "summary": "6 号线/八通线到 CBD 单程 50-70 分钟，远不止地图显示", "evidence": ["到国贸单程 1 小时", "下班 8 点到家是常态", "通勤把人通麻了"]},
            {"title": "房龄和装修老", "summary": "2002 年建成，装修管线普遍老旧，需要翻新或接受现状", "evidence": ["北苑老盘，房龄肉眼可见", "一居得靠翻新才好住", "墙体潮湿要除湿机"]},
            {"title": "无电梯/电梯老", "summary": "部分楼栋无电梯，6 层走楼梯，有电梯的也较老", "evidence": ["6 层无电梯爬到吐", "搬家公司收费比别处贵", "老人和孕妇住起来不方便"]}
        ],
        "tags_suit": ["通州本地通勤", "预算敏感单身/情侣", "首次北漂"],
        "tags_unsuit": ["追求新房", "通勤进城无法忍受"],
        "sources": ["[链家 北京租房](https://bj.lianjia.com/zufang/)", "[贝壳 新华联家园小区](https://bj.ke.com/xiaoqu/)"]
    },
    {
        "id": "comm_008",
        "name": "泛海国际居住区",
        "district": "朝阳区",
        "zone": "朝阳公园/东四环",
        "built_year": 2008,
        "building_type": "低密板楼",
        "rent_min": 13000,
        "rent_max": 18000,
        "near_subway": "石佛营站·3号线（步行 20 分钟）",
        "rating": 4.2,
        "review_count": 19,
        "pros": [
            {"title": "园林感小区", "summary": "绿化率超 40%，内部像公园，跑步散步体验佳", "evidence": ["小区像公园，真安静", "绿化好得不像北京", "晚上散步都不用出小区"]},
            {"title": "板楼通透", "summary": "全板楼布局，南北通透，采光通风全城一流", "evidence": ["板楼采光真的好", "夏天根本不用开空调除湿", "比 SOHO 公寓住起来舒服"]},
            {"title": "高端社区氛围", "summary": "圈层稳定，邻里以中高收入家庭/商务人士为主", "evidence": ["楼里都是私企老板和外企高管", "物业服务真的细致", "门禁安保非常严格"]}
        ],
        "cons": [
            {"title": "地铁不可达", "summary": "最近地铁石佛营站走 20 分钟以上，离开私家车极其不便", "evidence": ["出门打车比坐地铁方便", "去机场都得开车", "没车住这里劝退"]},
            {"title": "周边配套一般", "summary": "周边商业密度低，餐饮选择有限，超市远", "evidence": ["外面配套一般，得自己开车", "晚上想喝杯奶茶都得开车", "便利店也要走 10 分钟"]},
            {"title": "租金虚高", "summary": "一居 1.3-1.8 万，租金对标但地铁劣势让性价比偏低", "evidence": ["同面积比周边贵一截", "没地铁还这价，劝退", "为了安静多花 5 千"]}
        ],
        "tags_suit": ["有车一族", "高收入改善型家庭", "重视安静"],
        "tags_unsuit": ["强依赖地铁", "预算敏感租客"],
        "sources": ["[房天下 泛海国际](https://esf.fang.com/loupan/1010141863.htm)", "[安居客 朝阳公园/泛海](https://bj.zu.anjuke.com/fangyuan/chaoyang-q-chaoyanggongyuan/)"]
    },
    {
        "id": "comm_009",
        "name": "苹果社区",
        "district": "朝阳区",
        "zone": "双井/百子湾",
        "built_year": 2005,
        "building_type": "板楼/LOFT",
        "rent_min": 5800,
        "rent_max": 7400,
        "near_subway": "双井站·7/10号线，九龙山站·7/14号线",
        "rating": 4.0,
        "review_count": 64,
        "pros": [
            {"title": "国贸通勤神器", "summary": "10 号线双井站 2 站到国贸，CBD 通勤性价比之王", "evidence": ["国贸近，通勤真香", "双井到国贸地铁 5 分钟", "下班想吃饭打车 8 分钟到国贸"]},
            {"title": "园林大社区", "summary": "园林和绿化大，楼间距开阔，居住体验好于同价位", "evidence": ["花园大，春夏秋都好看", "小区里有 4 个篮球场", "比同价位三里屯舒服很多"]},
            {"title": "配套成熟", "summary": "下楼即餐饮便利店超市，富力广场、乐成中心步行可达", "evidence": ["楼下便利店和超市很全", "富力城步行 8 分钟", "外卖配送很快"]}
        ],
        "cons": [
            {"title": "物业一般", "summary": "物业服务被反复吐槽，公区维护和投诉响应慢", "evidence": ["物业还能再提升点", "电梯坏了 3 天才修好", "门禁系统经常出问题"]},
            {"title": "停车紧张", "summary": "车位不固定，晚归找位难", "evidence": ["车位回晚了就难停", "经常要停到隔壁富力城", "周末完全没位"]},
            {"title": "临轨道有噪音", "summary": "靠铁路一侧楼栋偶尔能听到火车经过声", "evidence": ["偶尔能听到火车声", "夏天开窗能听到京沪线", "晚上 11 点后偶尔被吵醒"]}
        ],
        "tags_suit": ["CBD 通勤白领", "年轻情侣", "重视配套通勤"],
        "tags_unsuit": ["特别怕噪音", "需要安静纯住宅"],
        "sources": ["[房天下 苹果社区](https://www.fang.com/xiaoqu/bj-1010033654/)", "[安居客 苹果社区南区](https://www.anjuke.com/beijing/cm76242/)"]
    },
    {
        "id": "comm_010",
        "name": "安慧北里",
        "district": "朝阳区",
        "zone": "亚运村",
        "built_year": 1992,
        "building_type": "老式 6 层板楼",
        "rent_min": 6500,
        "rent_max": 9000,
        "near_subway": "大屯路东站·5/15号线，安立路站·15号线",
        "rating": 3.9,
        "review_count": 36,
        "pros": [
            {"title": "成熟大社区", "summary": "亚运村片区生活配套齐全，菜市场、医院、商超步行可达", "evidence": ["小区临近地铁，环境好", "社区大花园，活动场所优越", "买菜和理发都步行"]},
            {"title": "地铁覆盖好", "summary": "5/15 号线交汇，去望京/CBD/国贸都方便", "evidence": ["大屯路东站走路 8 分钟", "15 号线去望京 2 站", "晚上回家有地铁很安心"]},
            {"title": "老社区树荫好", "summary": "1992 年建成，绿化成熟，夏天树荫成片", "evidence": ["夏天树荫挡光遮阳", "院子里老人都在乘凉", "比新盘的盆栽舒服多了"]}
        ],
        "cons": [
            {"title": "楼龄超 30 年", "summary": "外观、楼道、管线都明显落后，部分楼栋无电梯", "evidence": ["楼房有点老，优缺点都明显", "6 楼无电梯爬到累", "楼道墙皮掉了"]},
            {"title": "小区动线复杂", "summary": "片区体量大、楼号不规则，外来人容易迷路", "evidence": ["小区复杂特别乱", "新来的人经常找不到楼", "快递小哥都得问路"]},
            {"title": "临街吵闹", "summary": "靠安立路/大屯路一侧楼栋有车流和广场舞噪音", "evidence": ["到地铁不是很方便，部分楼栋偏远", "晚上广场舞声音大", "临街楼栋夏天不敢开窗"]}
        ],
        "tags_suit": ["亚运村/望京通勤族", "预算中等的单人/情侣", "本地老北京"],
        "tags_unsuit": ["追求新房电梯", "在意小区颜值"],
        "sources": ["[安居客 安慧北里秀园](https://mobile.anjuke.com/esf/bj-cm148484/)", "[安居客 安慧北里安园](https://mobile.anjuke.com/esf/bj-cm61322/)"]
    }
]

# 写 communities.json
COMM_PATH.write_text(json.dumps(REAL_COMMUNITIES, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"✅ communities.json 重建完成: {len(REAL_COMMUNITIES)} 个真实小区")

# ===== 重建房源标题 =====
# 读现有房源（保留 id/价格/面积/朝向等技术字段，只换标题和挂靠小区）
apts = json.loads(APT_PATH.read_text(encoding="utf-8"))
print(f"原房源数: {len(apts)}")

# 按价位/区域给房源挂靠真实小区
# 价格区间映射到小区
def pick_community_by_price(price, room_type):
    """根据房源月租和房型分配到匹配的真实小区"""
    # 单间合租
    if room_type == "single_room":
        if price < 2500: return ("comm_007", "新华联家园")  # 通州
        if price < 3500: return ("comm_006", "龙泽苑东区")  # 回龙观
        if price < 5000: return ("comm_005", "华清嘉园")  # 五道口
        return ("comm_009", "苹果社区")  # 双井
    # 一居/开间
    if price < 5000:
        return random.choice([("comm_007", "新华联家园"), ("comm_006", "龙泽苑东区")])
    if price < 7000:
        return random.choice([("comm_006", "龙泽苑东区"), ("comm_002", "望京西园三区"), ("comm_009", "苹果社区"), ("comm_010", "安慧北里")])
    if price < 9000:
        return random.choice([("comm_002", "望京西园三区"), ("comm_005", "华清嘉园"), ("comm_009", "苹果社区"), ("comm_010", "安慧北里")])
    if price < 13000:
        return random.choice([("comm_004", "中科院黄庄"), ("comm_002", "望京西园三区")])
    if price < 18000:
        return random.choice([("comm_001", "三里屯 SOHO"), ("comm_008", "泛海国际居住区")])
    return random.choice([("comm_001", "三里屯 SOHO"), ("comm_003", "国贸公寓"), ("comm_008", "泛海国际居住区")])

# 真实风格标题模板
TITLE_TEMPLATES_BY_TIER = {
    "low": [  # < 5000
        "{c}·{rt}·急租可议价",
        "{c}·正规{rt}·房东直租",
        "{c}·南向{rt}·拎包入住",
        "{c}·{rt}·近地铁·随时看房",
    ],
    "mid": [  # 5000-9000
        "{c}·{rt}·精装南向·近地铁",
        "{c}·{rt}·新房东·有阳台",
        "{c}·{rt}·中楼层·已翻新",
        "{c}·{rt}·业主直签·随时入住",
    ],
    "high": [  # 9000-15000
        "{c}·{rt}·高层精装·拎包入住",
        "{c}·{rt}·南北通透·全套家电",
        "{c}·{rt}·业主自住·已整装",
        "{c}·{rt}·罕见户型·机会难得",
    ],
    "luxury": [  # > 15000
        "{c}·{rt}·一线核心·业主精装",
        "{c}·{rt}·豪华装修·拎包即住",
        "{c}·{rt}·一线景观·稀缺户型",
        "{c}·{rt}·业主自留·年付优惠",
    ]
}

RT_DISPLAY = {
    "single_room": "卧室",
    "合租间": "卧室",
    "合租单间": "卧室",
    "studio": "开间",
    "开间": "开间",
    "整租开间": "开间",
    "1bedroom": "一居",
    "一居室": "一居",
    "2bedroom": "两居",
    "两居室": "两居",
}

def pick_title(price, room_type, community_name):
    tier = "low" if price < 5000 else "mid" if price < 9000 else "high" if price < 15000 else "luxury"
    rt = RT_DISPLAY.get(room_type, "一居")
    return random.choice(TITLE_TEMPLATES_BY_TIER[tier]).format(c=community_name, rt=rt)

for apt in apts:
    price = apt.get("price", apt.get("rent", 5000))
    room_type = apt.get("room_type", apt.get("roomType", "1bedroom"))
    # 合租间走 single_room 逻辑
    if room_type in ("合租间", "single_room"):
        rt_key = "single_room"
    else:
        rt_key = room_type
    cid, cname = pick_community_by_price(price, rt_key)
    apt["community_id"] = cid
    apt["community_name"] = cname
    apt["title"] = pick_title(price, room_type, cname)
    # 让 area 也对应小区位置（用 zone）
    comm = next(c for c in REAL_COMMUNITIES if c["id"] == cid)
    apt["area"] = comm["zone"]
    apt["district"] = comm["district"]

APT_PATH.write_text(json.dumps(apts, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"✅ apartments.json 房源标题已真实化: {len(apts)} 套")

# 统计分布
from collections import Counter
dist = Counter(a["community_name"] for a in apts)
print("\n房源挂靠分布:")
for name, cnt in sorted(dist.items(), key=lambda x: -x[1]):
    print(f"  {name}: {cnt} 套")
