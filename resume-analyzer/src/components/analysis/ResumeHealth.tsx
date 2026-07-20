"use client";

import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthItem } from "@/lib/types/analysis";

interface ResumeHealthProps {
  health: HealthItem[];
}

const iconMap: Record<string, typeof CheckCircle2> = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
};

const colorMap: Record<string, string> = {
  pass: "text-success bg-success-muted",
  warn: "text-warning bg-warning-muted",
  fail: "text-danger bg-danger-muted",
};

export function ResumeHealth({ health }: ResumeHealthProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {health.map((item, i) => {
        const Icon = iconMap[item.status] || Info;
        return (
          <div
            key={i}
            className="glass glass-hover rounded-xl p-4 flex items-start gap-3 transition-all duration-200"
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorMap[item.status] || "bg-white/5 text-muted-foreground")}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
