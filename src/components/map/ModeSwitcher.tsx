"use client";

/**
 * 通勤方式切换器：地铁 / 驾车 / 公交（开发中置灰）
 *
 * 设计要点：
 * - 三段式 tab，选中态用对应人的主题色（A=emerald、B=amber）
 * - 公交置灰 + "开发中"小标签，点击无响应
 * - 配合 ModeSwitcher 在 A/B 卡片里都能用
 */

import { Train, Car, Bus } from "lucide-react";
import type { CommuteMode } from "@/lib/commute";

interface Props {
  value: CommuteMode;
  onChange: (mode: CommuteMode) => void;
  /** 主题色：A=emerald、B=amber */
  theme?: "emerald" | "amber";
}

const THEMES = {
  emerald: {
    activeBg: "bg-emerald-100",
    activeText: "text-emerald-800",
    activeBorder: "border-emerald-400",
    hover: "hover:bg-emerald-50",
  },
  amber: {
    activeBg: "bg-amber-100",
    activeText: "text-amber-800",
    activeBorder: "border-amber-400",
    hover: "hover:bg-amber-50",
  },
} as const;

export default function ModeSwitcher({ value, onChange, theme = "emerald" }: Props) {
  const t = THEMES[theme];

  const baseClass =
    "flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 text-[11px] font-medium rounded-md border transition-all";

  const cls = (mode: CommuteMode, disabled = false) => {
    if (disabled) {
      return `${baseClass} border-border/40 bg-secondary/30 text-muted-foreground/60 cursor-not-allowed relative`;
    }
    return value === mode
      ? `${baseClass} ${t.activeBg} ${t.activeText} ${t.activeBorder} shadow-sm`
      : `${baseClass} border-border/50 bg-white text-muted-foreground ${t.hover} cursor-pointer`;
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/60">
      <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">
        通勤方式
      </div>
      <div className="flex gap-1.5">
        <button type="button" className={cls("subway")} onClick={() => onChange("subway")}>
          <Train className="h-3.5 w-3.5" />
          <span>地铁</span>
        </button>
        <button type="button" className={cls("drive")} onClick={() => onChange("drive")}>
          <Car className="h-3.5 w-3.5" />
          <span>驾车</span>
        </button>
        <button type="button" className={cls("bus", true)} disabled aria-disabled>
          <Bus className="h-3.5 w-3.5" />
          <span>公交</span>
          <span className="absolute -top-1.5 -right-1 text-[8px] bg-muted text-muted-foreground px-1 rounded-sm leading-none py-0.5">
            开发中
          </span>
        </button>
      </div>
    </div>
  );
}
