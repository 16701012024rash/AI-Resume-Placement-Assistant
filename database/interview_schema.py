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


def sessions_collection():
    return get_db()["interview_sessions"]


# --- Schema (for reference / validation) ---------------------------------

class Question(BaseModel):
    type: str
    question: str


class AnswerRecord(BaseModel):
    question: str
    type: str
    answer: str
    score: int
    feedback: str
    strength: str = ""
    weakness: str = ""


class InterviewSession(BaseModel):
    session_id: str
    company: str
    role: str
    questions: list[Question]
    answers: list[AnswerRecord] = Field(default_factory=list)
    report: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


# --- Data access -----------------------------------------------------------

async def create_session(company: str, role: str, questions: list[dict]) -> str:
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "session_id": session_id,
        "company": company,
        "role": role,
        "questions": questions,
        "answers": [],
        "report": None,
        "created_at": now,
        "updated_at": now,
    }
    await sessions_collection().insert_one(doc)
    return session_id


async def get_session(session_id: str) -> Optional[dict]:
    return await sessions_collection().find_one({"session_id": session_id}, {"_id": 0})


async def add_answer(session_id: str, answer_record: dict) -> None:
    await sessions_collection().update_one(
        {"session_id": session_id},
        {
            "$push": {"answers": answer_record},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        },
    )


async def save_report(session_id: str, report: dict) -> None:
    await sessions_collection().update_one(
        {"session_id": session_id},
        {
            "$set": {
                "report": report,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
