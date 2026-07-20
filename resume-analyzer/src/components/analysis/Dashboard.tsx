"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";
import {
  BarChart3, Activity, Shield, Tag, GitBranch, AlertTriangle,
  Layers, Sparkles, FolderKanban, Briefcase, UserCheck,
  Target, CheckCircle2, Zap, FileText, RotateCcw, Download
} from "lucide-react";

import { OverallScore } from "./OverallScore";
import { ResumeHealth } from "./ResumeHealth";
import { ATSAnalysis } from "./ATSAnalysis";
import { KeywordAnalysis } from "./KeywordAnalysis";
import { SkillGapAnalysis } from "./SkillGapAnalysis";
import { ResumeMistakes } from "./ResumeMistakes";
import { SectionFeedback } from "./SectionFeedback";
import { RewriteSuggestions } from "./RewriteSuggestions";
import { ProjectEnhancement } from "./ProjectEnhancement";
import { ExperienceEnhancement } from "./ExperienceEnhancement";
import { RecruiterInsights } from "./RecruiterInsights";
import { AIRecommendations } from "./AIRecommendations";
import { ResumeStrengths } from "./ResumeStrengths";
import { QuickFixPanel } from "./QuickFixPanel";
import { DetailedReport } from "./DetailedReport";
import { ExtractedInfoSection } from "./ExtractedInfo";
import { ExportPanel } from "@/components/export/ExportPanel";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "health", label: "Health", icon: Activity },
  { id: "ats", label: "ATS", icon: Shield },
  { id: "keywords", label: "Keywords", icon: Tag },
  { id: "skills", label: "Skills Gap", icon: GitBranch },
  { id: "mistakes", label: "Mistakes", icon: AlertTriangle },
  { id: "sections", label: "Sections", icon: Layers },
  { id: "rewrites", label: "Rewrites", icon: Sparkles },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "recruiter", label: "Recruiter", icon: UserCheck },
  { id: "roadmap", label: "Roadmap", icon: Target },
  { id: "strengths", label: "Strengths", icon: CheckCircle2 },
  { id: "quickfix", label: "Quick Fix", icon: Zap },
  { id: "report", label: "Full Report", icon: FileText },
  { id: "data", label: "Extracted Data", icon: FileText },
];

export function Dashboard() {
  const { analysisResult, file, reset } = useAppStore();
  const [activeTab, setActiveTab] = useState("overview");

  if (!analysisResult) return null;

  const r = analysisResult;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Resume Analysis</h1>
              <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-none">{file?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportPanel result={r} fileName={file?.name || "resume"} />
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-foreground bg-white/5 hover:bg-white/10 text-sm transition-all font-medium hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar Navigation */}
        <nav className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-20 space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2 rounded-full text-sm transition-all duration-200 text-left hover:scale-[1.01]",
                    activeTab === section.id
                      ? "bg-accent-muted text-accent font-semibold"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border">
          <div className="flex overflow-x-auto py-2 px-4 gap-1 scrollbar-none">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all shrink-0 hover:scale-[1.02]",
                    activeTab === section.id
                      ? "bg-accent-muted text-accent font-semibold"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <div className="animate-fade-in-up">
            {activeTab === "overview" && (
              <SectionWrapper title="Overall Score" subtitle="Comprehensive scoring across all dimensions">
                <OverallScore scores={r.scores} />
              </SectionWrapper>
            )}
            {activeTab === "health" && (
              <SectionWrapper title="Resume Health" subtitle="Quick health indicators for your resume">
                <ResumeHealth health={r.health} />
              </SectionWrapper>
            )}
            {activeTab === "ats" && (
              <SectionWrapper title="ATS Analysis" subtitle="How Applicant Tracking Systems see your resume">
                <ATSAnalysis items={r.atsAnalysis} />
              </SectionWrapper>
            )}
            {activeTab === "keywords" && (
              <SectionWrapper title="Keyword Analysis" subtitle="Present and missing keywords">
                <KeywordAnalysis present={r.keywords.present} missing={r.keywords.missing} />
              </SectionWrapper>
            )}
            {activeTab === "skills" && (
              <SectionWrapper title="Skill Gap Analysis" subtitle="Your skills vs market expectations">
                <SkillGapAnalysis skillGap={r.skillGap} />
              </SectionWrapper>
            )}
            {activeTab === "mistakes" && (
              <SectionWrapper title="Resume Mistakes" subtitle="Issues found in your resume">
                <ResumeMistakes mistakes={r.mistakes} />
              </SectionWrapper>
            )}
            {activeTab === "sections" && (
              <SectionWrapper title="Section Feedback" subtitle="Detailed review of each resume section">
                <SectionFeedback sections={r.sectionFeedback} />
              </SectionWrapper>
            )}
            {activeTab === "rewrites" && (
              <SectionWrapper title="AI Rewrite Suggestions" subtitle="Before and after improvements">
                <RewriteSuggestions rewrites={r.rewrites} />
              </SectionWrapper>
            )}
            {activeTab === "projects" && (
              <SectionWrapper title="Project Enhancement" subtitle="Improve your project descriptions">
                <ProjectEnhancement projects={r.projectSuggestions} />
              </SectionWrapper>
            )}
            {activeTab === "experience" && (
              <SectionWrapper title="Experience Enhancement" subtitle="Stronger experience bullet points">
                <ExperienceEnhancement experiences={r.experienceSuggestions} />
              </SectionWrapper>
            )}
            {activeTab === "recruiter" && (
              <SectionWrapper title="Recruiter Insights" subtitle="How a recruiter sees your resume">
                <RecruiterInsights recruiter={r.recruiter} />
              </SectionWrapper>
            )}
            {activeTab === "roadmap" && (
              <SectionWrapper title="AI Recommendations" subtitle="Prioritized improvement roadmap">
                <AIRecommendations recommendations={r.recommendations} />
              </SectionWrapper>
            )}
            {activeTab === "strengths" && (
              <SectionWrapper title="Resume Strengths" subtitle="What's working well">
                <ResumeStrengths strengths={r.strengths} />
              </SectionWrapper>
            )}
            {activeTab === "quickfix" && (
              <SectionWrapper title="Quick Fixes" subtitle="Improvements under 5 minutes">
                <QuickFixPanel fixes={r.quickFixes} />
              </SectionWrapper>
            )}
            {activeTab === "report" && (
              <SectionWrapper title="Detailed Report" subtitle="Complete AI-generated analysis">
                <DetailedReport report={r.detailedReport} />
              </SectionWrapper>
            )}
            {activeTab === "data" && (
              <SectionWrapper title="Extracted Data" subtitle="Information parsed from your resume">
                <ExtractedInfoSection info={r.extractedInfo} />
              </SectionWrapper>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionWrapper({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
