def question_generation_prompt(
    company: str,
    role: str,
    num_questions: int,
    focus: str = "Balanced",
    difficulty: str = "Entry level",
) -> str:
    focus_guidance = {
        "Balanced": (
            "Include at least two role-specific technical questions, one DSA/problem-solving "
            "question, one project question, and one behavioral/HR question."
        ),
        "Technical deep dive": (
            "Make most questions technical: include at least three role-specific technical "
            "questions, one DSA/problem-solving question, and one project question. Include "
            "at least one question that asks the candidate to explain a technical trade-off."
        ),
        "Behavioral + project": (
            "Include at least two behavioral/HR questions and two project questions, while "
            "also including at least one role-specific technical question and one "
            "DSA/problem-solving question."
        ),
    }.get(focus, "Use a balanced mix of technical, problem-solving, project, and behavioral questions.")
    role_topics = {
        "Software Engineer": "data structures and algorithms, object-oriented design, debugging, APIs, databases, and testing",
        "Frontend Developer": "JavaScript, React, browser rendering, accessibility, responsive UI, state, and API integration",
        "Backend Developer": "API design, HTTP, databases, transactions, caching, authentication, and service reliability",
        "Data Analyst": "SQL, data cleaning, exploratory analysis, metrics, visualization, and experiment interpretation",
        "AI Engineer": "Python, model evaluation, embeddings, retrieval, data pipelines, and responsible AI",
    }.get(role, "programming fundamentals, data structures, APIs, databases, debugging, and testing")
    return f"""You are an experienced technical interviewer.

Generate exactly {num_questions} interview questions for a {difficulty} candidate interviewing
for {role} at {company}.

Interview focus: {focus}
{focus_guidance}
Questions must be clear, realistic, varied, and specific to the role. Technical questions must
test practical understanding, not just definitions. For this role, use topics such as: {role_topics}.
Keep difficulty appropriate to the candidate. Do not assume the candidate has experience at the
company; do not ask about building that company's products.

Type requirements:
- Technical: ask about a concrete concept or implementation relevant to the role, not a generic
  behavioral question or abstract system-design prompt.
- DSA: ask a genuine coding/problem-solving question with a clear input or scenario, and invite
  the candidate to explain the approach and time/space complexity.
- Project: ask how the candidate designed, built, tested, or improved a project or feature.
- HR: ask a behavioral question that can be answered with a real example.

Use only these question types: HR, Technical, DSA, Project. The requested counts are minimums;
never exceed {num_questions} total questions. Check that each question matches its assigned type.

Return a JSON array only, where each item has this shape:
{{"type": "HR" | "Technical" | "DSA" | "Project", "question": "..."}}
"""


def answer_evaluation_prompt(company: str, role: str, question_type: str, question: str, answer: str) -> str:
    return f"""You are an interviewer evaluating a candidate's answer for a {role} interview at {company}.

Question type: {question_type}
Question: {question}
Candidate's answer: {answer}

First decide whether the candidate made a readable attempt at the question's main topic.
Set "accepted" to false only for gibberish, an unrelated response, or no genuine attempt.
Do not reject an on-topic answer because it is concise, imperfect, uses different terminology, or needs more detail.
A partly correct or shallow answer is still accepted and should receive a low score with specific feedback.
For example, an answer that explains showing a loading state and handling a failed API request is relevant to a
question about loading and errors in a React page, even if it omits implementation details.
For a rejected answer, give a short relevance_reason explaining what the question asks and invite a retry.
Set score to 0 and leave strength empty only when the answer is rejected.

For an accepted answer, assess correctness and reasoning for the question type, then clarity and communication.
For behavioral answers, look for a concrete situation, the candidate's action, and a result; do not require
those exact labels. For technical/DSA answers, check whether the explanation addresses the asked concept/problem.
Give a fair score: 0-2 no meaningful attempt, 3-4 major gaps, 5-6 partial/correct but shallow, 7-8 solid,
9-10 correct, clear, and well-reasoned. Keep feedback specific to the candidate's actual answer.

Return JSON only, in this shape:
{{
  "accepted": <boolean>,
  "relevance_reason": "<short explanation when rejected; otherwise empty string>",
  "score": <integer 0-10>,
  "feedback": "<specific constructive feedback>",
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
  "strengths": ["specific observed strength", "specific observed strength"],
  "weaknesses": ["specific improvement area", "specific improvement area"],
  "recommendations": ["concrete practice action with a topic", "concrete practice action"]
}}
Base every point on the transcript and scores. Avoid generic advice, invented candidate
experience, and repeating the same point in multiple lists. Keep recommendations actionable.
"""
