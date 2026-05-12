"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X, ChevronLeft, HeartHandshake, Building2 } from "lucide-react";

interface Candidate {
  id: string;
  title: string;
  price: string;
}

export default function ComparePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: "c1", title: "", price: "" },
    { id: "c2", title: "", price: "" },
  ]);

  function addCandidate() {
    if (candidates.length >= 5) return;
    setCandidates((c) => [
      ...c,
      { id: `c${c.length + 1}`, title: "", price: "" },
    ]);
  }

  function removeCandidate(id: string) {
    setCandidates((c) =>
      c.length <= 2 ? c : c.filter((x) => x.id !== id)
    );
  }

  function update(id: string, field: keyof Candidate, value: string) {
    setCandidates((c) =>
      c.map((x) => (x.id === id ? { ...x, [field]: value } : x))
    );
  }

  return (
    <div className="container py-10 md:py-14 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        返回首页
      </Link>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-red-deep mb-2">
          <HeartHandshake className="h-3.5 w-3.5" />
          场景 B · 决策助手
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          手里有几个候选，帮你选出最适合的
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          输入你正在纠结的候选房源（最多 5 个），通过 10 轮两两比较，我们会用
          Bradley-Terry 模型告诉你哪个最契合你的偏好，并解释每一场胜负的原因。
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {candidates.map((c, idx) => (
          <Card key={c.id} className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red-pale text-brand-red-deep font-bold shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1 grid sm:grid-cols-[1fr_140px] gap-3">
              <Input
                placeholder={`候选 ${idx + 1}：房源名 / 小区（如：望京阿里西溪一居）`}
                value={c.title}
                onChange={(e) => update(c.id, "title", e.target.value)}
              />
              <Input
                placeholder="月租 ¥"
                type="number"
                value={c.price}
                onChange={(e) => update(c.id, "price", e.target.value)}
              />
            </div>
            <button
              onClick={() => removeCandidate(c.id)}
              disabled={candidates.length <= 2}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              aria-label="删除"
            >
              <X className="h-4 w-4" />
            </button>
          </Card>
        ))}

        {candidates.length < 5 && (
          <Button
            variant="outline"
            onClick={addCandidate}
            className="w-full h-14 border-dashed"
          >
            <Plus className="h-4 w-4" />
            添加候选（{candidates.length} / 5）
          </Button>
        )}
      </div>

      <Card className="p-6 bg-brand-red-pale/30 border-brand-red/10 mb-8">
        <div className="flex gap-3">
          <Building2 className="h-5 w-5 text-brand-red-deep shrink-0 mt-0.5" />
          <div className="text-sm text-foreground/80">
            <p className="font-medium mb-1">接下来会发生什么？</p>
            <p className="text-muted-foreground leading-relaxed">
              输入候选后，系统会基于 6 个维度（价格 / 房型 / 通勤 / 装修 / 小区品质 / 楼栋）生成 10 轮两两对决，
              你每次只需要选一个。结束后会给你一份完整的"决策报告"：候选排名 + 胜负解释 + 各维度对比矩阵。
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button asChild size="lg">
          <Link href="/result?from=compare">
            开始两两比较
          </Link>
        </Button>
      </div>
    </div>
  );
}
