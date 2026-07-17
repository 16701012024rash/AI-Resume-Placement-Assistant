from typing import List, Optional
from pydantic import BaseModel, Field


# ---------- Resume Review ----------
class ResumeReviewRequest(BaseModel):
    resume_text: str = Field(..., description="Raw resume text (from Member 2's parser)")
    target_role: Optional[str] = Field(None, description="e.g. 'SDE', 'Data Analyst'")


class ResumeReviewResponse(BaseModel):
    overall_score: int
    strengths: List[str]
    weaknesses: List[str]
    skills_found: List[str]
    projects_found: List[str]
    improvement_suggestions: List[str]


# ---------- Skill Gap Analysis ----------
class SkillGapRequest(BaseModel):
    current_skills: List[str]
    target_role: str


class SkillGapResponse(BaseModel):
    matched_skills: List[str]
    missing_skills: List[str]
    nice_to_have_skills: List[str]
    priority_order: List[str]


# ---------- Placement Readiness Score ----------
class PlacementScoreRequest(BaseModel):
    resume_score: int = Field(..., ge=0, le=100)
    ats_score: Optional[int] = Field(None, ge=0, le=100, description="From Member 2's ATS module")
    skills_matched: int
    skills_required: int
    mock_interview_score: Optional[int] = Field(None, ge=0, le=100, description="From Member 4's module")


class PlacementScoreResponse(BaseModel):
    readiness_score: int
    breakdown: dict
    verdict: str
    top_recommendations: List[str]


# ---------- Roadmap Generation ----------
class RoadmapRequest(BaseModel):
    missing_skills: List[str]
    target_role: str
    weeks: int = Field(4, ge=1, le=12)
    hours_per_week: int = Field(10, ge=1, le=60)


class WeekPlan(BaseModel):
    week: int
    focus_skills: List[str]
    tasks: List[str]
    resources: List[str]


class RoadmapResponse(BaseModel):
    target_role: str
    total_weeks: int
    plan: List[WeekPlan]


# ---------- Chat Assistant ----------
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    resume_context: Optional[str] = Field(
        None, description="Optional short summary of user's resume/skills for grounding"
    )


class ChatResponse(BaseModel):
    reply: str
