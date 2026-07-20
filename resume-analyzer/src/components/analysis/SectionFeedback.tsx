"use client";

import { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionFeedbackItem } from "@/lib/types/analysis";

interface SectionFeedbackProps {
  sections: SectionFeedbackItem[];
}

export function SectionFeedback({ sections }: SectionFeedbackProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {(sections || []).map((section, i) => {
        const isExpanded = expandedIdx === i;
        const strengths = Array.isArray(section.strengths)
          ? section.strengths
          : typeof (section.strengths as unknown) === "string" && (section.strengths as unknown as string).trim()
          ? [section.strengths as unknown as string]
          : [];
        const weaknesses = Array.isArray(section.weaknesses)
          ? section.weaknesses
          : typeof (section.weaknesses as unknown) === "string" && (section.weaknesses as unknown as string).trim()
          ? [section.weaknesses as unknown as string]
          : [];
        const tips = Array.isArray(section.tips)
          ? section.tips
          : typeof (section.tips as unknown) === "string" && (section.tips as unknown as string).trim()
          ? [section.tips as unknown as string]
          : [];

        return (
          <div key={i} className="glass rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedIdx(isExpanded ? null : i)}
              className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-1 shrink-0">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={cn("w-3.5 h-3.5", s < section.rating ? "text-warning fill-warning" : "text-white/10")}
                  />
                ))}
              </div>
              <span className="text-sm font-medium flex-1">{section.section}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-3">
                {strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-success mb-1.5">Strengths</p>
                    <ul className="space-y-1">
                      {strengths.map((s, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-success mt-1">+</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {weaknesses.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-warning mb-1.5">Weaknesses</p>
                    <ul className="space-y-1">
                      {weaknesses.map((w, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-warning mt-1">-</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.improvedVersion && (
                  <div>
                    <p className="text-xs font-medium text-accent mb-1.5">Improved Version</p>
                    <div className="bg-accent-muted rounded-lg p-3 text-sm text-muted-foreground">
                      {section.improvedVersion}
                    </div>
                  </div>
                )}

                {tips.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Tips</p>
                    <ul className="space-y-1">
                      {tips.map((tip, j) => (
                        <li key={j} className="text-xs text-muted-foreground/70 flex items-start gap-2">
                          <span className="text-accent mt-0.5">&#x2022;</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
