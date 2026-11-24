import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama").strip().lower()
APP_ENV = os.getenv("APP_ENV", "development").strip().lower()

if AI_PROVIDER not in {"ollama", "gemini"}:
    raise ValueError("AI_PROVIDER must be either 'ollama' or 'gemini'.")
if AI_PROVIDER == "gemini" and not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is required when AI_PROVIDER=gemini.")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-insecure-secret-change-me")
if APP_ENV == "production" and not os.getenv("JWT_SECRET"):
    raise RuntimeError("JWT_SECRET is required when APP_ENV=production.")
if APP_ENV == "production" and not os.getenv("MONGO_URI"):
    raise RuntimeError("MONGO_URI is required when APP_ENV=production.")
if APP_ENV == "production" and not os.getenv("CORS_ORIGINS"):
    raise RuntimeError("CORS_ORIGINS is required when APP_ENV=production.")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b")
OLLAMA_KEEP_ALIVE = os.getenv("OLLAMA_KEEP_ALIVE", "15m")
OLLAMA_MAX_OUTPUT_TOKENS = int(os.getenv("OLLAMA_MAX_OUTPUT_TOKENS", "1024"))
OLLAMA_CONTEXT_TOKENS = int(os.getenv("OLLAMA_CONTEXT_TOKENS", "2048"))

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "placement_assistant")
MONGO_SERVER_SELECTION_TIMEOUT_MS = int(os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "10000"))
MONGO_CONNECT_TIMEOUT_MS = int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "10000"))

CORS_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

NUM_QUESTIONS = int(os.getenv("NUM_QUESTIONS", "6"))
