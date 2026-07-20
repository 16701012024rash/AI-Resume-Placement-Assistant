"use client";

import { Zap, Clock } from "lucide-react";
import type { QuickFix } from "@/lib/types/analysis";

interface QuickFixPanelProps {
  fixes: QuickFix[];
}

export function QuickFixPanel({ fixes }: QuickFixPanelProps) {
  return (
    <div className="space-y-2">
      {fixes.map((fix, i) => (
        <div key={i} className="glass glass-hover rounded-xl p-4 flex items-start gap-3 transition-all duration-200">
          <div className="w-7 h-7 rounded-lg bg-warning-muted flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{fix.issue}</p>
            <p className="text-xs text-accent mt-0.5">{fix.fix}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Clock className="w-3 h-3" />
            <span>{fix.timeEstimate}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
