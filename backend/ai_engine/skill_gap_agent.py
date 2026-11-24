from .. import gemini
from .schemas import SkillGapRequest, SkillGapResponse

SYSTEM_PROMPT = """You are the Skill Gap Analysis Agent inside a multi-agent
placement assistant. Given a student's current skills and a target job role,
determine what they already cover and what's missing, based on real-world
industry expectations for that role in 2026.

Return JSON with EXACTLY these keys:
{
  "matched_skills": [<string>, ...],
  "missing_skills": [<string>, ...],
  "nice_to_have_skills": [<string>, ...],
  "priority_order": [<string>, ...]
}
"missing_skills" are must-haves the student lacks.
"nice_to_have_skills" are competitive extras, not blockers.
"priority_order" ranks the missing_skills from most to least urgent to learn."""

RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "matched_skills": {"type": "array", "items": {"type": "string"}, "maxItems": 12},
        "missing_skills": {"type": "array", "items": {"type": "string"}, "maxItems": 12},
        "nice_to_have_skills": {"type": "array", "items": {"type": "string"}, "maxItems": 12},
        "priority_order": {"type": "array", "items": {"type": "string"}, "maxItems": 12},
    },
    "required": ["matched_skills", "missing_skills", "nice_to_have_skills", "priority_order"],
    "additionalProperties": False,
}


def analyze_skill_gap(req: SkillGapRequest) -> SkillGapResponse:
    user_prompt = (
        f"Target role: {req.target_role}\n"
        f"Current skills: {', '.join(req.current_skills) if req.current_skills else 'none listed'}"
    )
    data = gemini.ask_json(SYSTEM_PROMPT, user_prompt, max_tokens=512, response_format=RESPONSE_SCHEMA)
    return SkillGapResponse(**data)
