import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  MapPin,
  MessagesSquare,
  ArrowRight,
  Compass,
  Brain,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        {/* 背景渐变和装饰 */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-red-pale via-brand-red-pale/40 to-background" />
        <div className="absolute top-20 right-[10%] -z-10 h-72 w-72 rounded-full bg-brand-red/10 blur-3xl" />
        <div className="absolute top-40 left-[5%] -z-10 h-56 w-56 rounded-full bg-rose-200/30 blur-3xl" />

        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8 shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              北京 · 内测中
              <span className="text-border">|</span>
              小红书面试 Demo
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-[1.05]">
              租房，不是
              <br />
              <span className="bg-gradient-to-r from-brand-red to-rose-500 bg-clip-text text-transparent">
                信息搜集大赛。
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
              90% 的痛点不是"找不到房源"，而是
              <span className="text-foreground font-medium">不知道自己要什么</span>、
              <span className="text-foreground font-medium">不知道通勤多久能忍</span>、
              <span className="text-foreground font-medium">看不到真实居住体验</span>。
              <br />
              <span className="text-muted-foreground/80 text-base">
                租房雷达，帮年轻人租到真正适合自己的房子。
              </span>
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <Link
                href="/quiz"
                className="group relative rounded-2xl bg-brand-red text-white p-5 text-left shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/80 mb-2">
                  <Brain className="h-3.5 w-3.5" />
                  第一步 · 弄清自己
                </div>
                <div className="text-lg font-bold">2 分钟租房人格测试</div>
                <div className="text-sm text-white/80 mt-1 leading-relaxed">
                  8 道虚构房源选择题 → 反推你说不清的隐性偏好
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium">
                  开始测试 <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link
                href="/map"
                className="group relative rounded-2xl bg-foreground text-background p-5 text-left shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-sky-400/30 blur-2xl" />
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-sky-300 mb-2">
                  <Compass className="h-3.5 w-3.5" />
                  第二步 · 圈定范围
                </div>
                <div className="text-lg font-bold">还原你的通勤地图</div>
                <div className="text-sm text-background/70 mt-1 leading-relaxed">
                  搜公司地点 → 创建等时圈 → 检出可接受的地铁站和房源
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium">
                  查看地图 <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
              全部以真实北京小区·真实地铁·真实口碑为数据底座
            </div>
          </div>
        </div>
      </section>

      {/* ===== 三大功能卡片 ===== */}
      <section className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-red-deep mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            三个真实痛点，三个核心功能
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            不做又一个房源信息聚合
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            而是解决租房决策链条里，真正卡住年轻人的几个环节。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 功能一 */}
          <Card className="p-7 hover:shadow-card-hover transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red-pale text-brand-red-deep mb-5">
                <Brain className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold text-brand-red-deep mb-1">功能一</div>
              <h3 className="text-xl font-bold mb-2">偏好揭示引擎</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                用市场研究里的 <span className="font-medium text-foreground">Conjoint Analysis</span>，
                通过 8 道虚构房源选择题，反推你自己都说不清的隐性偏好。
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-red-deep group-hover:gap-2 transition-all"
              >
                开始人格测试 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* 功能二 */}
          <Card className="p-7 hover:shadow-card-hover transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 mb-5">
                <Compass className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold text-sky-700 mb-1">功能二</div>
              <h3 className="text-xl font-bold mb-2">通勤地图筛选</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                输入公司位置 + 期望通勤时间，<span className="font-medium text-foreground">反向找出符合条件的地铁站</span>，
                再叠加预算和偏好筛选房源。
              </p>
              <Link
                href="/map"
                className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 group-hover:gap-2 transition-all"
              >
                查看通勤地图 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          {/* 功能三 */}
          <Card className="p-7 hover:shadow-card-hover transition-all duration-300 group cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 mb-5">
                <MessagesSquare className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold text-emerald-700 mb-1">功能三</div>
              <h3 className="text-xl font-bold mb-2">小区体检报告</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                聚合小红书真实居住体验，输出小区
                <span className="font-medium text-foreground"> 优缺点 TOP3、分项评分、引用原文</span>
                ——只有小红书能做的事。
              </p>
              <Link
                href="/community"
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 group-hover:gap-2 transition-all"
              >
                浏览全部小区报告 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* ===== 信任带 ===== */}
      <section className="container pb-16">
        <Card className="bg-gradient-to-r from-brand-red-pale/50 via-rose-50 to-brand-red-pale/30 border-brand-red/10 p-8 md:p-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-brand-red-deep">
              <Sparkles className="h-3.5 w-3.5" />
              Demo 数据底座
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-red-deep">10</div>
              <div className="text-xs font-medium mt-1">真实北京小区</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">从三里屯 SOHO 到龙泽苑</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-red-deep">30</div>
              <div className="text-xs font-medium mt-1">示例房源</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">挂靠真实小区·贴合市场价</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-red-deep">高德</div>
              <div className="text-xs font-medium mt-1">真实地点搜索</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">等时圈·20+ 地铁站点位</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-red-deep">30+</div>
              <div className="text-xs font-medium mt-1">小红书风格证言</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">好评·吐槽·抱怨混合</div>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6 max-w-2xl mx-auto">
            小区基础信息·口碑的取自贝壳/安居客/房天下等公开评价。示例房源价格·标题为演示虚构。
          </p>
        </Card>
      </section>

      {/* ===== 底部 CTA ===== */}
      <section className="container pb-24">
        <div className="rounded-3xl bg-foreground text-background p-10 md:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-red/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <MapPin className="h-8 w-8 text-brand-red mb-4" />
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              你的下一个家，
              <br />
              不应该靠运气。
            </h3>
            <p className="mt-4 text-background/70 leading-relaxed max-w-md">
              花 2 分钟做一次"人格测试"，让数据帮你弄清楚自己真正想要什么。
            </p>
            <Button asChild size="lg" className="mt-8 bg-brand-red hover:bg-brand-red-deep">
              <Link href="/quiz">
                开始我的人格测试
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
