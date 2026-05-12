"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Scale,
  Sparkles,
  Wand2,
  ArrowRight,
  Trophy,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Brain,
} from "lucide-react";
import {
  detectDiffs,
  pickQuestions,
  computeDecision,
  formatApartmentSummary,
  SAMPLE_A,
  SAMPLE_B,
  type CandidateApartment,
  type RenderedQuestion,
  type DecisionAnswer,
  type DecisionResult,
} from "@/lib/decide";
import { usePreferenceStore } from "@/store/preference";

type Stage = "input" | "questions" | "result";

const EMPTY_APT = (label: "A" | "B"): CandidateApartment => ({
  label,
  title: "",
  price: 0,
  roomType: "1bed",
  area: 0,
  commuteMin: 0,
  decoration: 2,
  communityQuality: 2,
  buildingType: 2,
});

const ROOM_OPTIONS: { value: CandidateApartment["roomType"]; label: string }[] = [
  { value: "shared", label: "合租间" },
  { value: "studio", label: "整租开间" },
  { value: "1bed", label: "一居室" },
  { value: "2bed", label: "两居室" },
];
const DECO_OPTIONS = [
  { value: 1, label: "老破普装" },
  { value: 2, label: "普通装修" },
  { value: 3, label: "精装" },
  { value: 4, label: "网红装修" },
];
const COMM_OPTIONS = [
  { value: 1, label: "老破小无物业" },
  { value: 2, label: "普通小区" },
  { value: 3, label: "优质物业" },
];
const BLD_OPTIONS = [
  { value: 1, label: "老破小" },
  { value: 2, label: "普通板楼" },
  { value: 3, label: "新塔楼" },
];

export default function DecidePage() {
  const [stage, setStage] = useState<Stage>("input");
  const [aptA, setAptA] = useState<CandidateApartment>(EMPTY_APT("A"));
  const [aptB, setAptB] = useState<CandidateApartment>(EMPTY_APT("B"));
  const [questions, setQuestions] = useState<RenderedQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<DecisionAnswer[]>([]);
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [usePref, setUsePref] = useState(false);

  const prefResult = usePreferenceStore((s) => s.result);

  // 客户端 mount 后默认勾上"复用偏好画像"
  useEffect(() => {
    if (prefResult) setUsePref(true);
  }, [prefResult]);

  function fillSample() {
    setAptA({ ...SAMPLE_A });
    setAptB({ ...SAMPLE_B });
  }

  function isValid(apt: CandidateApartment) {
    return apt.title.trim() !== "" && apt.price > 0 && apt.area > 0 && apt.commuteMin > 0;
  }

  function startQuestions() {
    if (!isValid(aptA) || !isValid(aptB)) {
      alert("请把两套房源的标题、价格、面积、通勤都填完整");
      return;
    }
    const diffs = detectDiffs(aptA, aptB);
    const qs = pickQuestions(aptA, aptB, diffs, 6);
    setQuestions(qs);
    setCurrentIdx(0);
    setAnswers([]);
    setStage("questions");
  }

  function answerCurrent(side: "A" | "B") {
    const q = questions[currentIdx];
    const newAnswer: DecisionAnswer = {
      questionId: q.id,
      dimension: q.dimension,
      endorsedSide: side,
      importance: q.rawDiff.importance,
    };
    const updated = [...answers, newAnswer];
    setAnswers(updated);

    if (currentIdx + 1 >= questions.length) {
      // 完成 → 算结果
      const diffs = detectDiffs(aptA, aptB);
      const decision = computeDecision(aptA, aptB, diffs, updated, usePref ? prefResult : null);
      setResult(decision);
      setStage("result");
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  function restart() {
    setStage("input");
    setQuestions([]);
    setAnswers([]);
    setCurrentIdx(0);
    setResult(null);
  }

  return (
    <div className="container py-10 md:py-14 max-w-5xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        返回首页
      </Link>

      <div className="mb-8">
        <div className="text-xs text-brand-red-deep font-semibold uppercase tracking-widest mb-2">
          场景 B · 决策助手
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
          在两套房之间，帮你做<span className="text-brand-red">最难的决定</span>
        </h1>
        <p className="text-muted-foreground">
          上传你在纠结的两套房源，AI 检测真实差异维度，针对性出题——不再问通用问题，只问能拉开你心里那杆秤的那几刀。
        </p>
      </div>

      {/* ===== Stage: input ===== */}
      {stage === "input" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">第 1 步 · 录入两套候选房源</div>
            <Button variant="outline" size="sm" onClick={fillSample}>
              <Wand2 className="h-3.5 w-3.5 mr-1.5" />
              一键填入示例
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ApartmentForm label="A" apt={aptA} onChange={setAptA} />
            <ApartmentForm label="B" apt={aptB} onChange={setAptB} />
          </div>

          {/* 偏好画像复用开关 */}
          {prefResult && (
            <Card className="mt-5 p-4 bg-gradient-to-r from-brand-red-pale/30 to-rose-50 border-brand-red/10">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePref}
                  onChange={(e) => setUsePref(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-brand-red"
                />
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-brand-red" />
                    使用我的偏好画像辅助决策
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    检测到你做过人格测试（「{prefResult.personalityTag}」），勾选后会把你已有的偏好作为先验权重融合到最终结果。
                  </div>
                </div>
              </label>
            </Card>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button size="lg" onClick={startQuestions}>
              开始决策出题
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>

          <Card className="mt-8 p-5 bg-secondary/30 border-dashed">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <div className="font-semibold text-foreground mb-1">出题逻辑（架构亮点）</div>
                离线 LLM 预生成的 66 条题面池 + 运行时规则匹配。系统会检测两套房源在 7 个核心维度上的差异，按差距强度排序，从题面池里挑出最贴切的 6 道题。完全离线运行，零延迟、零成本。
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ===== Stage: questions ===== */}
      {stage === "questions" && questions[currentIdx] && (
        <div>
          <div className="flex items-center justify-between mb-3 text-sm">
            <div className="text-muted-foreground">
              第 {currentIdx + 1} 题 / 共 {questions.length} 题
            </div>
            <div className="text-brand-red-deep font-semibold">
              {Math.round(((currentIdx + 1) / questions.length) * 100)}%
            </div>
          </div>
          <Progress value={((currentIdx + 1) / questions.length) * 100} className="mb-8 h-1.5" />

          <AnimatePresence mode="wait">
            <motion.div
              key={questions[currentIdx].id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <Card className="p-7 mb-5">
                <div className="text-xs text-brand-red font-semibold uppercase tracking-widest mb-2">
                  {dimensionLabel(questions[currentIdx].dimension)}
                </div>
                <h2 className="text-2xl font-bold mb-3 leading-snug">{questions[currentIdx].title}</h2>
                <p className="text-muted-foreground leading-relaxed">{questions[currentIdx].body}</p>
              </Card>

              <div className="grid sm:grid-cols-2 gap-3">
                {questions[currentIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => answerCurrent(opt.endorsedSide)}
                    className="group text-left p-5 rounded-2xl border-2 border-border bg-white hover:border-brand-red hover:bg-brand-red-pale/20 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{opt.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-red transition-colors" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">倾向 → 方案 {opt.endorsedSide}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ===== Stage: result ===== */}
      {stage === "result" && result && (
        <ResultPanel
          a={aptA}
          b={aptB}
          result={result}
          answerCount={answers.length}
          usedPref={usePref && !!prefResult}
          onRestart={restart}
        />
      )}
    </div>
  );
}

// ========== 表单组件 ==========
function ApartmentForm({
  label,
  apt,
  onChange,
}: {
  label: "A" | "B";
  apt: CandidateApartment;
  onChange: (a: CandidateApartment) => void;
}) {
  function set<K extends keyof CandidateApartment>(key: K, value: CandidateApartment[K]) {
    onChange({ ...apt, [key]: value });
  }
  return (
    <Card className={`p-5 border-2 ${label === "A" ? "border-brand-red/20" : "border-sky-200"}`}>
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${
            label === "A" ? "bg-brand-red" : "bg-sky-600"
          }`}
        >
          {label}
        </div>
        <div className="font-semibold">方案 {label}</div>
      </div>

      <div className="space-y-3">
        <Field label="标题">
          <Input
            value={apt.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="例：三里屯 SOHO 一居室"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="月租 (元)">
            <Input
              type="number"
              value={apt.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              placeholder="例 5500"
            />
          </Field>
          <Field label="面积 (㎡)">
            <Input
              type="number"
              value={apt.area || ""}
              onChange={(e) => set("area", Number(e.target.value))}
              placeholder="例 45"
            />
          </Field>
        </div>
        <Field label="单程通勤 (分钟)">
          <Input
            type="number"
            value={apt.commuteMin || ""}
            onChange={(e) => set("commuteMin", Number(e.target.value))}
            placeholder="例 30"
          />
        </Field>

        <Field label="房型">
          <ChipGroup
            value={apt.roomType}
            options={ROOM_OPTIONS}
            onChange={(v) => set("roomType", v as CandidateApartment["roomType"])}
          />
        </Field>
        <Field label="装修">
          <ChipGroup
            value={apt.decoration}
            options={DECO_OPTIONS}
            onChange={(v) => set("decoration", v as CandidateApartment["decoration"])}
          />
        </Field>
        <Field label="小区品质">
          <ChipGroup
            value={apt.communityQuality}
            options={COMM_OPTIONS}
            onChange={(v) => set("communityQuality", v as CandidateApartment["communityQuality"])}
          />
        </Field>
        <Field label="楼栋">
          <ChipGroup
            value={apt.buildingType}
            options={BLD_OPTIONS}
            onChange={(v) => set("buildingType", v as CandidateApartment["buildingType"])}
          />
        </Field>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function ChipGroup<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              active
                ? "border-brand-red bg-brand-red text-white"
                : "border-border bg-white text-muted-foreground hover:border-brand-red/50 hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function dimensionLabel(dim: string): string {
  const m: Record<string, string> = {
    price: "月租预算",
    commuteMin: "通勤时间",
    area: "面积大小",
    decoration: "装修档次",
    communityQuality: "小区品质",
    buildingType: "楼栋年代",
    roomType: "房型独立性",
    tie: "整体直觉",
  };
  return m[dim] || dim;
}

// ========== 结果面板 ==========
function ResultPanel({
  a,
  b,
  result,
  answerCount,
  usedPref,
  onRestart,
}: {
  a: CandidateApartment;
  b: CandidateApartment;
  result: DecisionResult;
  answerCount: number;
  usedPref: boolean;
  onRestart: () => void;
}) {
  const winnerApt = result.winner === "A" ? a : result.winner === "B" ? b : null;
  const loserApt = result.winner === "A" ? b : result.winner === "B" ? a : null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* 推荐头图 */}
      <Card className="p-6 mb-5 bg-gradient-to-br from-brand-red-pale/40 via-rose-50 to-white border-brand-red/10">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-brand-red" />
          <div className="text-xs uppercase tracking-widest font-semibold text-brand-red-deep">
            决策结果
          </div>
        </div>
        {winnerApt ? (
          <>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              推荐你选 <span className="text-brand-red">方案 {result.winner}</span>
            </h2>
            <p className="text-base font-medium text-foreground/80">{winnerApt.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{formatApartmentSummary(winnerApt)}</p>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Badge variant="soft">
                A 得分 {result.scoreA} · B 得分 {result.scoreB}
              </Badge>
              <Badge variant="soft">基于你的 {answerCount} 道作答</Badge>
              {usedPref && (
                <Badge className="bg-brand-red/10 text-brand-red-deep border-brand-red/20">
                  ✦ 融合了你的偏好画像
                </Badge>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              两套<span className="text-brand-red">几乎打成平手</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              A 得分 {result.scoreA} · B 得分 {result.scoreB}
              ——这意味着无论你选哪个都不会大错，可以跟着第一直觉走。
            </p>
          </>
        )}
      </Card>

      {/* 理由 */}
      {result.topReasons.length > 0 && (
        <Card className="p-6 mb-4">
          <h3 className="text-base font-bold mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            为什么推荐{result.winner === "tie" ? "" : `方案 ${result.winner}`}
          </h3>
          <ul className="space-y-4">
            {result.topReasons.map((r, idx) => (
              <li key={r.dimension} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-red text-white text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">
                      <span className="text-brand-red-deep">{r.label}</span>
                      {r.fact && (
                        <span className="text-foreground/90 font-normal">：{r.fact}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">权重 {r.weight.toFixed(2)}</span>
                  </div>
                  {r.voice && (
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      ～ {r.voice}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 反方优势（提醒权衡） */}
      {result.counterPoints.length > 0 && (
        <Card className="p-6 mb-4 bg-amber-50/40 border-amber-200/60">
          <h3 className="text-base font-bold mb-3 flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            但也别忘了：方案 {result.winner === "A" ? "B" : "A"} 在这些地方更强
          </h3>
          <ul className="space-y-2 text-sm text-amber-900/90">
            {result.counterPoints.map((c) => (
              <li key={c.dimension} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                <div>
                  <span className="font-semibold">「{c.label}」</span>
                  {c.fact && <span>：{c.fact}</span>}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-900/70 mt-3">
            如果这些维度对你其实更重要，建议重新出题、多答几道反向问题再确认一次。
          </p>
        </Card>
      )}

      {/* 对比小卡 */}
      <div className="grid md:grid-cols-2 gap-3 mb-5">
        <SummaryCard apt={a} highlight={result.winner === "A"} />
        <SummaryCard apt={b} highlight={result.winner === "B"} />
      </div>

      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={onRestart}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          换两套重新决策
        </Button>
        <Button asChild>
          <Link href="/community">
            看看推荐方案附近的小区口碑
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

function SummaryCard({ apt, highlight }: { apt: CandidateApartment; highlight: boolean }) {
  return (
    <Card className={`p-4 ${highlight ? "ring-2 ring-brand-red border-brand-red/20" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`h-7 w-7 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            apt.label === "A" ? "bg-brand-red" : "bg-sky-600"
          }`}
        >
          {apt.label}
        </div>
        <div className="font-semibold text-sm">{apt.title}</div>
      </div>
      <div className="text-xs text-muted-foreground leading-relaxed">{formatApartmentSummary(apt)}</div>
    </Card>
  );
}
