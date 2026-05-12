"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, ShieldCheck, AlertCircle, RotateCcw } from "lucide-react";
import data from "../../../data/anti-broker-quiz.json";

type Item = { id: string; claim: string; tag: string; truth: string };
type Answer = "fooled" | "skeptical" | null;

const ITEMS = data as Item[];

export function AntiBrokerWidget() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const total = ITEMS.length;
  const answered = Object.values(answers).filter(Boolean).length;
  const skeptical = Object.values(answers).filter((v) => v === "skeptical").length;
  const score = answered === 0 ? null : Math.round((skeptical / total) * 100);

  function handleAnswer(id: string, ans: Answer) {
    setAnswers((p) => ({ ...p, [id]: ans }));
    setRevealed((p) => ({ ...p, [id]: true }));
  }
  function reset() {
    setAnswers({});
    setRevealed({});
  }

  const verdict =
    score === null
      ? null
      : score >= 80
      ? { icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50", label: "话术老司机", note: "中介看到你都不敢轻易开口" }
      : score >= 50
      ? { icon: Shield, color: "text-sky-700 bg-sky-50", label: "有基本免疫力", note: "再补几堂课，就能完美避坑" }
      : { icon: ShieldAlert, color: "text-rose-700 bg-rose-50", label: "高风险用户", note: "现在的中介市场对你不太友好，重点关注红色话术" };

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-red-deep mb-1">
            <Shield className="h-3.5 w-3.5" />
            加分题 · 中介话术免疫测试
          </div>
          <h3 className="text-lg font-bold">下面这些话，你听了会动心吗？</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            真实租房中最容易踩坑的不是房源本身，而是被销售话术带跑节奏。5 道小题测一下你的免疫力。
          </p>
        </div>
        {score !== null && verdict && (
          <div className={`shrink-0 rounded-xl px-3 py-2 ${verdict.color}`}>
            <div className="flex items-center gap-1.5">
              <verdict.icon className="h-4 w-4" />
              <span className="text-xs font-semibold">{verdict.label}</span>
            </div>
            <div className="text-2xl font-bold tabular-nums mt-0.5">{score}<span className="text-sm font-normal">分</span></div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {ITEMS.map((item, idx) => {
          const ans = answers[item.id];
          const isRevealed = revealed[item.id];
          return (
            <div
              key={item.id}
              className={`rounded-xl border p-3 transition-colors ${
                isRevealed
                  ? ans === "skeptical"
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-rose-300 bg-rose-50/40"
                  : "border-border"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-xs font-bold text-foreground/70">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{item.claim}</p>

                  {!isRevealed ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs"
                        onClick={() => handleAnswer(item.id, "fooled")}
                      >
                        会心动
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs"
                        onClick={() => handleAnswer(item.id, "skeptical")}
                      >
                        感觉是话术
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed">
                      <AlertCircle
                        className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                          ans === "skeptical" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      />
                      <span className="text-foreground/85">
                        <span className="font-semibold">
                          {ans === "skeptical" ? "✓ 答对了：" : "× 这是话术："}
                        </span>
                        {item.truth}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {answered > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>已答 {answered} / {total} · 答对 {skeptical}</span>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            重置
          </button>
        </div>
      )}
    </Card>
  );
}
