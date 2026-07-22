"use client";

import { Copy, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { copyToClipboard } from "@/lib/utils";
import type { ProjectSuggestion } from "@/lib/types/analysis";

interface ProjectEnhancementProps {
  projects: ProjectSuggestion[];
}

export function ProjectEnhancement({ projects }: ProjectEnhancementProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (text: string, idx: number) => {
    await copyToClipboard(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-3">
      {projects.map((project, i) => (
        <div key={i} className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{project.currentTitle || project.projectName || `Project ${i + 1}`}</p>
            <button
              onClick={() => handleCopy(project.suggestedDescription, i)}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
            >
              {copiedIdx === i ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>

          {project.suggestedTitle && project.suggestedTitle !== project.currentTitle && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{project.currentTitle}</span>
              <ArrowRight className="w-3 h-3 text-accent shrink-0" />
              <span className="text-accent font-medium">{project.suggestedTitle}</span>
            </div>
          )}

          {project.suggestedDescription && (
            <div className="bg-success-muted/30 rounded-lg p-3">
              <p className="text-xs font-medium text-success mb-1">Suggested Description</p>
              <p className="text-sm">{project.suggestedDescription}</p>
            </div>
          )}

          {project.missingTechnologies.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Consider adding:</p>
              <div className="flex flex-wrap gap-1.5">
                {project.missingTechnologies.map((tech, j) => (
                  <span key={j} className="text-xs px-2 py-0.5 rounded-md bg-info-muted text-info">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
