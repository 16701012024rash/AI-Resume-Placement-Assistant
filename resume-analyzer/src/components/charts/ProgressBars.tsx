"use client";

import { useEffect, useState } from "react";
import { cn, getScoreColor } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  showValue?: boolean;
  color?: string;
  className?: string;
}

export function ProgressBar({
  label,
  value,
  maxValue = 100,
  showValue = true,
  color,
  className,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const percentage = Math.round((value / maxValue) * 100);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const autoColor = getScoreColor(percentage);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        {showValue && (
          <span className={cn("text-sm font-mono font-medium", color || autoColor)}>
            {value}/{maxValue}
          </span>
        )}
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", autoColor.replace("text-", "bg-"))}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

interface MultiProgressProps {
  items: { label: string; value: number; color?: string }[];
}

export function MultiProgress({ items }: MultiProgressProps) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <ProgressBar key={i} {...item} />
      ))}
    </div>
  );
}
