"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import type { Community } from "@/types";
import { usePreferenceStore } from "@/store/preference";
import { calcMatch, matchLevelMeta } from "@/lib/matching";

export function MatchBanner({ community }: { community: Community }) {
  const pref = usePreferenceStore((s) => s.result);

  // ===== Case 1: 用户还没做 quiz → 引导做测试 =====
  if (!pref) {
    return (
      <Card className="p-5 mb-6 bg-gradient-to-r from-brand-red-pale/40 to-rose-50 border-brand-red/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-0.5">
                想知道这个小区适不适合你？
              </h3>
              <p className="text-sm text-muted-foreground">
                做一次 2 分钟的偏好测试，我会告诉你"匹配度"和"为什么"
              </p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link href="/quiz">
              开始测试 <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  // ===== Case 2: 已有偏好 → 显示匹配度 =====
  const match = calcMatch(community, pref);
  const meta = matchLevelMeta(match.level);

  // 进度条颜色
  const ringColor =
    match.level === "perfect"
      ? "text-emerald-600"
      : match.level === "good"
      ? "text-emerald-500"
      : match.level === "fair"
      ? "text-amber-500"
      : "text-rose-500";

  // SVG 圆环参数
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - match.score / 100);

  return (
    <Card className="p-5 md:p-6 mb-6 border-brand-red/15 bg-gradient-to-br from-white via-brand-red-pale/15 to-rose-50/30">
      <div className="grid md:grid-cols-[auto_1fr] gap-5 md:gap-6 items-center">
        {/* 左：环形匹配度 */}
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0">
            <svg
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 80 80"
            >
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-secondary"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={`${ringColor} transition-[stroke-dashoffset] duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-brand-red-deep tabular-nums">
                {match.score}
              </span>
              <span className="text-[10px] text-muted-foreground -mt-1">
                / 100
              </span>
            </div>
          </div>
          <div className="md:hidden">
            <div className="text-xs text-muted-foreground">和你的匹配度</div>
            <div className="font-bold">{meta.label}</div>
          </div>
        </div>

        {/* 右：解释文案 */}
        <div className="space-y-3">
          <div className="hidden md:flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">
              和你的偏好
            </span>
            <span className={`font-bold ${meta.color}`}>{meta.label}</span>
            <span className="text-xs text-muted-foreground">
              · 基于你"{pref.personalityTag}"画像
            </span>
          </div>

          {/* 推荐理由 */}
          {match.reasons.length > 0 && (
            <div className="space-y-1.5">
              {match.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      ({r.score.toFixed(1)}/5){" · "}
                      {r.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 风险 */}
          {match.risks.length > 0 && (
            <div className="space-y-1.5">
              {match.risks.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold">需留意 {r.label}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      ({r.score.toFixed(1)}/5){" · "}
                      {r.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 兜底（既无理由也无风险） */}
          {match.reasons.length === 0 && match.risks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              整体表现均衡，没有明显短板，但也没有特别亮眼的契合点
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
