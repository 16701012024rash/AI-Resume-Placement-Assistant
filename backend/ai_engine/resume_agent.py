from .. import gemini
from .schemas import ResumeReviewRequest, ResumeReviewResponse

SYSTEM_PROMPT = """You are the Resume Review Agent inside a multi-agent placement
assistant. You give honest, constructive, specific feedback like a senior
technical recruiter — not generic praise.

Return JSON with EXACTLY these keys:
{
  "overall_score": <int 0-100>,
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "skills_found": [<string>, ...],
  "projects_found": [<string>, ...],
  "improvement_suggestions": [<string>, ...]
}
Keep each list to 3-6 concise, specific items. Do not invent skills or
projects that are not implied by the resume text."""


def review_resume(req: ResumeReviewRequest) -> ResumeReviewResponse:
    role_line = f"Target role: {req.target_role}" if req.target_role else "Target role: not specified"
    user_prompt = f"{role_line}\n\nResume text:\n{req.resume_text}"

    data = gemini.ask_json(SYSTEM_PROMPT, user_prompt, max_tokens=4000)
    return ResumeReviewResponse(**data)
