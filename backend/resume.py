from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from . import config
from database import resume_schema as db

router = APIRouter()


# --- Request / response models ---------------------------------------------

class UploadResumeRequest(BaseModel):
    user_id: str
    filename: str
    # TODO: Replace with actual file upload handling (e.g. UploadFile / multipart)
    # once file storage (S3 / local disk / GridFS) is decided by the team.
    file_url: Optional[str] = None


class UploadResumeResponse(BaseModel):
    resume_id: str
    user_id: str
    filename: str
    upload_date: datetime
    ats_score: int
    placement_score: int


class ResumeRecord(BaseModel):
    resume_id: str
    user_id: str
    filename: str
    upload_date: datetime
    extracted_skills: list[str]
    extracted_projects: list[str]
    ats_score: int
    placement_score: int


class ResumeListResponse(BaseModel):
    resumes: list[ResumeRecord]


class DeleteResumeResponse(BaseModel):
    deleted: bool
    resume_id: str


# --- Routes ------------------------------------------------------------------

@router.post("/upload-resume", response_model=UploadResumeResponse)
async def upload_resume(payload: UploadResumeRequest):
    # TODO: Connect with existing Resume Parser to populate extracted_skills,
    # extracted_projects, ats_score, and placement_score once that module is ready.
    try:
        resume_id = await db.create_resume(
            user_id=payload.user_id,
            filename=payload.filename,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not save resume: {exc}")

    resume = await db.get_resume(resume_id)
    if resume is None:
        raise HTTPException(status_code=500, detail="Resume was saved but could not be retrieved")

    return {
        "resume_id": resume["resume_id"],
        "user_id": resume["user_id"],
        "filename": resume["filename"],
        "upload_date": resume["upload_date"],
        "ats_score": resume["ats_score"],
        "placement_score": resume["placement_score"],
    }


@router.get("/resume/{user_id}", response_model=ResumeListResponse)
async def get_resumes_for_user(user_id: str):
    resumes = await db.get_resumes_by_user(user_id)
    if not resumes:
        raise HTTPException(status_code=404, detail="No resumes found for this user")
    return {"resumes": resumes}


@router.delete("/resume/{resume_id}", response_model=DeleteResumeResponse)
async def delete_resume(resume_id: str):
    resume = await db.get_resume(resume_id)
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")

    await db.delete_resume(resume_id)
    return {"deleted": True, "resume_id": resume_id}