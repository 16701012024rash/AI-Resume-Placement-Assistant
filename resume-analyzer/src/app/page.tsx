"use client";

import { useAppStore } from "@/lib/store/app-store";
import { UploadZone } from "@/components/upload/UploadZone";
import { AnalysisLoader } from "@/components/analysis/AnalysisLoader";
import { Dashboard } from "@/components/analysis/Dashboard";
import { Brain, FileText, Shield, Sparkles } from "lucide-react";

export default function Home() {
  const { view, error, setError } = useAppStore();

  if (view === "analyzing") return <AnalysisLoader />;
  if (view === "dashboard") return <Dashboard />;

  return (
    <div className="min-h-screen bg-background flex flex-col aurora-container">
      <div className="aurora-glow-1" />
      <div className="aurora-glow-2" />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-2xl space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-muted text-accent text-xs font-medium mb-2 border border-accent/10">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Analysis
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              AI Resume<br />
              <span className="text-gradient">Analyzer</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
              Upload your resume and receive a professional recruiter-level analysis powered by AI.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
            {[
              { icon: Brain, label: "AI Parsing", desc: "Smart extraction" },
              { icon: Shield, label: "ATS Check", desc: "Compatibility test" },
              { icon: FileText, label: "Deep Review", desc: "Recruiter insights" },
              { icon: Sparkles, label: "Rewrites", desc: "AI improvements" },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={i} 
                  className="glass rounded-2xl p-4 text-center space-y-2 hover:scale-[1.03] transition-all duration-300 hover:border-accent-hover/30 hover:shadow-lg hover:shadow-accent-muted/5 group cursor-default"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-xs font-semibold">{feature.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-normal">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Upload */}
          <UploadZone />

          {/* Error */}
          {error && (
            <div className="text-center bg-danger-muted/30 border border-danger/20 rounded-xl p-4 animate-fade-in-up">
              <p className="text-sm text-danger font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-muted-foreground hover:text-foreground mt-2 underline underline-offset-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground/40">
            Supports PDF and DOCX files up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
