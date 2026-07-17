import uuid
from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

from backend import config

_mongo_client: Optional[AsyncIOMotorClient] = None


def get_db():
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = AsyncIOMotorClient(config.MONGO_URI)
    return _mongo_client[config.MONGO_DB_NAME]


def users_collection():
    return get_db()["users"]


# --- Schema (for reference / validation) -----------------------------------

class User(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    password_hash: str
    college: Optional[str] = None
    target_role: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# --- Data access -------------------------------------------------------------

async def create_user(
    name: str,
    email: str,
    password_hash: str,
    college: Optional[str] = None,
    target_role: Optional[str] = None,
) -> str:
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "college": college,
        "target_role": target_role,
        "created_at": now,
        "updated_at": now,
    }
    await users_collection().insert_one(doc)
    return user_id


async def get_user_by_email(email: str) -> Optional[dict]:
    return await users_collection().find_one({"email": email}, {"_id": 0})


async def get_user_by_id(user_id: str) -> Optional[dict]:
    return await users_collection().find_one({"user_id": user_id}, {"_id": 0})


async def update_user_profile(user_id: str, updates: dict) -> None:
    updates["updated_at"] = datetime.now(timezone.utc)
    await users_collection().update_one(
        {"user_id": user_id},
        {"$set": updates},
    )