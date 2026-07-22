"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { Brain, FileSearch, Shield, Users, Lightbulb, CheckCircle2 } from "lucide-react";

const STAGES = [
  { label: "Reading Resume...", icon: FileSearch, duration: 3000 },
  { label: "Extracting Information...", icon: Brain, duration: 4000 },
  { label: "Checking ATS Compatibility...", icon: Shield, duration: 3500 },
  { label: "Analyzing Keywords & Skills...", icon: Brain, duration: 3000 },
  { label: "Identifying Mistakes...", icon: FileSearch, duration: 2500 },
  { label: "Recruiter Evaluation...", icon: Users, duration: 4000 },
  { label: "Generating Improvements...", icon: Lightbulb, duration: 3500 },
  { label: "Preparing Final Report...", icon: Brain, duration: 3000 },
];

export function AnalysisLoader() {
  const file = useAppStore((s) => s.file);
  const analysisStep = useAppStore((s) => s.analysisStep);
  const analysisProgress = useAppStore((s) => s.analysisProgress);
  const setAnalysisStep = useAppStore((s) => s.setAnalysisStep);
  const setAnalysisProgress = useAppStore((s) => s.setAnalysisProgress);
  const setAnalysisResult = useAppStore((s) => s.setAnalysisResult);
  const setError = useAppStore((s) => s.setError);
  const setView = useAppStore((s) => s.setView);
  const hasStarted = useRef(false);

  const runAnalysis = useCallback(async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analysis failed");
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed";
      setError(message);
      setView("upload");
    }
  }, [file, setAnalysisResult, setError, setView]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let elapsed = 0;
    const totalDuration = STAGES.reduce((sum, s) => sum + s.duration, 0);

    const interval = setInterval(() => {
      elapsed += 200;
      const progress = Math.min((elapsed / totalDuration) * 100, 95);
      setAnalysisProgress(progress);

      let accumulated = 0;
      for (let i = 0; i < STAGES.length; i++) {
        accumulated += STAGES[i].duration;
        if (elapsed <= accumulated) {
          setAnalysisStep(STAGES[i].label);
          break;
        }
      }
    }, 200);

    setAnalysisStep(STAGES[0].label);
    runAnalysis();

    return () => clearInterval(interval);
  }, [runAnalysis, setAnalysisStep, setAnalysisProgress]);

  const currentStageIdx = STAGES.findIndex((s) => s.label === analysisStep);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full bg-accent/10 flex items-center justify-center">
            <Brain className="w-6 h-6 text-accent" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Analyzing Your Resume</h2>
          <p className="text-sm text-muted-foreground">
            Our AI agents are reviewing your resume like a professional recruiter
          </p>
        </div>

        <div className="space-y-4">
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(analysisProgress, 100)}%` }}
            />
          </div>

          <div className="space-y-2">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isComplete = i < currentStageIdx;
              const isCurrent = i === currentStageIdx;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                    isCurrent
                      ? "text-foreground"
                      : isComplete
                      ? "text-success"
                      : "text-muted-foreground/40"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                  )}
                  <span>{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50">
          This may take 30-60 seconds. Do not close this page.
        </p>
      </div>
    </div>
  );
}
