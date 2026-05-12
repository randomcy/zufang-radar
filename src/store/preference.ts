import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  QuizAnswer,
  QuizQuestion,
  PreferenceResult,
} from "@/types";

interface PreferenceState {
  /** 当前生成的题目集合 */
  questions: QuizQuestion[];
  /** 用户已回答的题目 */
  answers: QuizAnswer[];
  /** 用户的硬筛选偏好（独卫/养宠/阳台/电梯/近地铁等）*/
  binaryPreferences: Record<string, boolean>;
  /** 计算出的偏好结果 */
  result: PreferenceResult | null;

  // ===== actions =====
  setQuestions: (qs: QuizQuestion[]) => void;
  addAnswer: (answer: QuizAnswer) => void;
  setBinaryPreferences: (prefs: Record<string, boolean>) => void;
  setResult: (result: PreferenceResult) => void;
  reset: () => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      questions: [],
      answers: [],
      binaryPreferences: {},
      result: null,

      setQuestions: (qs) =>
        set({ questions: qs, answers: [], result: null }),
      addAnswer: (answer) =>
        set((s) => ({ answers: [...s.answers, answer] })),
      setBinaryPreferences: (prefs) =>
        set({ binaryPreferences: prefs }),
      setResult: (result) => set({ result }),
      reset: () =>
        set({
          questions: [],
          answers: [],
          binaryPreferences: {},
          result: null,
        }),
    }),
    {
      name: "zufang-radar-preference",
      partialize: (state) => ({
        // 跨页面持久化关键状态
        result: state.result,
        binaryPreferences: state.binaryPreferences,
      }),
    }
  )
);
