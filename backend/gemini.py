import json
import re
import urllib.error
import urllib.request
from google import genai
from google.genai import types

from . import config
from . import prompts

_client = None


def _ollama_generate(
    system_prompt: str, user_prompt: str, max_tokens: int, response_format="json"
) -> str:
    output_limit = min(max_tokens, config.OLLAMA_MAX_OUTPUT_TOKENS)
    payload = json.dumps({
        "model": config.OLLAMA_MODEL,
        "prompt": user_prompt,
        "system": system_prompt,
        "stream": False,
        "keep_alive": config.OLLAMA_KEEP_ALIVE,
        "options": {
            "num_predict": output_limit,
            "num_ctx": config.OLLAMA_CONTEXT_TOKENS,
            "temperature": 0.2,
        },
        "format": response_format,
    }).encode("utf-8")
    request = urllib.request.Request(
        f"{config.OLLAMA_URL.rstrip('/')}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError) as exc:
        raise RuntimeError(
            "Ollama is not available. Start Ollama and run "
            f"`ollama pull {config.OLLAMA_MODEL}`."
        ) from exc
    return result.get("response", "").strip()


def _generate(
    system_prompt: str, user_prompt: str, max_tokens: int, response_format="json"
) -> str:
    if config.AI_PROVIDER == "ollama":
        return _ollama_generate(system_prompt, user_prompt, max_tokens, response_format)

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


def get_client():
    global _client
    if _client is None:
        if not config.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file.")
        _client = genai.Client(api_key=config.GEMINI_API_KEY)
    return _client


def _generate_json(
    prompt: str,
    response_format="json",
    system_prompt: str = "Respond with valid JSON only.",
    max_tokens: int = 512,
):
    text = _generate(system_prompt, prompt, max_tokens, response_format)
    cleaned = text.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)


def ask_json(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 3000,
    response_format="json",
) -> dict:
    """Generic system+user call that returns parsed JSON. Used by the ported
    ai-engine agents (resume review, skill gap, placement score, roadmap)."""
    text = _generate(system_prompt, user_prompt, max_tokens, response_format)
    cleaned = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(
            "The AI response was cut off before finishing (likely hit the "
            f"{max_tokens}-token limit). Try shortening the input, or increase "
            "max_tokens for this call. Raw response started with: "
            f"{cleaned[:200]!r}"
        ) from e


def ask_text(system_prompt: str, user_prompt: str, max_tokens: int = 800) -> str:
    """Generic system+user call that returns plain text. Used by the chat agent."""
    return _generate(system_prompt, user_prompt, max_tokens)


def generate_questions(
    company: str,
    role: str,
    num_questions: int,
    focus: str = "Balanced",
    difficulty: str = "Entry level",
) -> list:
    prompt = prompts.question_generation_prompt(company, role, num_questions, focus, difficulty)
    question_schema = {
        "type": "array",
        "minItems": num_questions,
        "maxItems": num_questions,
        "items": {
            "type": "object",
            "properties": {
                "type": {
                    "type": "string",
                    "enum": ["HR", "Technical", "DSA", "Project"],
                },
                "question": {"type": "string"},
            },
            "required": ["type", "question"],
            "additionalProperties": False,
        },
    }
    result = _generate_json(
        prompt,
        response_format=question_schema,
        system_prompt=(
            f"Return a JSON array containing exactly {num_questions} interview questions. "
            "Do not return fewer or more items. Return JSON only."
        ),
        max_tokens=640,
    )
    if (
        not isinstance(result, list)
        or len(result) != num_questions
        or any(
            not isinstance(item, dict)
            or item.get("type") not in {"HR", "Technical", "DSA", "Project"}
            or not isinstance(item.get("question"), str)
            or not item["question"].strip()
            for item in result
        )
    ):
        raise ValueError("The AI did not return a valid interview question list.")

    role_question_bank = {
        "Software Engineer": {
            "Technical": [
                "When would you choose a hash map over a list for a lookup-heavy task, and what trade-offs would you consider?",
                "How would you test a function that parses user input, including boundary cases and invalid data?",
                "What is the difference between a process and a thread, and when might that distinction matter?",
            ],
            "DSA": [
                "Given an array of integers and a target sum, return the indices of two values that add up to the target. Explain your approach and its time and space complexity."
            ],
        },
        "Frontend Developer": {
            "Technical": [
                "In React, what causes a component to re-render, and how would you investigate unnecessary re-renders?",
                "How would you make a form accessible to keyboard and screen-reader users?",
                "How would you handle loading, error, and empty states when a page fetches data from an API?",
            ],
            "DSA": [
                "Given a list of UI item IDs that may contain duplicates, return a list with duplicates removed while preserving the original order. Explain the complexity."
            ],
        },
        "Backend Developer": {
            "Technical": [
                "What makes an HTTP endpoint idempotent, and when is that property useful in an API?",
                "How would you use a database transaction to keep a multi-step update consistent?",
                "How would you prevent an API from returning data a user is not authorized to access?",
            ],
            "DSA": [
                "Given a stream of request IDs, explain how you would detect whether an ID has appeared before and discuss the time and memory trade-off."
            ],
        },
        "Data Analyst": {
            "Technical": [
                "How would you use a SQL join to combine customer and order data without accidentally duplicating rows?",
                "How do NULL values affect SQL filters and aggregates, and how would you handle them in an analysis?",
                "How would you choose a metric to evaluate whether a product change improved user engagement?",
            ],
            "DSA": [
                "Given a list of daily sales values, how would you find the contiguous period with the highest total? Explain a straightforward and a more efficient approach."
            ],
        },
        "AI Engineer": {
            "Technical": [
                "How would you choose evaluation metrics for a text classifier when one class is much rarer than the others?",
                "What are embeddings, and how could they help retrieve relevant documents for a user query?",
                "How would you check an AI feature for incorrect or unsupported answers before releasing it?",
            ],
            "DSA": [
                "Given a list of numeric vectors and one query vector, explain how you would find the closest vector and the time complexity of your approach."
            ],
        },
    }
    generic_bank = {
        "HR": [
            "Tell me about a time you received difficult feedback. How did you respond, and what changed afterward?"
        ],
        "Technical": [
            "How would you debug a feature that works locally but fails in production? Describe the evidence you would gather and the steps you would take."
        ],
        "DSA": [
            "Given a list of integers, explain how you would find the largest value in one pass and state the time and space complexity."
        ],
        "Project": [
            "Walk me through a project or feature you built. What problem did it solve, what was your contribution, and how did you test the result?"
        ],
    }
    role_bank = role_question_bank.get(role, {})

    def fallback_question(question_type: str, index: int) -> dict:
        options = role_bank.get(question_type) or generic_bank[question_type]
        return {"type": question_type, "question": options[index % len(options)]}

    coding_clues = {
        "array", "string", "list", "function", "algorithm", "complexity", "given",
        "input", "return", "sort", "search", "graph", "tree", "hash", "indices",
        "stream", "vector", "values", "integers",
    }
    normalized_questions = []
    for item in result:
        question = item["question"].strip()
        contains_company = bool(
            company and re.search(rf"(?<!\w){re.escape(company)}(?!\w)", question, re.IGNORECASE)
        )
        question_words = set(re.findall(r"[a-z]+", question.lower()))
        if contains_company or (item["type"] == "DSA" and not question_words.intersection(coding_clues)):
            normalized_questions.append(fallback_question(item["type"], len(normalized_questions)))
        else:
            normalized_questions.append({"type": item["type"], "question": question})

    required_by_focus = {
        "Balanced": {"HR": 1, "Technical": 2, "DSA": 1, "Project": 1},
        "Technical deep dive": {"Technical": 4, "DSA": 1, "Project": 1},
        "Behavioral + project": {"HR": 2, "Project": 2, "Technical": 1, "DSA": 1},
    }.get(focus, {"HR": 1, "Technical": 2, "DSA": 1, "Project": 1})
    while sum(required_by_focus.values()) > num_questions:
        category = next((name for name in ("HR", "Project", "Technical", "DSA") if required_by_focus.get(name, 0)), None)
        if category is None:
            break
        required_by_focus[category] -= 1
        if not required_by_focus[category]:
            del required_by_focus[category]

    selected = []
    used_indices = set()
    for question_type, required_count in required_by_focus.items():
        matching = [
            (index, item) for index, item in enumerate(normalized_questions)
            if item["type"] == question_type and index not in used_indices
        ]
        for index, item in matching[:required_count]:
            selected.append(item)
            used_indices.add(index)
        while sum(item["type"] == question_type for item in selected) < required_count:
            selected.append(fallback_question(question_type, len(selected)))

    for index, item in enumerate(normalized_questions):
        if len(selected) >= num_questions:
            break
        if index not in used_indices:
            selected.append(item)
            used_indices.add(index)

    fill_order = ["Technical", "DSA", "Project", "HR"]
    while len(selected) < num_questions:
        question_type = fill_order[len(selected) % len(fill_order)]
        selected.append(fallback_question(question_type, len(selected)))
    return selected[:num_questions]


def evaluate_answer(company: str, role: str, question_type: str, question: str, answer: str) -> dict:
    answer = answer.strip()
    words = re.findall(r"[A-Za-z]+(?:['-][A-Za-z]+)*", answer)
    letters = re.findall(r"[A-Za-z]", answer)
    vowels = sum(character.lower() in "aeiou" for character in letters)
    long_words = [word for word in words if len(word) >= 4]
    words_without_vowels = sum(
        not any(character.lower() in "aeiou" for character in word)
        for word in long_words
    )

    if len(words) < 5 or len(letters) < 20:
        return {
            "accepted": False,
            "score": 0,
            "feedback": "Please give a complete answer with at least five words. Explain your reasoning or give a brief example.",
            "strength": "",
            "weakness": "Your answer is too short to evaluate.",
        }

    if (
        not letters
        or vowels / len(letters) < 0.22
        or (long_words and words_without_vowels / len(long_words) > 0.6)
        or len(set(word.lower() for word in words)) <= 2
    ):
        return {
            "accepted": False,
            "score": 0,
            "feedback": "That response doesn't look like a readable interview answer. Please answer the question in your own words.",
            "strength": "",
            "weakness": "The response was not readable enough to assess.",
        }

    prompt = prompts.answer_evaluation_prompt(company, role, question_type, question, answer)
    answer_schema = {
        "type": "object",
        "properties": {
            "accepted": {"type": "boolean"},
            "relevance_reason": {"type": "string"},
            "score": {"type": "integer", "minimum": 0, "maximum": 10},
            "feedback": {"type": "string"},
            "strength": {"type": "string"},
            "weakness": {"type": "string"},
        },
        "required": [
            "accepted",
            "relevance_reason",
            "score",
            "feedback",
            "strength",
            "weakness",
        ],
        "additionalProperties": False,
    }
    result = _generate_json(prompt, response_format=answer_schema, max_tokens=384)
    if not result.get("accepted", False):
        stop_words = {
            "about", "after", "also", "and", "are", "can", "could", "describe",
            "does", "during", "each", "explain", "from", "have", "help", "into",
            "make", "more", "most", "should", "that", "tell", "than", "them",
            "then", "there", "this", "through", "time", "what", "when", "where",
            "which", "while", "with", "would", "your",
        }
        question_terms = {
            word.lower()
            for word in re.findall(r"[A-Za-z]+", question)
            if len(word) >= 4 and word.lower() not in stop_words
        }
        answer_terms = {
            word.lower()
            for word in re.findall(r"[A-Za-z]+", answer)
            if len(word) >= 4
        }
        on_topic_terms = question_terms & answer_terms
        if len(on_topic_terms) >= 2:
            return {
                "accepted": True,
                "score": 4,
                "feedback": (
                    "Your answer mentions the question's key topic, so it has been accepted. "
                    "Add more detail about your reasoning, steps, and a concrete example to improve your score."
                ),
                "strength": "Addressed key terms from the question",
                "weakness": "Needs more specific reasoning and detail",
            }
        reason = result.get("relevance_reason") or "Your response doesn't answer the interview question."
        return {
            "accepted": False,
            "score": 0,
            "feedback": f"{reason} Please try again with an answer related to the question.",
            "strength": "",
            "weakness": result.get("weakness") or "The answer was not relevant enough to assess.",
        }

    score = result.get("score", 5)
    try:
        score = max(0, min(10, round(float(score))))
    except (TypeError, ValueError):
        score = 5
    return {
        "accepted": True,
        "score": score,
        "feedback": result.get("feedback", ""),
        "strength": result.get("strength", ""),
        "weakness": result.get("weakness", ""),
    }


def generate_report(company: str, role: str, transcript: list) -> dict:
    prompt = prompts.final_report_prompt(company, role, transcript)
    result = _generate_json(prompt, max_tokens=512)
    return {
        "strengths": result.get("strengths", []),
        "weaknesses": result.get("weaknesses", []),
        "recommendations": result.get("recommendations", []),
    }
