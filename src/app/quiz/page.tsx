"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { AttributeCard } from "@/components/AttributeCard";
import { generateQuestions, buildPreferenceResult } from "@/lib/conjoint";
import { usePreferenceStore } from "@/store/preference";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, RefreshCw, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import conjointConfig from "../../../data/conjoint-config.json";
import type { ConjointConfig, QuizQuestion } from "@/types";

const TOTAL_QUESTIONS = 8;

export default function QuizPage() {
  const router = useRouter();
  const config = conjointConfig as ConjointConfig;

  const { setQuestions, addAnswer, setResult, reset, answers } =
    usePreferenceStore();

  const [questions, setLocalQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [, setRerenderTick] = useState(0);

  // 首次加载生成题目
  useEffect(() => {
    const qs = generateQuestions(config, TOTAL_QUESTIONS);
    setLocalQuestions(qs);
    reset();
    setQuestions(qs);
    setCurrentIdx(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentQuestion = questions[currentIdx];
  const progress = useMemo(
    () => ((currentIdx + 1) / TOTAL_QUESTIONS) * 100,
    [currentIdx]
  );

  function handleChoose(choice: "A" | "B") {
    if (!currentQuestion) return;
    addAnswer({
      questionId: currentQuestion.id,
      chosen: choice,
      optionA: currentQuestion.optionA,
      optionB: currentQuestion.optionB,
    });

    if (currentIdx + 1 >= TOTAL_QUESTIONS) {
      // 计算结果并跳转
      const allAnswers = [
        ...answers,
        {
          questionId: currentQuestion.id,
          chosen: choice,
          optionA: currentQuestion.optionA,
          optionB: currentQuestion.optionB,
        },
      ];
      const result = buildPreferenceResult(allAnswers, config);
      setResult(result);
      router.push("/result?from=quiz");
    } else {
      setCurrentIdx((i) => i + 1);
      setRerenderTick((t) => t + 1);
    }
  }

  function handleRestart() {
    const qs = generateQuestions(config, TOTAL_QUESTIONS);
    setLocalQuestions(qs);
    reset();
    setQuestions(qs);
    setCurrentIdx(0);
  }

  return (
    <div className="container py-10 md:py-14 max-w-4xl">
      {/* 顶部导航 + 标题 */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          返回首页
        </Link>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-red-deep mb-2">
              <Brain className="h-3.5 w-3.5" />
              场景 A · 偏好揭示引擎
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              在两套房之间选一套
            </h1>
            <p className="mt-2 text-muted-foreground">
              没有标准答案，凭直觉就好。我们会从你的选择里反推你的隐性偏好。
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRestart}>
            <RefreshCw className="h-3.5 w-3.5" />
            重新开始
          </Button>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            第 {currentIdx + 1} 题 / 共 {TOTAL_QUESTIONS} 题
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} />
      </div>

      {/* 题目卡片 */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <p className="text-center text-sm text-muted-foreground mb-6">
              下面两套房，你更愿意住哪一套？
            </p>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <AttributeCard
                label="A"
                option={currentQuestion.optionA}
                attributes={config.attributes}
                onClick={() => handleChoose("A")}
              />
              <AttributeCard
                label="B"
                option={currentQuestion.optionB}
                attributes={config.attributes}
                onClick={() => handleChoose("B")}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              小贴士：每道题没有"标准答案"，你的真实偏好就是最有价值的数据
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
