import { NextRequest } from "next/server";
import { extractText } from "@/lib/parsers";
import { generateStructuredJSON } from "@/lib/ai/gemini";
import {
  AGENT1_SYSTEM_PROMPT,
  AGENT2_SYSTEM_PROMPT,
  BUILD_AGENT1_PROMPT,
  BUILD_AGENT2_PROMPT,
} from "@/lib/ai/prompts";
import type { AnalysisResult } from "@/lib/types/analysis";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.toLowerCase().split(".").pop();
    if (ext !== "pdf" && ext !== "docx") {
      return Response.json({ error: "Unsupported format. Use PDF or DOCX." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resumeText = await extractText(buffer, file.name);

    if (!resumeText || resumeText.trim().length < 50) {
      return Response.json(
        { error: "Could not extract meaningful text from the file. Please try a different file." },
        { status: 400 }
      );
    }

    const agent1Schema = `{
      "extractedInfo": { personalInfo: { name, email, phone, linkedin, github, portfolio, location }, summary, education: [{ institution, degree, field, startDate, endDate, gpa, highlights }], experience: [{ company, title, startDate, endDate, location, bullets }], projects: [{ name, description, technologies, highlights, link }], skills: { technical, soft, tools, frameworks, languages, domain }, certifications, achievements, languages },
      "scores": { overall, ats, recruiter, technical, contentQuality, formatting, impact },
      "health": [{ label, status: "pass"|"warn"|"fail", detail }],
      "atsAnalysis": [{ check, status: "pass"|"warn"|"fail", impact, explanation, fix }],
      "keywords": { present: [{ category, keywords }], missing: [{ keyword, reason, where, priority: "high"|"medium"|"low" }] },
      "skillGap": { targetRole, currentSkills, missingSkills, recommendedSkills, advancedSkills, niceToHave },
      "mistakes": [{ severity: "critical"|"major"|"minor", issue, explanation, fix, example }]
    }`;

    const agent1Result = await generateStructuredJSON<Record<string, unknown>>(
      BUILD_AGENT1_PROMPT(resumeText),
      AGENT1_SYSTEM_PROMPT,
      agent1Schema
    );

    const agent2Schema = `{
      "sectionFeedback": [{ section, rating, strengths: string[], weaknesses: string[], improvedVersion, tips: string[] }],
      "rewrites": [{ original, improved, reason }],
      "projectSuggestions": [{ projectName, currentTitle, suggestedTitle, currentDescription, suggestedDescription, missingTechnologies: string[], suggestedOrder }],
      "experienceSuggestions": [{ company, originalBullets: string[], improvedBullets: string[], method }],
      "recruiter": { wouldShortlist, wouldInterview, biggestConcern, strongestSection, biggestWeakness, hiringConfidence, shortlistingProbability, questions: string[] },
      "recommendations": [{ rank, impact, title, description, category }],
      "strengths": [{ label, detail }],
      "quickFixes": [{ issue, fix, timeEstimate }],
      "detailedReport": "string"
    }`;

    const agent2Result = await generateStructuredJSON<Record<string, unknown>>(
      BUILD_AGENT2_PROMPT(
        JSON.stringify(agent1Result.extractedInfo),
        JSON.stringify(agent1Result.atsAnalysis),
        JSON.stringify(agent1Result.health),
        JSON.stringify(agent1Result.keywords),
        JSON.stringify(agent1Result.skillGap),
        JSON.stringify(agent1Result.mistakes),
        JSON.stringify(agent1Result.scores)
      ),
      AGENT2_SYSTEM_PROMPT,
      agent2Schema
    );

    const fullResult: AnalysisResult = {
      scores: agent1Result.scores as AnalysisResult["scores"],
      extractedInfo: agent1Result.extractedInfo as AnalysisResult["extractedInfo"],
      health: agent1Result.health as AnalysisResult["health"],
      atsAnalysis: agent1Result.atsAnalysis as AnalysisResult["atsAnalysis"],
      keywords: agent1Result.keywords as AnalysisResult["keywords"],
      skillGap: agent1Result.skillGap as AnalysisResult["skillGap"],
      mistakes: agent1Result.mistakes as AnalysisResult["mistakes"],
      sectionFeedback: agent2Result.sectionFeedback as AnalysisResult["sectionFeedback"],
      rewrites: agent2Result.rewrites as AnalysisResult["rewrites"],
      projectSuggestions: agent2Result.projectSuggestions as AnalysisResult["projectSuggestions"],
      experienceSuggestions: agent2Result.experienceSuggestions as AnalysisResult["experienceSuggestions"],
      recruiter: agent2Result.recruiter as AnalysisResult["recruiter"],
      recommendations: agent2Result.recommendations as AnalysisResult["recommendations"],
      strengths: agent2Result.strengths as AnalysisResult["strengths"],
      quickFixes: agent2Result.quickFixes as AnalysisResult["quickFixes"],
      detailedReport: agent2Result.detailedReport as string,
    };

    return Response.json(fullResult);
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Analysis failed. Please try again.";
    return Response.json({ error: message }, { status: 500 });
  }
}
