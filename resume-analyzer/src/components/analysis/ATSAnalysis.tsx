"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ATSItem } from "@/lib/types/analysis";

interface ATSAnalysisProps {
  items: ATSItem[];
}

const iconMap: Record<string, typeof CheckCircle2> = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
};

const bgMap: Record<string, string> = {
  pass: "bg-success-muted text-success",
  warn: "bg-warning-muted text-warning",
  fail: "bg-danger-muted text-danger",
};

const labelMap: Record<string, string> = {
  pass: "Pass",
  warn: "Warning",
  fail: "Fail",
};

export function ATSAnalysis({ items }: ATSAnalysisProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const passCount = items.filter((i) => i.status === "pass").length;
  const warnCount = items.filter((i) => i.status === "warn").length;
  const failCount = items.filter((i) => i.status === "fail").length;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-success">
          <CheckCircle2 className="w-3.5 h-3.5" /> {passCount} Passed
        </span>
        <span className="flex items-center gap-1.5 text-warning">
          <AlertTriangle className="w-3.5 h-3.5" /> {warnCount} Warnings
        </span>
        <span className="flex items-center gap-1.5 text-danger">
          <XCircle className="w-3.5 h-3.5" /> {failCount} Failed
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const Icon = iconMap[item.status] || Info;
          const isExpanded = expandedIdx === i;

          return (
            <div key={i} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", bgMap[item.status] || "bg-white/5 text-muted-foreground")}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.check}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", bgMap[item.status] || "bg-white/5 text-muted-foreground")}>
                      {labelMap[item.status] || "Unknown"}
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Impact</p>
                    <p className="text-sm">{item.impact}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Explanation</p>
                    <p className="text-sm text-muted-foreground">{item.explanation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">How to Fix</p>
                    <p className="text-sm text-accent">{item.fix}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
