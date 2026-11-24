import logging
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import (
    ConfigurationError,
    OperationFailure,
    PyMongoError,
    ServerSelectionTimeoutError,
)

from pydantic import BaseModel, Field

from . import config
from . import gemini
from . import auth
from . import resume
from . import dashboard
from .ai_engine.router import router as ai_engine_router
from database import interview_schema as db

app = FastAPI(title="AI Resume + Placement Assistant")
logger = logging.getLogger(__name__)

app.include_router(auth.router, tags=["Authentication"])
app.include_router(resume.router, tags=["Resume"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(ai_engine_router, tags=["AI Engine"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request / response models ---------------------------------------------

class StartInterviewRequest(BaseModel):
    company: str
    role: str
    focus: Literal["Balanced", "Technical deep dive", "Behavioral + project"] = "Balanced"
    difficulty: Literal["Entry level", "Intermediate"] = "Entry level"


class StartInterviewResponse(BaseModel):
    session_id: str
    questions: list[dict]


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str = Field(..., min_length=1, max_length=4000)


class SubmitAnswerResponse(BaseModel):
    accepted: bool
    score: int
    feedback: str
    strength: str
    weakness: str


class InterviewReportResponse(BaseModel):
    overallScore: int
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]


# --- Routes ------------------------------------------------------------------

@app.on_event("startup")
async def log_mongodb_configuration():
    logger.info(
        "MongoDB configuration: uri_source=%s uri_scheme=%s database=%s tls=%s "
        "auth_source_fallback=%s server_selection_timeout_ms=%s",
        "environment" if config.MONGO_URI_FROM_ENV else "local_default",
        config.MONGO_URI_SCHEME or "invalid",
        config.MONGO_DB_NAME,
        config.MONGO_TLS_ENABLED,
        bool(config.MONGO_AUTH_SOURCE_OVERRIDE),
        config.MONGO_SERVER_SELECTION_TIMEOUT_MS,
    )


@app.get("/health")
async def health():
    try:
        await db.get_db().command("ping")
    except PyMongoError as exc:
        if isinstance(exc, OperationFailure) and exc.code == 18:
            category = "authentication_failed"
            detail = "MongoDB authentication failed; check the Atlas database user, password encoding, and authSource."
        elif isinstance(exc, OperationFailure) and exc.code == 13:
            category = "authorization_failed"
            detail = f"MongoDB access denied; grant the database user readWrite on {config.MONGO_DB_NAME}."
        elif isinstance(exc, ServerSelectionTimeoutError):
            category = "server_selection_timeout"
            detail = "MongoDB servers were not reachable; check Atlas Network Access, the cluster URI/DNS, and TLS."
        elif isinstance(exc, ConfigurationError):
            category = "invalid_connection_configuration"
            detail = "MongoDB connection configuration is invalid; check the URI scheme and options."
        else:
            category = "mongo_driver_error"
            detail = "MongoDB health check failed; inspect the redacted backend diagnostic log."

        logger.error(
            "MongoDB health ping failed: category=%s exception_type=%s",
            category,
            type(exc).__name__,
        )
        raise HTTPException(status_code=503, detail=detail) from None
    return {"status": "ok", "database": "ok"}


@app.post("/start-interview", response_model=StartInterviewResponse)
async def start_interview(payload: StartInterviewRequest):
    try:
        questions = gemini.generate_questions(
            payload.company,
            payload.role,
            config.NUM_QUESTIONS,
            payload.focus,
            payload.difficulty,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not generate questions: {exc}")

    session_id = await db.create_session(payload.company, payload.role, questions)
    return {"session_id": session_id, "questions": questions}


@app.post("/submit-answer", response_model=SubmitAnswerResponse)
async def submit_answer(payload: SubmitAnswerRequest):
    session = await db.get_session(payload.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Interview session not found")

    matching = next((q for q in session["questions"] if q["question"] == payload.question), None)
    if matching is None:
        raise HTTPException(status_code=400, detail="This question does not belong to the interview session.")
    question_type = matching["type"]

    try:
        result = gemini.evaluate_answer(
            session["company"], session["role"], question_type, payload.question, payload.answer
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not evaluate answer: {exc}")

    if not result["accepted"]:
        return result

    await db.add_answer(
        payload.session_id,
        {
            "question": payload.question,
            "type": question_type,
            "answer": payload.answer,
            "score": result["score"],
            "feedback": result["feedback"],
            "strength": result["strength"],
            "weakness": result["weakness"],
        },
    )
    return result


@app.get("/interview-report/{session_id}", response_model=InterviewReportResponse)
async def interview_report(session_id: str):
    session = await db.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if not session["answers"]:
        raise HTTPException(status_code=400, detail="No answers submitted yet for this session")

    if session.get("report"):
        overall = round(sum(a["score"] for a in session["answers"]) / len(session["answers"]) * 10)
        return {"overallScore": overall, **session["report"]}

    transcript = [
        {"type": a["type"], "question": a["question"], "answer": a["answer"], "score": a["score"]}
        for a in session["answers"]
    ]
    overall = round(sum(a["score"] for a in session["answers"]) / len(session["answers"]) * 10)

    try:
        summary = gemini.generate_report(session["company"], session["role"], transcript)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not generate report: {exc}")

    await db.save_report(session_id, summary)
    return {"overallScore": overall, **summary}
