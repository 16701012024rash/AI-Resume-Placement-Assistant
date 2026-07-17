import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.agents.chat_agent import chat
from app.agents.placement_score_agent import compute_placement_score
from app.agents.resume_agent import review_resume
from app.agents.roadmap_agent import generate_roadmap
from app.agents.skill_gap_agent import analyze_skill_gap
from app.models.schemas import (
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

load_dotenv()

app = FastAPI(
    title="AI Engine & Skill Gap Analysis Service",
    description="Member 3's AI Brain: Resume Review, Skill Gap Analysis, "
    "Placement Readiness Score, Roadmap Generation, Chat Assistant.",
    version="1.0.0",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "ai-engine"}


@app.post("/api/resume-review", response_model=ResumeReviewResponse)
def resume_review_endpoint(req: ResumeReviewRequest):
    try:
        return review_resume(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/skill-gap", response_model=SkillGapResponse)
def skill_gap_endpoint(req: SkillGapRequest):
    try:
        return analyze_skill_gap(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/placement-score", response_model=PlacementScoreResponse)
def placement_score_endpoint(req: PlacementScoreRequest):
    try:
        return compute_placement_score(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/roadmap", response_model=RoadmapResponse)
def roadmap_endpoint(req: RoadmapRequest):
    try:
        return generate_roadmap(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    try:
        return chat(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
