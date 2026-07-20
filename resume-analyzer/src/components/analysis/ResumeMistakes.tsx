"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeMistake } from "@/lib/types/analysis";

interface ResumeMistakesProps {
  mistakes: ResumeMistake[];
}

const severityConfig: Record<string, { icon: typeof AlertTriangle; color: string; label: string }> = {
  critical: { icon: AlertTriangle, color: "text-danger bg-danger-muted", label: "Critical" },
  major: { icon: AlertCircle, color: "text-warning bg-warning-muted", label: "Major" },
  minor: { icon: Info, color: "text-info bg-info-muted", label: "Minor" },
};

const defaultSeverity = { icon: Info, color: "text-muted-foreground bg-white/5", label: "Issue" };

export function ResumeMistakes({ mistakes }: ResumeMistakesProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? mistakes : mistakes.filter((m) => m.severity === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["all", "critical", "major", "minor"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize border hover:scale-[1.02] active:scale-[0.98]",
              filter === f 
                ? "bg-accent text-white border-accent hover:bg-accent-hover" 
                : "bg-transparent text-foreground border-border hover:bg-white/5"
            )}
          >
            {f === "all" ? `All (${mistakes.length})` : `${f} (${mistakes.filter((m) => m.severity === f).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((mistake, i) => {
          const config = severityConfig[mistake.severity] || defaultSeverity;
          const Icon = config.icon;
          const isExpanded = expandedIdx === i;

          return (
            <div key={i} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", config.color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{mistake.issue}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", config.color)}>
                      {config.label}
                    </span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Why it matters</p>
                    <p className="text-sm">{mistake.explanation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">How to fix</p>
                    <p className="text-sm text-accent">{mistake.fix}</p>
                  </div>
                  {mistake.example && (
                    <div className="bg-white/[0.02] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-warning" />
                        <p className="text-xs font-medium text-muted-foreground">Example</p>
                      </div>
                      <p className="text-sm text-muted-foreground italic">{mistake.example}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
