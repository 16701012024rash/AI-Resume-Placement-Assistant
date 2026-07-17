from app.core.llm_client import ask_claude
from app.models.schemas import ChatRequest, ChatResponse

SYSTEM_PROMPT = """You are the Chat Assistant inside an AI Resume + Placement
Assistant. You help students with placement prep, resume advice, interview
questions, and career guidance. Be concise, encouraging but honest, and give
concrete, actionable advice. If the user shares resume/skill context, use it
to personalize your answers. Keep replies under ~150 words unless the user
asks for something long-form (e.g. "write me a full cover letter")."""


def chat(req: ChatRequest) -> ChatResponse:
    context_block = f"\n\n[Student context: {req.resume_context}]" if req.resume_context else ""

    # Flatten history into a single prompt since we're keeping this stateless
    # (no server-side session store) -- the frontend/backend-lead's DB can
    # persist `history` per user and replay it here each call.
    convo = ""
    for turn in req.history:
        prefix = "Student" if turn.role == "user" else "Assistant"
        convo += f"{prefix}: {turn.content}\n"
    convo += f"Student: {req.message}"

    reply = ask_claude(SYSTEM_PROMPT + context_block, convo, max_tokens=800)
    return ChatResponse(reply=reply.strip())
