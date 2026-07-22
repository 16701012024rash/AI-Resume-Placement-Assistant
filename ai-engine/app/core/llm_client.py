"""
Thin wrapper around the Google Gemini API.

Every agent in this service calls `ask_claude_json()` so we only have
retry / parsing / error-handling logic in ONE place. Function names are
kept as `ask_claude` / `ask_claude_json` so none of the agent files needed
to change when this was swapped from Claude to Gemini (same signatures,
same return shapes) — only this file's internals changed.
"""

import json
import os
import re

from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if not API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Copy .env.example to .env and add your key "
        "(free key: https://aistudio.google.com/apikey)."
    )

client = genai.Client(api_key=API_KEY)


def _strip_code_fences(text: str) -> str:
    """Gemini sometimes wraps JSON in ```json ... ``` even when told not to."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def ask_claude(system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> str:
    """Plain text call. Used by the chat agent for conversational replies."""
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=max_tokens,
            ),
        )
        return response.text or ""
    except Exception as e:
        raise RuntimeError(f"Gemini API error: {e}") from e


def ask_claude_json(system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> dict:
    """
    Call Gemini and force a JSON-only response.
    Appends a hard instruction to the system prompt so the model
    doesn't add preamble, and safely parses the result.
    """
    strict_system = (
        system_prompt
        + "\n\nCRITICAL: Respond with ONLY valid JSON. No preamble, no markdown "
        "code fences, no explanation before or after the JSON object."
    )
    raw = ask_claude(strict_system, user_prompt, max_tokens=max_tokens)
    cleaned = _strip_code_fences(raw)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback: try to grab the first {...} block in case the model
        # still added stray text around the JSON.
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Gemini did not return valid JSON. Raw response:\n{raw}")
