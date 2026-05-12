"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ConjointAttribute, QuizOption } from "@/types";
import { motion } from "framer-motion";

interface AttributeCardProps {
  label: string; // 例如 "A" / "B"
  option: QuizOption;
  attributes: ConjointAttribute[];
  onClick?: () => void;
  highlight?: boolean;
}

export function AttributeCard({
  label,
  option,
  attributes,
  onClick,
  highlight,
}: AttributeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card
        onClick={onClick}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/40 overflow-hidden h-full flex flex-col",
          highlight && "border-primary shadow-card-hover"
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 bg-gradient-to-r from-brand-red-pale/40 to-transparent">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {label}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              方案 {label}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">点击选择</span>
        </div>
        <CardContent className="flex-1 p-5">
          <div className="space-y-3">
            {attributes.map((attr) => {
              const level = option.levels[attr.id];
              if (!level) return null;
              return (
                <div
                  key={attr.id}
                  className="flex items-start justify-between gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                    <span className="text-base leading-none shrink-0">{attr.icon}</span>
                    <span className="truncate">{attr.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-right text-foreground shrink-0">
                    {level.value}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
