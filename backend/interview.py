from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import config
from . import gemini
from . import auth
from . import resume
from . import dashboard
from .ai_engine.router import router as ai_engine_router
from database import interview_schema as db

app = FastAPI(title="AI Resume + Placement Assistant")

app.include_router(auth.router, tags=["Authentication"])
app.include_router(resume.router, tags=["Resume"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(ai_engine_router, tags=["AI Engine"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request / response models ---------------------------------------------

class StartInterviewRequest(BaseModel):
    company: str
    role: str


class StartInterviewResponse(BaseModel):
    session_id: str
    questions: list[dict]


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str


class SubmitAnswerResponse(BaseModel):
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

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/start-interview", response_model=StartInterviewResponse)
async def start_interview(payload: StartInterviewRequest):
    try:
        questions = gemini.generate_questions(payload.company, payload.role, config.NUM_QUESTIONS)
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
    question_type = matching["type"] if matching else "General"

    try:
        result = gemini.evaluate_answer(
            session["company"], session["role"], question_type, payload.question, payload.answer
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not evaluate answer: {exc}")

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
