"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarSkillChartProps {
  labels: string[];
  values: number[];
}

export function RadarSkillChart({ labels, values }: RadarSkillChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const data = labels.map((label, i) => ({
    subject: label,
    value: values[i] || 0,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
        />
        <Radar
          name="Skills"
          dataKey="value"
          stroke="var(--color-accent)"
          fill="var(--color-accent)"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          itemStyle={{ color: "var(--color-foreground)" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
