"use client";

import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { CommunitySubScores } from "@/types";

interface CommunityRadarProps {
  subscores: CommunitySubScores;
}

export function CommunityRadar({ subscores }: CommunityRadarProps) {
  const data = [
    { axis: "周边静谧", value: subscores.noise },
    { axis: "隔音", value: subscores.soundproof },
    { axis: "物业", value: subscores.property },
    { axis: "治安", value: subscores.safety },
    { axis: "配套", value: subscores.amenity },
    { axis: "性价比", value: subscores.valueForMoney },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 5]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
        />
        <Radar
          name="小区评分"
          dataKey="value"
          stroke="#FF2442"
          fill="#FF2442"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
