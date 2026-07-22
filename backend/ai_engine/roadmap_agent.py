from .. import gemini
from .schemas import RoadmapRequest, RoadmapResponse

SYSTEM_PROMPT = """You are the Roadmap Generation Agent inside a multi-agent
placement assistant. Build a realistic, week-by-week study plan that closes
a student's skill gaps for a target role, given a fixed number of weeks and
hours available per week. Be specific with tasks (e.g. "Solve 10 sliding
window problems on LeetCode", not "practice DSA"). Suggest real, well-known
free or low-cost resources (official docs, freeCodeCamp, LeetCode,
GeeksforGeeks, NPTEL, YouTube channels, etc.) — do not invent fake URLs.

Return JSON with EXACTLY this shape:
{
  "plan": [
    {
      "week": <int>,
      "focus_skills": [<string>, ...],
      "tasks": [<string>, ...],
      "resources": [<string>, ...]
    },
    ...
  ]
}
The "plan" array must have exactly the requested number of weeks, in order."""


def generate_roadmap(req: RoadmapRequest) -> RoadmapResponse:
    user_prompt = (
        f"Target role: {req.target_role}\n"
        f"Missing skills: {', '.join(req.missing_skills)}\n"
        f"Duration: {req.weeks} weeks\n"
        f"Available time: {req.hours_per_week} hours/week"
    )
    # Each week needs room for focus_skills + several tasks + resources.
    # A fixed limit breaks once weeks gets past ~4-5, so scale with the
    # requested duration instead (with headroom, capped at a safe ceiling).
    token_budget = min(8000, 900 * req.weeks + 800)
    data = gemini.ask_json(SYSTEM_PROMPT, user_prompt, max_tokens=token_budget)

    return RoadmapResponse(
        target_role=req.target_role,
        total_weeks=req.weeks,
        plan=data["plan"],
    )
