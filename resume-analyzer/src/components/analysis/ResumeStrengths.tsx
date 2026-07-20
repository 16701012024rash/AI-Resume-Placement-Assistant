"use client";

import { CheckCircle2 } from "lucide-react";
import type { StrengthItem } from "@/lib/types/analysis";

interface ResumeStrengthsProps {
  strengths: StrengthItem[];
}

export function ResumeStrengths({ strengths }: ResumeStrengthsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {strengths.map((item, i) => (
        <div key={i} className="glass glass-hover rounded-xl p-4 flex items-start gap-3 transition-all duration-200">
          <div className="w-7 h-7 rounded-lg bg-success-muted flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
