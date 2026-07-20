"use client";

import { Briefcase, TrendingUp, MessageCircle } from "lucide-react";
import type { RecruiterOpinion } from "@/lib/types/analysis";

interface RecruiterInsightsProps {
  recruiter: RecruiterOpinion;
}

export function RecruiterInsights({ recruiter }: RecruiterInsightsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-accent" />
            <p className="text-xs font-medium text-muted-foreground">Hiring Confidence</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-accent">{recruiter.hiringConfidence}</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <p className="text-xs font-medium text-muted-foreground">Shortlisting Probability</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-success">{recruiter.shortlistingProbability}</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: "Would I Shortlist This Resume?", value: recruiter.wouldShortlist, color: "text-accent" },
          { label: "Would I Interview This Candidate?", value: recruiter.wouldInterview, color: "text-success" },
          { label: "Strongest Section", value: recruiter.strongestSection, color: "text-success" },
          { label: "Biggest Weakness", value: recruiter.biggestWeakness, color: "text-warning" },
          { label: "Biggest Concern", value: recruiter.biggestConcern, color: "text-danger" },
        ].map((item, i) => (
          <div key={i} className="glass glass-hover rounded-xl p-4 transition-all duration-200">
            <p className="text-xs font-medium text-muted-foreground mb-1">{item.label}</p>
            <p className={`text-sm font-medium ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {recruiter.questions.length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-accent" />
            <p className="text-sm font-medium">Interview Questions They Would Ask</p>
          </div>
          <ul className="space-y-2">
            {recruiter.questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-accent font-mono mt-0.5 shrink-0">Q{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
