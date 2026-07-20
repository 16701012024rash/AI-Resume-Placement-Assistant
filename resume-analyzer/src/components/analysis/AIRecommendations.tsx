"use client";

import { Star, ArrowRight } from "lucide-react";
import type { AIRecommendation } from "@/lib/types/analysis";

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
}

export function AIRecommendations({ recommendations }: AIRecommendationsProps) {
  return (
    <div className="space-y-2">
      {recommendations.map((rec) => (
        <div key={rec.rank} className="glass glass-hover rounded-xl p-4 flex items-start gap-4 transition-all duration-200">
          <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center shrink-0">
            <span className="text-sm font-bold font-mono text-accent">{rec.rank}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium">{rec.title}</p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < rec.impact ? "text-warning fill-warning" : "text-white/10"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{rec.description}</p>
            <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
              {rec.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
