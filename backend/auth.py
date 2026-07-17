import re
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field, field_validator

from . import config
from database import user_schema as db

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# TODO: Add JWT_SECRET in config.py (e.g. JWT_SECRET = os.getenv("JWT_SECRET", ""))
# TODO: Add JWT_ALGORITHM in config.py (default "HS256")
# TODO: Add JWT_EXPIRE_MINUTES in config.py (default 1440)
JWT_SECRET = getattr(config, "JWT_SECRET", "dev-insecure-secret-change-me")
JWT_ALGORITHM = getattr(config, "JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = getattr(config, "JWT_EXPIRE_MINUTES", 1440)


# --- Request / response models ---------------------------------------------

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)
    college: Optional[str] = None
    target_role: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if not re.search(r"[A-Za-z]", value) or not re.search(r"[0-9]", value):
            raise ValueError("Password must contain at least one letter and one number")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    college: Optional[str] = None
    target_role: Optional[str] = None


class SignupResponse(BaseModel):
    user: UserPublic
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    user: UserPublic
    access_token: str
    token_type: str = "bearer"


# --- Helpers -----------------------------------------------------------------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")


# --- Routes ------------------------------------------------------------------

@router.post("/signup", response_model=SignupResponse)
async def signup(payload: SignupRequest):
    existing_user = await db.get_user_by_email(payload.email)
    if existing_user is not None:
        raise HTTPException(status_code=409, detail="Email is already registered")

    password_hash = hash_password(payload.password)

    try:
        user_id = await db.create_user(
            name=payload.name,
            email=payload.email,
            password_hash=password_hash,
            college=payload.college,
            target_role=payload.target_role,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not create user: {exc}")

    token = create_access_token(user_id, payload.email)
    return {
        "user": {
            "user_id": user_id,
            "name": payload.name,
            "email": payload.email,
            "college": payload.college,
            "target_role": payload.target_role,
        },
        "access_token": token,
    }


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    user = await db.get_user_by_email(payload.email)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user["user_id"], user["email"])
    return {
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "college": user.get("college"),
            "target_role": user.get("target_role"),
        },
        "access_token": token,
    }