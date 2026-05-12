"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MapPin,
  Train,
  Building2,
  Clock,
  ChevronLeft,
  Compass,
  ArrowRight,
} from "lucide-react";
import apartmentsData from "../../../data/apartments.json";
import type { Apartment } from "@/types";

const apartments = apartmentsData as Apartment[];

export default function MapPage() {
  const [commuteMode, setCommuteMode] = useState("subway");
  const [commuteTime, setCommuteTime] = useState([40]);

  const displayed = apartments.slice(0, 6);

  return (
    <div className="container py-10 md:py-14 max-w-7xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        返回首页
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 mb-2">
          <Compass className="h-3.5 w-3.5" />
          功能二 · 通勤地图筛选
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          告诉我你公司在哪
        </h1>
        <p className="mt-2 text-muted-foreground">
          反向找出能在期望通勤时间内到达的地铁站和周边房源。
        </p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* 左侧筛选面板 */}
        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-red" />
              公司位置
            </h2>
            <Input placeholder="输入公司地址或地铁站" defaultValue="国贸·CBD" />
            <p className="text-xs text-muted-foreground mt-2">
              已识别：国贸地铁站（1 号线 / 10 号线）
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-red" />
              期望通勤时间
            </h2>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-brand-red-deep tabular-nums">
                {commuteTime[0]}
              </span>
              <span className="text-sm text-muted-foreground">分钟以内</span>
            </div>
            <Slider
              value={commuteTime}
              onValueChange={setCommuteTime}
              min={10}
              max={90}
              step={5}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>10 min</span>
              <span>90 min</span>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Train className="h-4 w-4 text-brand-red" />
              通勤方式
            </h2>
            <RadioGroup
              value={commuteMode}
              onValueChange={setCommuteMode}
              className="space-y-2"
            >
              {[
                { id: "subway", label: "地铁" },
                { id: "bus", label: "公交 + 地铁" },
                { id: "bike", label: "自行车 / 电动车" },
                { id: "car", label: "开车" },
              ].map((m) => (
                <label
                  key={m.id}
                  htmlFor={m.id}
                  className="flex items-center gap-3 rounded-xl p-2 cursor-pointer hover:bg-secondary transition-colors"
                >
                  <RadioGroupItem value={m.id} id={m.id} />
                  <span className="text-sm">{m.label}</span>
                </label>
              ))}
            </RadioGroup>
          </Card>

          <Button className="w-full" size="lg">
            <ArrowRight className="h-4 w-4" />
            应用筛选
          </Button>
        </aside>

        {/* 右侧地图区 + 列表 */}
        <div className="space-y-6">
          <Card className="relative overflow-hidden h-[420px] bg-gradient-to-br from-slate-50 to-slate-100 border-dashed">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-soft mb-4">
                <MapPin className="h-8 w-8 text-brand-red" />
              </div>
              <h3 className="text-lg font-bold mb-2">地图加载区</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Phase 1 接入高德地图 JS API，叠加等时圈、地铁线网和房源 marker。
                此处目前为占位组件。
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex h-2 w-2 rounded-full bg-brand-red" />
                你的公司
                <span className="text-border ml-3">·</span>
                <span className="flex h-2 w-2 rounded-full bg-sky-500 ml-3" />
                {commuteTime[0]} 分钟可达
                <span className="text-border ml-3">·</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 ml-3" />
                推荐房源
              </div>
            </div>
            {/* 装饰背景网格 */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                推荐房源
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  · 共 {displayed.length} 套（演示）
                </span>
              </h2>
              <Button variant="ghost" size="sm">
                查看全部
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayed.map((apt) => (
                <Card
                  key={apt.id}
                  className="overflow-hidden hover:shadow-card-hover transition-all duration-200"
                >
                  <div className="h-32 bg-gradient-to-br from-brand-red-pale to-rose-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-brand-red-deep/50" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold leading-snug line-clamp-2">
                        {apt.title}
                      </h3>
                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-brand-red-deep tabular-nums">
                          ¥{apt.price.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground">/月</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {apt.roomType} · {apt.area}㎡ · {apt.floor} · {apt.decoration}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <Train className="h-3 w-3" />
                      <span>{apt.subwayStation}</span>
                      <span className="text-border">·</span>
                      <Clock className="h-3 w-3" />
                      <span>通勤 {apt.commuteToSampleCompany} 分钟</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {apt.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="soft" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
