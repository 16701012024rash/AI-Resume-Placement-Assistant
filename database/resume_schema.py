import uuid
from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

from backend import config

_mongo_client: Optional[AsyncIOMotorClient] = None


def get_db():
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = AsyncIOMotorClient(config.MONGO_URI)
    return _mongo_client[config.MONGO_DB_NAME]


def resumes_collection():
    return get_db()["resumes"]


# --- Schema (for reference / validation) -----------------------------------

class Resume(BaseModel):
    resume_id: str
    user_id: str
    filename: str
    upload_date: datetime
    extracted_skills: list[str] = Field(default_factory=list)
    extracted_projects: list[str] = Field(default_factory=list)
    ats_score: int = 0
    placement_score: int = 0


# --- Data access -------------------------------------------------------------

async def create_resume(user_id: str, filename: str) -> str:
    resume_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "resume_id": resume_id,
        "user_id": user_id,
        "filename": filename,
        "upload_date": now,
        # TODO: Connect with existing Resume Parser to populate these fields
        "extracted_skills": [],
        "extracted_projects": [],
        "ats_score": 0,
        "placement_score": 0,
    }
    await resumes_collection().insert_one(doc)
    return resume_id


async def get_resume(resume_id: str) -> Optional[dict]:
    return await resumes_collection().find_one({"resume_id": resume_id}, {"_id": 0})


async def get_resumes_by_user(user_id: str) -> list[dict]:
    cursor = resumes_collection().find({"user_id": user_id}, {"_id": 0})
    return await cursor.to_list(length=None)


async def get_latest_resume_for_user(user_id: str) -> Optional[dict]:
    cursor = (
        resumes_collection()
        .find({"user_id": user_id}, {"_id": 0})
        .sort("upload_date", -1)
        .limit(1)
    )
    results = await cursor.to_list(length=1)
    return results[0] if results else None


async def update_resume_scores(
    resume_id: str,
    extracted_skills: Optional[list[str]] = None,
    extracted_projects: Optional[list[str]] = None,
    ats_score: Optional[int] = None,
    placement_score: Optional[int] = None,
) -> None:
    # TODO: Called by the future Resume Parser module once implemented
    updates = {}
    if extracted_skills is not None:
        updates["extracted_skills"] = extracted_skills
    if extracted_projects is not None:
        updates["extracted_projects"] = extracted_projects
    if ats_score is not None:
        updates["ats_score"] = ats_score
    if placement_score is not None:
        updates["placement_score"] = placement_score

    if updates:
        await resumes_collection().update_one(
            {"resume_id": resume_id},
            {"$set": updates},
        )


async def delete_resume(resume_id: str) -> None:
    await resumes_collection().delete_one({"resume_id": resume_id})