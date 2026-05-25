/**
 * PersonaCard — 租房人格大卡片（结果页顶部 hero）
 *
 * 学术包装为亲切体验：4 字母代号 + 名字 + emoji + 4 轴可视化 + 金句。
 * 硬核 β/WTP 由 result/page.tsx 用 <details> 折叠在下方。
 */
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Users, ArrowRight } from "lucide-react";
import type { PersonaResult } from "@/lib/persona";
import { findAttr } from "@/lib/conjoint-v2/attributes";

interface Props {
  persona: PersonaResult;
}

export function PersonaCard({ persona }: Props) {
  const { code, axes, meta, opposite, top3 } = persona;
  const rarityPct = Math.round(meta.rarity * 100);

  // Top-1 维度的中文名 + 占比，用于副标题金句
  const top1 = top3[0];
  const top1Attr = top1 ? findAttr(top1.attrId) : null;
  const top1Pct = top1 ? Math.round(top1.importance * 100) : 0;

  return (
    <Card
      className="overflow-hidden border-2"
      style={{ borderColor: meta.color + "30" }}
    >
      {/* 顶部彩色横条 */}
      <div
        className="px-6 py-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white"
        style={{ backgroundColor: meta.color }}
      >
        你的租房人格 · Rent-MBTI
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* 左：emoji + 代号 + 名字 */}
          <div className="md:w-[280px] shrink-0">
            <div className="text-6xl md:text-7xl mb-2 leading-none">
              {meta.emoji}
            </div>
            <div
              className="text-3xl md:text-4xl font-black tracking-[0.1em] tabular-nums leading-none mb-2"
              style={{ color: meta.color }}
            >
              {code}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
              {meta.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {meta.tagline}
            </p>

            {/* 稀有度 */}
            <div className="mt-4 flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-semibold"
                style={{ borderColor: meta.color + "60", color: meta.color }}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                约 {rarityPct}% 的人是这种
              </Badge>
            </div>
          </div>

          {/* 右：详细描述 + 4 轴可视化 + 金句 */}
          <div className="flex-1 min-w-0">
            {/* 描述 */}
            <p className="text-sm md:text-[15px] leading-relaxed text-foreground mb-5">
              {meta.description}
            </p>

            {/* 4 轴可视化 */}
            <div className="space-y-2.5 mb-5">
              {axes.map((axis, idx) => (
                <AxisBar key={idx} axis={axis} color={meta.color} />
              ))}
            </div>

            {/* Top-1 金句 */}
            {top1Attr && (
              <div
                className="rounded-lg p-3 text-sm leading-relaxed mb-4"
                style={{
                  backgroundColor: meta.color + "0D",
                  borderLeft: `3px solid ${meta.color}`,
                }}
              >
                <span className="text-muted-foreground">
                  你的核心偏好是
                </span>
                <span className="font-bold mx-1.5" style={{ color: meta.color }}>
                  {top1Attr.icon} {top1Attr.name}
                </span>
                <span className="text-muted-foreground">
                  ——它占了你决策权重的{" "}
                </span>
                <span className="font-bold tabular-nums" style={{ color: meta.color }}>
                  {top1Pct}%
                </span>
                <span className="text-muted-foreground">
                  。其余维度你都愿意做让步。
                </span>
              </div>
            )}

            {/* 你会被这种房子打动 */}
            {meta.loves.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5 inline-flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  你会被这种房子打动
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {meta.loves.map((love) => (
                    <span
                      key={love}
                      className="inline-flex text-[11px] px-2 py-0.5 rounded-full bg-secondary/60 text-foreground"
                    >
                      {love}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 与你相似的人群 + 对照人格 */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-border p-2.5">
                <p className="font-semibold text-muted-foreground inline-flex items-center gap-1 mb-1">
                  <Users className="h-3 w-3" />
                  与你高度相似的人
                </p>
                <p className="text-foreground leading-relaxed">{meta.cohort}</p>
              </div>
              <div className="rounded-lg border border-border p-2.5">
                <p className="font-semibold text-muted-foreground inline-flex items-center gap-1 mb-1">
                  <ArrowRight className="h-3 w-3" />
                  你的反面：{opposite.code}
                </p>
                <p className="text-foreground leading-relaxed">
                  {opposite.emoji} {opposite.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// AxisBar：单个轴的可视化（左极字母 — 滑块 — 右极字母）
// ============================================================
import type { AxisScore } from "@/lib/persona";

function AxisBar({ axis, color }: { axis: AxisScore; color: string }) {
  // bias: -1..+1 → 滑块位置 0..100
  const pos = ((axis.bias + 1) / 2) * 100;
  const isRight = axis.bias >= 0;

  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-1">
        <span
          className={
            !isRight
              ? "font-bold tabular-nums"
              : "text-muted-foreground tabular-nums"
          }
          style={!isRight ? { color } : {}}
        >
          {axis.leftLetter} · {axis.leftName}
        </span>
        <span
          className={
            isRight
              ? "font-bold tabular-nums"
              : "text-muted-foreground tabular-nums"
          }
          style={isRight ? { color } : {}}
        >
          {axis.rightName} · {axis.rightLetter}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-secondary/60 overflow-hidden">
        {/* 中点参考线 */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border" />
        {/* 滑块 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ring-2 ring-white shadow-sm transition-all"
          style={{
            left: `calc(${pos}% - 6px)`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5 text-right tabular-nums">
        偏向 {axis.letter} · 强度 {axis.strength}/100
      </p>
    </div>
  );
}
