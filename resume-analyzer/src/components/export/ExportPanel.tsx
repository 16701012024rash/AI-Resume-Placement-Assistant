"use client";

import { useState } from "react";
import { Download, FileText, FileType, Copy, Check } from "lucide-react";
import type { AnalysisResult } from "@/lib/types/analysis";
import { copyToClipboard } from "@/lib/utils";

interface ExportPanelProps {
  result: AnalysisResult;
  fileName: string;
}

export function ExportPanel({ result, fileName }: ExportPanelProps) {
  const [copiedMd, setCopiedMd] = useState(false);

  const generateMarkdown = (): string => {
    const r = result;
    let md = `# Resume Analysis Report\n\n`;
    md += `**File:** ${fileName}\n**Date:** ${new Date().toLocaleDateString()}\n\n`;
    md += `---\n\n`;
    md += `## Overall Score: ${r.scores?.overall ?? 0}/100\n\n`;
    md += `| Category | Score |\n|----------|-------|\n`;
    md += `| ATS Compatibility | ${r.scores?.ats ?? 0}/100 |\n`;
    md += `| Recruiter Score | ${r.scores?.recruiter ?? 0}/100 |\n`;
    md += `| Technical Depth | ${r.scores?.technical ?? 0}/100 |\n`;
    md += `| Content Quality | ${r.scores?.contentQuality ?? 0}/100 |\n`;
    md += `| Formatting | ${r.scores?.formatting ?? 0}/100 |\n`;
    md += `| Impact Score | ${r.scores?.impact ?? 0}/100 |\n\n`;

    md += `## Resume Health\n\n`;
    if (Array.isArray(r.health)) {
      r.health.forEach((h) => {
        if (!h) return;
        const icon = h.status === "pass" ? "✅" : h.status === "warn" ? "⚠️" : "❌";
        md += `- ${icon} **${h.label || "Health Indicator"}:** ${h.detail || ""}\n`;
      });
    } else {
      md += `No health checks available.\n`;
    }

    md += `\n## ATS Analysis\n\n`;
    if (Array.isArray(r.atsAnalysis)) {
      r.atsAnalysis.forEach((a) => {
        if (!a) return;
        const icon = a.status === "pass" ? "✅" : a.status === "warn" ? "⚠️" : "❌";
        md += `- ${icon} **${a.check || "Check"}:** ${a.explanation || ""}\n  - Fix: ${a.fix || ""}\n`;
      });
    } else {
      md += `No ATS analysis available.\n`;
    }

    md += `\n## Missing Keywords\n\n`;
    if (r.keywords && Array.isArray(r.keywords.missing)) {
      r.keywords.missing.forEach((k) => {
        if (!k) return;
        md += `- **${k.keyword || ""}** (${k.priority || ""}) - ${k.reason || ""} → Add to: ${k.where || ""}\n`;
      });
      if (r.keywords.missing.length === 0) {
        md += `No missing keywords identified.\n`;
      }
    } else {
      md += `No keyword analysis available.\n`;
    }

    md += `\n## Skill Gap Analysis\n\n`;
    if (r.skillGap) {
      md += `**Target Role:** ${r.skillGap.targetRole || "N/A"}\n\n`;
      const missingSkills = Array.isArray(r.skillGap.missingSkills)
        ? r.skillGap.missingSkills
        : typeof (r.skillGap.missingSkills as unknown) === "string" && (r.skillGap.missingSkills as unknown as string).trim()
        ? [r.skillGap.missingSkills as unknown as string]
        : [];
      const recommendedSkills = Array.isArray(r.skillGap.recommendedSkills)
        ? r.skillGap.recommendedSkills
        : typeof (r.skillGap.recommendedSkills as unknown) === "string" && (r.skillGap.recommendedSkills as unknown as string).trim()
        ? [r.skillGap.recommendedSkills as unknown as string]
        : [];
      md += `- **Missing Skills:** ${missingSkills.join(", ") || "None"}\n`;
      md += `- **Recommended:** ${recommendedSkills.join(", ") || "None"}\n`;
    } else {
      md += `No skill gap analysis available.\n`;
    }

    md += `\n## Mistakes\n\n`;
    if (Array.isArray(r.mistakes)) {
      r.mistakes.forEach((m) => {
        if (!m) return;
        const severity = (m.severity || "minor").toUpperCase();
        md += `- **[${severity}] ${m.issue || ""}**\n  - ${m.explanation || ""}\n  - Fix: ${m.fix || ""}\n`;
      });
      if (r.mistakes.length === 0) {
        md += `No mistakes detected.\n`;
      }
    } else {
      md += `No mistakes analysis available.\n`;
    }

    md += `\n## AI Recommendations\n\n`;
    if (Array.isArray(r.recommendations)) {
      r.recommendations.forEach((rec) => {
        if (!rec) return;
        const rawImpact = typeof rec.impact === "number" ? rec.impact : parseInt(rec.impact as unknown as string, 10);
        const impact = isNaN(rawImpact) ? 0 : Math.max(0, Math.min(5, rawImpact));
        md += `${"★".repeat(impact)}${"☆".repeat(5 - impact)} **${rec.title || ""}**\n- ${rec.description || ""}\n\n`;
      });
      if (r.recommendations.length === 0) {
        md += `No specific AI recommendations available.\n`;
      }
    } else {
      md += `No AI recommendations available.\n`;
    }

    md += `\n## Recruiter Opinion\n\n`;
    if (r.recruiter) {
      md += `- **Hiring Confidence:** ${r.recruiter.hiringConfidence ?? 0}%\n`;
      md += `- **Shortlisting Probability:** ${r.recruiter.shortlistingProbability ?? 0}%\n`;
      md += `- **Strongest Section:** ${r.recruiter.strongestSection || "N/A"}\n`;
      md += `- **Biggest Weakness:** ${r.recruiter.biggestWeakness || "N/A"}\n`;
    } else {
      md += `No recruiter opinions available.\n`;
    }

    if (r.detailedReport) {
      md += `\n---\n\n## Detailed AI Report\n\n${r.detailedReport}\n`;
    }

    return md;
  };

  const generatePlainText = (): string => {
    const md = generateMarkdown();
    return md
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\|/g, " ")
      .replace(/---/g, "=".repeat(40))
      .replace(/✅/g, "[PASS]")
      .replace(/⚠️/g, "[WARN]")
      .replace(/❌/g, "[FAIL]")
      .replace(/★/g, "*")
      .replace(/☆/g, "-");
  };

  const downloadFile = (content: string, type: string, ext: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-analysis.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMD = () => {
    const md = generateMarkdown();
    downloadFile(md, "text/markdown", "md");
  };

  const handleDownloadTXT = () => {
    const txt = generatePlainText();
    downloadFile(txt, "text/plain", "txt");
  };

  const handleCopyMD = async () => {
    const md = generateMarkdown();
    await copyToClipboard(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleDownloadMD}
        className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-accent to-accent-hover text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-accent/25"
      >
        <FileText className="w-4 h-4" />
        Export Markdown
      </button>
      <button
        onClick={handleDownloadTXT}
        className="flex items-center gap-2 px-5 py-2 rounded-full border border-border text-foreground bg-white/5 hover:bg-white/10 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <FileType className="w-4 h-4" />
        Export Text
      </button>
      <button
        onClick={handleCopyMD}
        className="flex items-center gap-2 px-5 py-2 rounded-full border border-border text-foreground bg-white/5 hover:bg-white/10 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {copiedMd ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        {copiedMd ? "Copied" : "Copy Report"}
      </button>
    </div>
  );
}
