import json
from google import genai
from google.genai import types

from . import config
from . import prompts

_client = None


def get_client():
    global _client
    if _client is None:
        if not config.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file.")
        _client = genai.Client(api_key=config.GEMINI_API_KEY)
    return _client


def _generate_json(prompt: str):
    client = get_client()
    response = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    text = response.text or ""
    cleaned = text.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)


def ask_json(system_prompt: str, user_prompt: str, max_tokens: int = 3000) -> dict:
    """Generic system+user call that returns parsed JSON. Used by the ported
    ai-engine agents (resume review, skill gap, placement score, roadmap)."""
    client = get_client()
    response = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            max_output_tokens=max_tokens,
        ),
    )
    text = response.text or ""
    cleaned = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(
            "Gemini's response was cut off before finishing (likely hit the "
            f"{max_tokens}-token limit). Try shortening the input, or increase "
            "max_tokens for this call. Raw response started with: "
            f"{cleaned[:200]!r}"
        ) from e


def ask_text(system_prompt: str, user_prompt: str, max_tokens: int = 800) -> str:
    """Generic system+user call that returns plain text. Used by the chat agent."""
    client = get_client()
    response = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=max_tokens,
        ),
    )
    return (response.text or "").strip()


def generate_questions(company: str, role: str, num_questions: int) -> list:
    prompt = prompts.question_generation_prompt(company, role, num_questions)
    result = _generate_json(prompt)
    if not isinstance(result, list) or len(result) == 0:
        raise ValueError("Gemini did not return a valid question list")
    return result


def evaluate_answer(company: str, role: str, question_type: str, question: str, answer: str) -> dict:
    prompt = prompts.answer_evaluation_prompt(company, role, question_type, question, answer)
    result = _generate_json(prompt)
    score = result.get("score", 5)
    try:
        score = max(0, min(10, round(float(score))))
    except (TypeError, ValueError):
        score = 5
    return {
        "score": score,
        "feedback": result.get("feedback", ""),
        "strength": result.get("strength", ""),
        "weakness": result.get("weakness", ""),
    }


def generate_report(company: str, role: str, transcript: list) -> dict:
    prompt = prompts.final_report_prompt(company, role, transcript)
    result = _generate_json(prompt)
    return {
        "strengths": result.get("strengths", []),
        "weaknesses": result.get("weaknesses", []),
        "recommendations": result.get("recommendations", []),
    }
