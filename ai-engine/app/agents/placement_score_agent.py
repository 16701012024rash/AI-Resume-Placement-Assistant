from app.core.llm_client import ask_claude_json
from app.models.schemas import PlacementScoreRequest, PlacementScoreResponse

SYSTEM_PROMPT = """You are the Placement Readiness verdict writer inside a
multi-agent placement assistant. You are given a computed readiness score
(0-100) and its breakdown. Write a short verdict and 3 concrete next-step
recommendations.

Return JSON with EXACTLY these keys:
{
  "verdict": <string, 1-2 sentences, direct and honest>,
  "top_recommendations": [<string>, <string>, <string>]
}"""


def _skill_coverage_pct(matched: int, required: int) -> float:
    if required <= 0:
        return 100.0
    return max(0.0, min(100.0, (matched / required) * 100))


def compute_placement_score(req: PlacementScoreRequest) -> PlacementScoreResponse:
    """
    Deterministic weighted score so it's explainable and reproducible
    (not left entirely to the LLM). Weights:
      Resume quality   : 30%
      ATS score        : 20%   (optional -> redistributed if missing)
      Skill coverage    : 35%
      Mock interview    : 15%  (optional -> redistributed if missing)
    """
    skill_coverage = _skill_coverage_pct(req.skills_matched, req.skills_required)

    weights = {"resume": 0.30, "ats": 0.20, "skills": 0.35, "interview": 0.15}
    components = {
        "resume": req.resume_score,
        "ats": req.ats_score,
        "skills": skill_coverage,
        "interview": req.mock_interview_score,
    }

    # Redistribute weight of any missing optional component proportionally
    # across the ones that ARE present.
    present = {k: v for k, v in components.items() if v is not None}
    missing_weight = sum(w for k, w in weights.items() if components[k] is None)
    if missing_weight > 0 and present:
        bump = missing_weight / len(present)
        active_weights = {k: weights[k] + bump for k in present}
    else:
        active_weights = {k: weights[k] for k in present}

    readiness_score = round(sum(present[k] * active_weights[k] for k in present))
    readiness_score = max(0, min(100, readiness_score))

    breakdown = {
        "resume_score": req.resume_score,
        "ats_score": req.ats_score,
        "skill_coverage_pct": round(skill_coverage, 1),
        "mock_interview_score": req.mock_interview_score,
        "weights_used": {k: round(v, 2) for k, v in active_weights.items()},
    }

    user_prompt = (
        f"Readiness score: {readiness_score}/100\n"
        f"Breakdown: {breakdown}\n"
        f"Skills matched: {req.skills_matched}/{req.skills_required}"
    )
    llm_data = ask_claude_json(SYSTEM_PROMPT, user_prompt, max_tokens=500)

    return PlacementScoreResponse(
        readiness_score=readiness_score,
        breakdown=breakdown,
        verdict=llm_data["verdict"],
        top_recommendations=llm_data["top_recommendations"],
    )
