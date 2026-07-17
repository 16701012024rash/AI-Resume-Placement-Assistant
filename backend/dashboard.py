from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from . import config
from database import user_schema as user_db
from database import resume_schema as resume_db
from database import interview_schema as interview_db

router = APIRouter()


# --- Response models ---------------------------------------------------------

class DashboardResponse(BaseModel):
    name: str
    resumeUploaded: bool
    interviewsTaken: int
    latestInterviewScore: int
    placementReadiness: int
    atsScore: int


# --- Routes ------------------------------------------------------------------

@router.get("/dashboard/{user_id}", response_model=DashboardResponse)
async def get_dashboard(user_id: str):
    user = await user_db.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    latest_resume = await resume_db.get_latest_resume_for_user(user_id)
    resume_uploaded = latest_resume is not None
    ats_score = latest_resume["ats_score"] if latest_resume else 0
    placement_readiness = latest_resume["placement_score"] if latest_resume else 0

    # TODO: interview_schema.py currently has no lookup by user_id (only by
    # session_id). Add a `get_sessions_by_user(user_id)` helper to
    # database/interview_schema.py so this module can pull real interview
    # history without modifying interview.py itself.
    interviews_taken = 0
    latest_interview_score = 0

    return {
        "name": user["name"],
        "resumeUploaded": resume_uploaded,
        "interviewsTaken": interviews_taken,
        "latestInterviewScore": latest_interview_score,
        "placementReadiness": placement_readiness,
        "atsScore": ats_score,
    }