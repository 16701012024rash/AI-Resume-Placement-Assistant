# Interview prep module — backend

FastAPI + MongoDB + Gemini implementation of the Mock Interview & Company
Preparation module, matching the API shapes from the spec (with `session_id`
added so answers can be tied together and a report can be generated later).

```
interview-module/
├── backend/
│   ├── interview.py     FastAPI app and routes
│   ├── gemini.py        Calls to the Gemini API, returns parsed JSON
│   ├── prompts.py       Prompt templates
│   └── config.py        Reads settings from .env
├── database/
│   └── interview_schema.py   MongoDB schema + data access (Motor, async)
├── requirements.txt
├── .env.example
└── README.md
```

## 1. Prerequisites

- Python 3.10+
- MongoDB running locally (`mongod`), or a connection string to MongoDB Atlas
- A Gemini API key — free tier at https://aistudio.google.com/apikey

## 2. Setup

```bash
cd interview-module
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# then edit .env and paste in your GEMINI_API_KEY,
# and your MONGO_URI if not running Mongo locally on the default port
```

## 3. Run

Make sure MongoDB is running (`mongod` in a separate terminal if local), then:

```bash
uvicorn backend.interview:app --reload
```

The API is now at `http://127.0.0.1:8000`. Interactive docs (Swagger UI) are
at `http://127.0.0.1:8000/docs` — the easiest way to try every endpoint
without writing curl commands.

## 4. Endpoints

### `POST /start-interview`

```json
{ "company": "Amazon", "role": "Software Engineer" }
```

Returns:

```json
{
  "session_id": "b1f2...",
  "questions": [
    { "type": "HR", "question": "Tell me about yourself." },
    { "type": "Technical", "question": "Explain REST API." }
  ]
}
```

### `POST /submit-answer`

```json
{
  "session_id": "b1f2...",
  "question": "Explain REST API.",
  "answer": "REST API is..."
}
```

Returns:

```json
{
  "score": 8,
  "feedback": "Good explanation, but mention statelessness explicitly.",
  "strength": "Clear structure",
  "weakness": "Missed statelessness"
}
```

### `GET /interview-report/{session_id}`

Returns:

```json
{
  "overallScore": 82,
  "strengths": ["Good communication", "Solid REST API understanding"],
  "weaknesses": ["Weak project explanation", "Needs more confidence"],
  "recommendations": ["Operating systems", "DBMS", "SQL", "Trees"]
}
```

Call this only after at least one answer has been submitted for that session.
The first call generates and stores the report; later calls return the saved
one with the score recalculated from the current answers.

## 5. Quick test with curl

```bash
SESSION=$(curl -s -X POST http://127.0.0.1:8000/start-interview \
  -H "Content-Type: application/json" \
  -d '{"company":"Amazon","role":"Software Engineer"}' | python -c "import sys,json;print(json.load(sys.stdin)['session_id'])")

curl -s -X POST http://127.0.0.1:8000/submit-answer \
  -H "Content-Type: application/json" \
  -d "{\"session_id\":\"$SESSION\",\"question\":\"Tell me about yourself.\",\"answer\":\"I am a final year CSE student who has built three full-stack projects.\"}"

curl -s http://127.0.0.1:8000/interview-report/$SESSION
```

## 6. Connecting a frontend

The React files described in the original spec (`InterviewPage.jsx`,
`CompanySelect.jsx`, `ResultPage.jsx`) aren't included here — this delivers
the backend only. To wire up a frontend:

- Point `fetch` calls at `http://127.0.0.1:8000/start-interview`,
  `/submit-answer`, and `/interview-report/{session_id}`.
- Keep the `session_id` returned from `/start-interview` in state and send
  it with every `/submit-answer` call.
- Enable CORS is already handled (`allow_origins=["*"]`) so a local Vite/CRA
  dev server can call this API directly. Tighten this before deploying.

The standalone HTML demo built earlier calls the Claude API directly from
the browser for a no-backend hackathon demo. This backend is the version
that matches the original spec's architecture — swap the demo's fetch calls
for these three endpoints if you want the demo to run through it.

## 7. Notes on what's verified vs. not

- The endpoint logic, MongoDB read/writes, and Gemini call/parse paths have
  been reviewed carefully for correctness, but this hasn't been run against
  a live Gemini key or live MongoDB instance in this environment — you'll
  be the first real run. If `GEMINI_MODEL` in your `.env` is unavailable to
  your key/tier, swap it for another model listed at
  https://ai.google.dev/gemini-api/docs/models.
- `response_mime_type: "application/json"` is used so Gemini returns clean
  JSON without markdown fences, which should make parsing reliable — but
  the code also strips fences defensively in case a model still adds them.
