import os
from pathlib import Path

from dotenv import load_dotenv


# Load backend/.env if present so local development picks up API keys.
load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "signbridge-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")
TRANSLATE_API_KEY = os.getenv("GOOGLE_TRANSLATE_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
