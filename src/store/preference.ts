import { create } from "zustand";
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
  /** 计算出的偏好结果 */
  result: PreferenceResult | null;

  // ===== actions =====
  setQuestions: (qs: QuizQuestion[]) => void;
  addAnswer: (answer: QuizAnswer) => void;
  setResult: (result: PreferenceResult) => void;
  reset: () => void;
}

export const usePreferenceStore = create<PreferenceState>((set) => ({
  questions: [],
  answers: [],
  result: null,

  setQuestions: (qs) => set({ questions: qs, answers: [], result: null }),
  addAnswer: (answer) =>
    set((s) => ({ answers: [...s.answers, answer] })),
  setResult: (result) => set({ result }),
  reset: () => set({ questions: [], answers: [], result: null }),
}));
