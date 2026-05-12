"""
用 Claude (via pplx llm_api) 离线生成决策助手的题面池
输出：data/question-pool.json
"""
import asyncio
import json
import sys
from pathlib import Path

from pplx.python.sdks.llm_api import (
    Client,
    Conversation,
    Identity,
    LLMAPIClient,
    SamplingParams,
    TextBlock,
)

OUT = Path(__file__).resolve().parent.parent / "data" / "question-pool.json"

DIMENSIONS = [
    {
        "key": "price",
        "label": "月租金",
        "favorSemantics": "favoredSide 表示『省钱派会选这套』。比如 A 比 B 贵 3000 元，那对省钱派来说更优的是 B，favoredSide=B。",
    },
    {
        "key": "commuteMin",
        "label": "通勤分钟数",
        "favorSemantics": "favoredSide 表示『短通勤派会选这套』。比如 A 通勤 20min、B 通勤 60min，favoredSide=A。",
    },
    {
        "key": "decoration",
        "label": "装修档次",
        "favorSemantics": "favoredSide 表示『精装派会选这套』，即装修更好的那套。",
    },
    {
        "key": "communityQuality",
        "label": "小区品质",
        "favorSemantics": "favoredSide 表示『品质派会选这套』，即物业好、绿化好的那套。",
    },
    {
        "key": "buildingType",
        "label": "楼栋类型",
        "favorSemantics": "favoredSide 表示『新楼派会选这套』，即新塔楼那套。",
    },
    {
        "key": "area",
        "label": "面积大小",
        "favorSemantics": "favoredSide 表示『大面积派会选这套』，即更大的那套。",
    },
    {
        "key": "roomType",
        "label": "房型（合租 vs 整租）",
        "favorSemantics": "favoredSide 表示『一居室/整租派会选这套』，即独立空间那套。另一边是合租间。",
    },
]

DIFF_LEVELS = ["large", "medium", "small"]
PER_DIM_PER_LEVEL = 3

PROMPT_TEMPLATE = """你是一个北京年轻人租房决策辅助产品的文案专家，正在为一个面向小红书用户的"租房雷达"App 写出题文案。

用户上传了两套候选房源 A 和 B，正在纠结选哪套。系统检测到差异维度「{dim_label}」（差异档：{diff_level}，large=差距很大 / medium=差距明显 / small=差距小但可感知），需要 {n} 条**风格各异**的二选一对比题来帮用户做决策。

## 题面 schema（每条必须严格符合）
{{
  "id": "q_{dim_key}_{diff_level}_<编号>",
  "dimension": "{dim_key}",
  "diffLevel": "{diff_level}",
  "favoredSide": "A" 或 "B",
  "title": "8-14字的标题",
  "body": "30-60字正文。可以含占位符 {{priceDiff}} {{commuteDiff}} {{areaDiff}} {{yearDiff}}，运行时会用真实数字替换。",
  "options": [
    {{ "label": "10-16字第一人称选项", "endorsedSide": "A" }},
    {{ "label": "10-16字第一人称选项", "endorsedSide": "B" }}
  ]
}}

## 语义说明
{favor_semantics}
- favoredSide 表示"潜台词"在劝向哪套，但语气必须中立、像朋友在帮你想清楚。
- options 数组中 endorsedSide 必须一个 A 一个 B。

## 文案风格指引（小红书味儿）
- 第一人称、口语、像朋友在劝你
- 戳真实痛点（不是理性 ROI 那种话）
- 偶尔可以用一个 emoji
- 避免"投资回报""性价比""综合考量"这种 ToB 用语
- 反平台叙事——不粉饰房源，把藏起来的代价拍出来给用户看

## 输出格式
**只输出一个 JSON 数组**，包含 {n} 个对象。不要任何解释文字、不要 markdown 代码块标记。
"""


async def call_claude(client, prompt):
    convo = Conversation()
    convo.add_user([TextBlock(text=prompt)])
    result = await client.messages.create(
        model="claude_sonnet_4_6",
        convo=convo,
        identity=Identity(client=Client.ASI, use_case="zufang_radar_gen_questions"),
        sampling_params=SamplingParams(max_tokens=3000),
    )
    # 抽取文本
    parts = []
    for block in result.content:
        if hasattr(block, "text"):
            parts.append(block.text)
    return "".join(parts)


def parse_json_array(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1:
        raise ValueError(f"找不到 JSON 数组: {text[:200]}")
    return json.loads(text[start : end + 1])


async def main():
    client = LLMAPIClient()
    all_questions = []

    for dim in DIMENSIONS:
        for level in DIFF_LEVELS:
            prompt = PROMPT_TEMPLATE.format(
                dim_label=dim["label"],
                dim_key=dim["key"],
                diff_level=level,
                n=PER_DIM_PER_LEVEL,
                favor_semantics=dim["favorSemantics"],
            )
            print(f"→ {dim['key']} × {level} ...", flush=True)
            try:
                txt = await call_claude(client, prompt)
                arr = parse_json_array(txt)
                for i, q in enumerate(arr):
                    q["id"] = f"q_{dim['key']}_{level}_{i+1}"
                    q["dimension"] = dim["key"]
                    q["diffLevel"] = level
                all_questions.extend(arr)
                print(f"   ✓ {len(arr)} 条", flush=True)
            except Exception as e:
                print(f"   ✗ {e}", file=sys.stderr, flush=True)

    # 平局收尾题
    tie_prompt = """你是租房雷达 App 的文案专家。请生成 5 条用于"两套房源差异都很小、无显著胜出方"时的收尾题。

格式（严格 JSON 数组）：
[
  {
    "id": "q_tie_1",
    "dimension": "tie",
    "diffLevel": "none",
    "favoredSide": "neutral",
    "title": "8-14字",
    "body": "30-60字。可以问'除了纸面参数你看重什么''跟着第一印象走是不是更靠谱''周围人会怎么劝你'等元问题。",
    "options": [
      { "label": "10-16字", "endorsedSide": "A" },
      { "label": "10-16字", "endorsedSide": "B" }
    ]
  }
]

风格：小红书口语，朋友式劝告。只输出 JSON 数组。"""
    print("→ 平局收尾题...", flush=True)
    try:
        txt = await call_claude(client, tie_prompt)
        tie_arr = parse_json_array(txt)
        for i, q in enumerate(tie_arr):
            q["id"] = f"q_tie_{i+1}"
            q["dimension"] = "tie"
            q["diffLevel"] = "none"
        all_questions.extend(tie_arr)
        print(f"   ✓ {len(tie_arr)} 条", flush=True)
    except Exception as e:
        print(f"   ✗ {e}", file=sys.stderr, flush=True)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
    print(f"\n✅ 写出 {len(all_questions)} 条到 {OUT}")


if __name__ == "__main__":
    asyncio.run(main())
