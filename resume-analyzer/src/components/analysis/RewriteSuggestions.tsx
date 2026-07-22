"use client";

import { useState } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import type { RewriteSuggestion } from "@/lib/types/analysis";

interface RewriteSuggestionsProps {
  rewrites: RewriteSuggestion[];
}

export function RewriteSuggestions({ rewrites }: RewriteSuggestionsProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (text: string, idx: number) => {
    await copyToClipboard(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-3">
      {rewrites.map((rewrite, i) => (
        <div key={i} className="glass rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-danger">Current</p>
              <p className="text-sm text-muted-foreground bg-danger-muted/30 rounded-lg p-3">
                {rewrite.original}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-success">Improved</p>
                <button
                  onClick={() => handleCopy(rewrite.improved, i)}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
                >
                  {copiedIdx === i ? (
                    <><Check className="w-3 h-3" /> Copied</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>
              <p className="text-sm bg-success-muted/30 rounded-lg p-3">
                {rewrite.improved}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowRight className="w-3 h-3 text-accent" />
            <span>{rewrite.reason}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
