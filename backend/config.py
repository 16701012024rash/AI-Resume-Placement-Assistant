import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "placement_assistant")

NUM_QUESTIONS = int(os.getenv("NUM_QUESTIONS", "6"))

if not GEMINI_API_KEY:
    print(
        "[config] Warning: GEMINI_API_KEY is not set. "
        "Set it in a .env file before starting the server."
    )
