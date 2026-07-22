export interface ScoreBreakdown {
  overall: number;
  ats: number;
  recruiter: number;
  technical: number;
  contentQuality: number;
  formatting: number;
  impact: number;
}

export interface HealthItem {
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface ATSItem {
  check: string;
  status: "pass" | "warn" | "fail";
  impact: string;
  explanation: string;
  fix: string;
}

export interface KeywordGroup {
  category: string;
  keywords: string[];
}

export interface MissingKeyword {
  keyword: string;
  reason: string;
  where: string;
  priority: "high" | "medium" | "low";
}

export interface SkillGap {
  targetRole: string;
  currentSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
  advancedSkills: string[];
  niceToHave: string[];
}

export interface ResumeMistake {
  severity: "critical" | "major" | "minor";
  issue: string;
  explanation: string;
  fix: string;
  example: string;
}

export interface SectionFeedbackItem {
  section: string;
  rating: number;
  strengths: string[];
  weaknesses: string[];
  improvedVersion: string;
  tips: string[];
}

export interface RewriteSuggestion {
  original: string;
  improved: string;
  reason: string;
}

export interface ProjectSuggestion {
  projectName: string;
  currentTitle: string;
  suggestedTitle: string;
  currentDescription: string;
  suggestedDescription: string;
  missingTechnologies: string[];
  suggestedOrder: number;
}

export interface ExperienceSuggestion {
  company: string;
  originalBullets: string[];
  improvedBullets: string[];
  method: string;
}

export interface RecruiterOpinion {
  wouldShortlist: string;
  wouldInterview: string;
  biggestConcern: string;
  strongestSection: string;
  biggestWeakness: string;
  hiringConfidence: number;
  shortlistingProbability: number;
  questions: string[];
}

export interface AIRecommendation {
  rank: number;
  impact: number;
  title: string;
  description: string;
  category: string;
}

export interface StrengthItem {
  label: string;
  detail: string;
}

export interface QuickFix {
  issue: string;
  fix: string;
  timeEstimate: string;
}

export interface AnalysisResult {
  scores: ScoreBreakdown;
  extractedInfo: import("./resume").ExtractedInfo;
  health: HealthItem[];
  atsAnalysis: ATSItem[];
  keywords: {
    present: KeywordGroup[];
    missing: MissingKeyword[];
  };
  skillGap: SkillGap;
  mistakes: ResumeMistake[];
  sectionFeedback: SectionFeedbackItem[];
  rewrites: RewriteSuggestion[];
  projectSuggestions: ProjectSuggestion[];
  experienceSuggestions: ExperienceSuggestion[];
  recruiter: RecruiterOpinion;
  recommendations: AIRecommendation[];
  strengths: StrengthItem[];
  quickFixes: QuickFix[];
  detailedReport: string;
}
