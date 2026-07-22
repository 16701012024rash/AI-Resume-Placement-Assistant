"use client";

import { useState } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import type { ExperienceSuggestion } from "@/lib/types/analysis";

interface ExperienceEnhancementProps {
  experiences: ExperienceSuggestion[];
}

export function ExperienceEnhancement({ experiences }: ExperienceEnhancementProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (text: string, idx: number) => {
    await copyToClipboard(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-4">
      {experiences.map((exp, i) => (
        <div key={i} className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{exp.company}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-muted text-accent">
              {exp.method}
            </span>
          </div>

          <div className="space-y-2">
            {exp.originalBullets.map((bullet, j) => (
              <div key={j} className="space-y-1">
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-danger-muted/20 rounded-lg p-2.5">
                  <span className="text-danger mt-0.5 shrink-0">&#x2717;</span>
                  <span>{bullet}</span>
                </div>
                {exp.improvedBullets[j] && (
                  <div className="flex items-start gap-2 text-sm bg-success-muted/20 rounded-lg p-2.5 ml-4">
                    <span className="text-success mt-0.5 shrink-0">&#x2713;</span>
                    <span className="flex-1">{exp.improvedBullets[j]}</span>
                    <button
                      onClick={() => handleCopy(exp.improvedBullets[j], i * 100 + j)}
                      className="shrink-0"
                    >
                      {copiedIdx === i * 100 + j ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-accent transition-colors" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
