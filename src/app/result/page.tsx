"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Radar as RadarChart2,
  ResponsiveContainer,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadarChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Trophy,
  Crown,
  Medal,
} from "lucide-react";

const MOCK_RADAR_DATA = [
  { axis: "通勤", value: 92, fullMark: 100 },
  { axis: "价格", value: 76, fullMark: 100 },
  { axis: "房型", value: 68, fullMark: 100 },
  { axis: "装修", value: 55, fullMark: 100 },
  { axis: "小区品质", value: 48, fullMark: 100 },
  { axis: "楼栋类型", value: 32, fullMark: 100 },
];

const MOCK_WEIGHTS = [
  { name: "通勤时间", icon: "🚇", weight: 0.32, color: "bg-brand-red" },
  { name: "月租价格", icon: "💰", weight: 0.24, color: "bg-rose-400" },
  { name: "房型", icon: "🏠", weight: 0.18, color: "bg-amber-400" },
  { name: "装修档次", icon: "✨", weight: 0.13, color: "bg-emerald-400" },
  { name: "小区品质", icon: "🏢", weight: 0.09, color: "bg-sky-400" },
  { name: "楼栋类型", icon: "🏗️", weight: 0.04, color: "bg-violet-400" },
];

const MOCK_COMPARE_RANK = [
  {
    rank: 1,
    title: "望京·阿里西溪一居",
    price: 6500,
    score: 0.42,
    matchRate: 89,
    why: "通勤 18 分钟，房型 + 价格双满足，且小区物业评分高",
  },
  {
    rank: 2,
    title: "十里堡·泛海国际",
    price: 7200,
    score: 0.28,
    matchRate: 78,
    why: "通勤略远但精装优势明显，性价比突出",
  },
  {
    rank: 3,
    title: "三里屯 SOHO 网红开间",
    price: 6800,
    score: 0.18,
    matchRate: 64,
    why: "颜值在线，但开间面积偏小，性价比一般",
  },
  {
    rank: 4,
    title: "回龙观龙泽一居",
    price: 4500,
    score: 0.07,
    matchRate: 41,
    why: "价格优势显著，但通勤时间不符合你的偏好",
  },
  {
    rank: 5,
    title: "国贸三期旁高层一居",
    price: 11500,
    score: 0.05,
    matchRate: 28,
    why: "通勤极短，但价格远超你愿意承受的区间",
  },
];

function ResultInner() {
  const params = useSearchParams();
  const from = params.get("from") ?? "quiz";

  return (
    <div className="container py-10 md:py-14 max-w-5xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        返回首页
      </Link>

      {from === "compare" ? <CompareResult /> : <QuizResult />}

      {/* 底部 CTA */}
      <div className="mt-12 flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg">
          <Link href="/map">
            看看符合你偏好的房源
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/community/comm_001">
            或者，先看一个小区体检报告
          </Link>
        </Button>
      </div>
    </div>
  );
}

function QuizResult() {
  return (
    <div>
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-red-deep mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          你的偏好画像（场景 A · 8 题完成）
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          你是一个
          <span className="bg-gradient-to-r from-brand-red to-rose-500 bg-clip-text text-transparent">
            {" "}
            通勤优先型
            {" "}
          </span>
          租客
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          基于你在 8 道题里的选择，我们用 Conjoint Analysis 计算了你在 6 个维度上的相对权重。
          你最看重通勤效率，其次才是价格，对硬件本身相对宽容。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="soft">#通勤优先型</Badge>
          <Badge variant="outline">#不愿意为颜值溢价</Badge>
          <Badge variant="outline">#可接受小户型</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 雷达图 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-1">偏好雷达图</h2>
          <p className="text-xs text-muted-foreground mb-4">
            数值越高，说明你越看重这个维度（0-100）
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={MOCK_RADAR_DATA}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <RadarChart2
                  name="你的偏好"
                  dataKey="value"
                  stroke="#FF2442"
                  fill="#FF2442"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 权重排序 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-1">维度权重排序</h2>
          <p className="text-xs text-muted-foreground mb-4">
            这是你选房时各维度的相对重要性
          </p>
          <div className="space-y-4 mt-6">
            {MOCK_WEIGHTS.map((w, i) => (
              <div key={w.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums w-4">
                      #{i + 1}
                    </span>
                    <span className="text-base">{w.icon}</span>
                    <span className="font-medium">{w.name}</span>
                  </div>
                  <span className="text-sm font-mono font-semibold text-brand-red-deep">
                    {(w.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full ${w.color} rounded-full transition-all duration-700`}
                    style={{ width: `${w.weight * 100 / 0.32 * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 解读卡片 */}
      <Card className="mt-6 p-6 bg-brand-red-pale/40 border-brand-red/10">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-red-deep" />
          我们的解读
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          作为<strong>通勤优先型</strong>租客，你会愿意在装修和小区品质上做出妥协，换取更短的通勤时间。
          推荐你优先考虑：<strong>望京、十里堡、双井</strong> 这类既靠近核心商圈又有合理价位的区域，
          避免回龙观这种通勤拉长 30 分钟以上的远郊。
        </p>
      </Card>
    </div>
  );
}

function CompareResult() {
  const podium = [Crown, Trophy, Medal];
  return (
    <div>
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-red-deep mb-2">
          <Trophy className="h-3.5 w-3.5" />
          决策报告（场景 B · 10 轮对决完成）
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          基于你的偏好，
          <br className="md:hidden" />
          这是 5 套候选的排序
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          通过 Bradley-Terry 模型分析你 10 轮两两比较的胜负数据，得到每套房源的"相对实力分"。
          下面是从最契合到最不契合的排名。
        </p>
      </div>

      <div className="space-y-3">
        {MOCK_COMPARE_RANK.map((item, i) => {
          const Icon = podium[i] ?? Medal;
          return (
            <Card
              key={item.title}
              className={`p-5 flex items-center gap-4 ${
                i === 0
                  ? "border-brand-red/30 bg-brand-red-pale/20 shadow-card-hover"
                  : ""
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${
                  i === 0
                    ? "bg-brand-red text-primary-foreground"
                    : i === 1
                      ? "bg-amber-100 text-amber-700"
                      : i === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < 3 ? (
                  <Icon className="h-5 w-5" />
                ) : (
                  <span className="font-bold text-lg">#{item.rank}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold truncate">{item.title}</span>
                  {i === 0 && (
                    <Badge variant="default" className="text-[10px]">
                      最契合
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {item.why}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-muted-foreground">契合度</div>
                <div
                  className={`text-xl font-bold tabular-nums ${
                    i === 0 ? "text-brand-red-deep" : "text-foreground"
                  }`}
                >
                  {item.matchRate}%
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  ¥{item.price.toLocaleString()}/月
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-muted-foreground">加载中...</div>}>
      <ResultInner />
    </Suspense>
  );
}
