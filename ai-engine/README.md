# AI Engine & Skill Gap Analysis Service (Member 3)

The "AI Brain" of the AI Resume + Placement Assistant. Exposes 5 agent-backed
endpoints that Member 1 (frontend) calls directly, and that Member 5 wires
into the full backend/orchestrator.

## Features → Agents

| Feature | Agent file | Endpoint |
|---|---|---|
| Resume Review | `app/agents/resume_agent.py` | `POST /api/resume-review` |
| Skill Gap Analysis | `app/agents/skill_gap_agent.py` | `POST /api/skill-gap` |
| Placement Readiness Score | `app/agents/placement_score_agent.py` | `POST /api/placement-score` |
| Roadmap Generation | `app/agents/roadmap_agent.py` | `POST /api/roadmap` |
| Chat Assistant | `app/agents/chat_agent.py` | `POST /api/chat` |

All agents share one Claude API wrapper (`app/core/llm_client.py`) so
prompting, JSON parsing, and error handling live in a single place.

## Setup

```bash
cd ai-engine
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then open .env and paste your ANTHROPIC_API_KEY
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

## Example requests

**Skill Gap Analysis**
```bash
curl -X POST http://localhost:8000/api/skill-gap \
  -H "Content-Type: application/json" \
  -d '{
    "current_skills": ["Python", "React", "MySQL"],
    "target_role": "SDE"
  }'
```

**Roadmap Generation**
```bash
curl -X POST http://localhost:8000/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "missing_skills": ["DSA", "SQL", "Git"],
    "target_role": "SDE",
    "weeks": 3,
    "hours_per_week": 10
  }'
```

**Placement Readiness Score**
```bash
curl -X POST http://localhost:8000/api/placement-score \
  -H "Content-Type: application/json" \
  -d '{
    "resume_score": 78,
    "ats_score": 65,
    "skills_matched": 6,
    "skills_required": 10,
    "mock_interview_score": 70
  }'
```

**Chat Assistant**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What should I focus on this week for an SDE role?",
    "history": [],
    "resume_context": "2nd year CSE student, knows Python and React, weak in DSA"
  }'
```

## Integration notes for the team

- **Member 2 (Resume/ATS)**: send parsed `resume_text` into `/api/resume-review`,
  and pass `ats_score` from your module into `/api/placement-score`.
- **Member 4 (Mock Interview)**: pass `mock_interview_score` into
  `/api/placement-score` once interviews are scored.
- **Member 5 (Backend/DB)**: this service is stateless — persist
  `Roadmaps`, `Scores`, and chat `history` in MongoDB and pass relevant
  context back in on each call. Mount this app behind your gateway, or run
  it standalone and reverse-proxy `/api/*` to it.
- **Member 1 (Frontend)**: all endpoints return typed JSON matching the
  Pydantic schemas in `app/models/schemas.py` — see `/docs` for exact shapes.

## Tech stack

- FastAPI
- Anthropic Claude API (`claude-sonnet-5`, configurable via `.env`)
- Pydantic v2
