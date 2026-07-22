from fastapi import APIRouter, HTTPException

from .chat_agent import chat
from .placement_score_agent import compute_placement_score
from .resume_agent import review_resume
from .roadmap_agent import generate_roadmap
from .skill_gap_agent import analyze_skill_gap
from .schemas import (
    ChatRequest,
    ChatResponse,
    PlacementScoreRequest,
    PlacementScoreResponse,
    ResumeReviewRequest,
    ResumeReviewResponse,
    RoadmapRequest,
    RoadmapResponse,
    SkillGapRequest,
    SkillGapResponse,
)

router = APIRouter()


@router.post("/api/resume-review", response_model=ResumeReviewResponse)
def resume_review_endpoint(req: ResumeReviewRequest):
    try:
        return review_resume(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/skill-gap", response_model=SkillGapResponse)
def skill_gap_endpoint(req: SkillGapRequest):
    try:
        return analyze_skill_gap(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/placement-score", response_model=PlacementScoreResponse)
def placement_score_endpoint(req: PlacementScoreRequest):
    try:
        return compute_placement_score(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/roadmap", response_model=RoadmapResponse)
def roadmap_endpoint(req: RoadmapRequest):
    try:
        return generate_roadmap(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    try:
        return chat(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
