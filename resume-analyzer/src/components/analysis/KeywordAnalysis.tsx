"use client";

import { useState } from "react";
import { Tag, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn, getPriorityColor } from "@/lib/utils";
import type { KeywordGroup, MissingKeyword } from "@/lib/types/analysis";

interface KeywordAnalysisProps {
  present: KeywordGroup[];
  missing: MissingKeyword[];
}

export function KeywordAnalysis({ present, missing }: KeywordAnalysisProps) {
  const [tab, setTab] = useState<"present" | "missing">("present");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 bg-white/5 border border-border rounded-full w-fit">
        <button
          onClick={() => setTab("present")}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.01]",
            tab === "present" ? "bg-accent text-white hover:bg-accent-hover" : "text-muted hover:text-foreground"
          )}
        >
          Present Keywords ({present.reduce((s, g) => s + g.keywords.length, 0)})
        </button>
        <button
          onClick={() => setTab("missing")}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.01]",
            tab === "missing" ? "bg-accent text-white hover:bg-accent-hover" : "text-muted hover:text-foreground"
          )}
        >
          Missing Keywords ({missing.length})
        </button>
      </div>

      {tab === "present" && (
        <div className="space-y-4">
          {present.map((group, i) => (
            <div key={i}>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{group.category}</p>
              <div className="flex flex-wrap gap-2">
                {group.keywords.map((kw, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-muted text-accent text-xs font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "missing" && (
        <div className="space-y-2">
          {missing.map((kw, i) => (
            <div key={i} className="glass glass-hover rounded-xl p-4 transition-all duration-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className={cn("w-4 h-4", getPriorityColor(kw.priority))} />
                <span className="text-sm font-medium">{kw.keyword}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", {
                  "bg-danger-muted text-danger": kw.priority === "high",
                  "bg-warning-muted text-warning": kw.priority === "medium",
                  "bg-info-muted text-info": kw.priority === "low",
                })}>
                  {kw.priority}
                </span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">{kw.reason}</p>
              <p className="text-xs text-accent ml-6 mt-1">Add to: {kw.where}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
