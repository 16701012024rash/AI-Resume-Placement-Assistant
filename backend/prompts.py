def question_generation_prompt(company: str, role: str, num_questions: int) -> str:
    hr = max(1, round(num_questions * 0.34))
    technical = max(1, round(num_questions * 0.34))
    remaining = max(0, num_questions - hr - technical)
    dsa = max(1, remaining // 2) if remaining > 0 else 1
    project = max(1, remaining - dsa) if remaining > 1 else 1

    return f"""You are an experienced technical interviewer.

Generate exactly {num_questions} interview questions for a {role} interview at {company}.

Include a mix:
- {hr} HR / behavioral questions
- {technical} Technical questions
- {dsa} DSA / problem-solving question(s)
- {project} Project-based question(s)

Return a JSON array only, where each item has this shape:
{{"type": "HR" | "Technical" | "DSA" | "Project", "question": "..."}}
"""


def answer_evaluation_prompt(company: str, role: str, question_type: str, question: str, answer: str) -> str:
    return f"""You are an interviewer evaluating a candidate's answer for a {role} interview at {company}.

Question type: {question_type}
Question: {question}
Candidate's answer: {answer}

Evaluate the answer on:
- Confidence
- Clarity
- Technical knowledge (if applicable)
- Communication
- Grammar

Return a JSON object only, in this shape:
{{
  "score": <integer 0-10>,
  "feedback": "<2-3 sentence constructive feedback>",
  "strength": "<one short strength phrase, or empty string>",
  "weakness": "<one short improvement phrase, or empty string>"
}}
"""


def final_report_prompt(company: str, role: str, transcript: list) -> str:
    import json

    return f"""You are reviewing a completed mock interview transcript for a {role} interview at {company}.

Transcript (question, answer, and score out of 10 for each):
{json.dumps(transcript, ensure_ascii=False)}

Based on the whole interview, return a JSON object only, in this shape:
{{
  "strengths": ["short phrase", "short phrase"],
  "weaknesses": ["short phrase", "short phrase"],
  "recommendations": ["topic or action to focus on", "..."]
}}
"""
