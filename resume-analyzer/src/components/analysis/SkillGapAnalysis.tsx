"use client";

import { RadarSkillChart } from "@/components/charts/RadarChart";
import { cn } from "@/lib/utils";
import type { SkillGap } from "@/lib/types/analysis";

interface SkillGapAnalysisProps {
  skillGap: SkillGap;
}

export function SkillGapAnalysis({ skillGap }: SkillGapAnalysisProps) {
  const allSkillSets = [
    { label: "Current", skills: skillGap.currentSkills, color: "text-success bg-success-muted" },
    { label: "Missing", skills: skillGap.missingSkills, color: "text-danger bg-danger-muted" },
    { label: "Recommended", skills: skillGap.recommendedSkills, color: "text-warning bg-warning-muted" },
    { label: "Advanced", skills: skillGap.advancedSkills, color: "text-info bg-info-muted" },
    { label: "Nice to Have", skills: skillGap.niceToHave, color: "text-muted-foreground bg-white/5" },
  ];

  const radarLabels = ["Current", "Missing", "Recommended", "Advanced", "Nice-to-Have"];
  const radarValues = [
    skillGap.currentSkills.length * 10,
    skillGap.missingSkills.length * 10,
    skillGap.recommendedSkills.length * 10,
    skillGap.advancedSkills.length * 10,
    skillGap.niceToHave.length * 10,
  ].map((v) => Math.min(v, 100));

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-4">
        <p className="text-xs font-medium text-muted-foreground mb-1">Inferred Target Role</p>
        <p className="text-lg font-semibold text-accent">{skillGap.targetRole}</p>
      </div>

      <RadarSkillChart labels={radarLabels} values={radarValues} />

      <div className="space-y-4">
        {allSkillSets.map((set, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", set.color)}>
                {set.label}
              </span>
              <span className="text-xs text-muted-foreground">({set.skills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {set.skills.length > 0 ? (
                set.skills.map((skill, j) => (
                  <span key={j} className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-muted-foreground">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground/40 italic">None identified</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
