"""
Thin wrapper around the Anthropic Claude API.

Every agent in this service calls `ask_claude_json()` so we only have
retry / parsing / error-handling logic in ONE place.
"""

import json
import os
import re

from anthropic import Anthropic, APIError
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-5")

if not API_KEY:
    raise RuntimeError(
        "ANTHROPIC_API_KEY is missing. Copy .env.example to .env and add your key."
    )

client = Anthropic(api_key=API_KEY)


def _strip_code_fences(text: str) -> str:
    """Claude sometimes wraps JSON in ```json ... ``` even when told not to."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def ask_claude(system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> str:
    """Plain text call. Used by the chat agent for conversational replies."""
    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return response.content[0].text
    except APIError as e:
        raise RuntimeError(f"Claude API error: {e}") from e


def ask_claude_json(system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> dict:
    """
    Call Claude and force a JSON-only response.
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
        raise ValueError(f"Claude did not return valid JSON. Raw response:\n{raw}")
