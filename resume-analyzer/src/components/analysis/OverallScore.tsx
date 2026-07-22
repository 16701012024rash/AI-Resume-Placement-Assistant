"use client";

import { ScoreRing } from "@/components/charts/ScoreRing";
import { MultiProgress } from "@/components/charts/ProgressBars";
import type { ScoreBreakdown } from "@/lib/types/analysis";

interface OverallScoreProps {
  scores: ScoreBreakdown;
}

export function OverallScore({ scores }: OverallScoreProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <ScoreRing score={scores.overall} size={180} strokeWidth={12} />
        <div className="flex-1 w-full">
          <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
          <MultiProgress
            items={[
              { label: "ATS Compatibility", value: scores.ats },
              { label: "Recruiter Score", value: scores.recruiter },
              { label: "Technical Depth", value: scores.technical },
              { label: "Content Quality", value: scores.contentQuality },
              { label: "Formatting", value: scores.formatting },
              { label: "Impact Score", value: scores.impact },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
