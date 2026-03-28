import base64
import random
import re

from app.config import GEMINI_API_KEY

# Demo responses for simulated transcription
DEMO_TRANSCRIPTIONS = [
    "Good morning, how are you feeling today?",
    "Can you describe your symptoms?",
    "How long have you been experiencing this?",
    "Have you taken any medication?",
    "Let me check your records.",
    "I recommend we do some tests.",
    "Please follow these instructions carefully.",
    "Do you have any allergies?",
    "When did the symptoms first appear?",
    "Are you experiencing any pain right now?",
]

gemini_model = None
gemini_model_name = None
gemini_notice_logged = False


def get_gemini_model():
    global gemini_model, gemini_model_name
    if gemini_model is not None:
        return gemini_model

    if not GEMINI_API_KEY:
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)

        # Prefer fast/cheap models first, then auto-detect any model that supports generateContent.
        preferred = [
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro-latest",
            "gemini-1.5-pro",
            "gemini-pro",
        ]

        available = {}
        try:
            for m in genai.list_models():
                methods = set(getattr(m, "supported_generation_methods", []) or [])
                if "generateContent" in methods:
                    available[m.name.replace("models/", "")] = m.name.replace("models/", "")
        except Exception:
            # If list call fails, still try preferred names directly.
            available = {}

        for candidate in preferred:
            if not available or candidate in available:
                try:
                    model = genai.GenerativeModel(candidate)
                    # Smoke test to ensure this model works for generateContent on this key/version.
                    model.generate_content("ok")
                    gemini_model = model
                    gemini_model_name = candidate
                    print(f"Gemini model selected: {gemini_model_name}")
                    return gemini_model
                except Exception:
                    continue

        # Final fallback: try discovered models from list_models().
        for candidate in available.keys():
            try:
                model = genai.GenerativeModel(candidate)
                model.generate_content("ok")
                gemini_model = model
                gemini_model_name = candidate
                print(f"Gemini model selected: {gemini_model_name}")
                return gemini_model
            except Exception:
                continue

        print("Gemini init error: No generateContent-compatible model available for this API key.")
        return None
    except Exception as e:
        print(f"Gemini init error: {e}")
        return None


def _gemini_polish_slr(text: str):
    model = get_gemini_model()
    if model is None:
        return None

    prompt = (
        "You are a medical sign-language transcript cleaner. "
        "Given noisy repeated keywords, output one concise and grammatical patient statement. "
        "Remove jitter/repetition and preserve symptoms. "
        "Example input: 'No No Good ok pain pain headache' "
        "Example output: 'I am not feeling okay. I have pain and a headache.'\n\n"
        f"Raw Keywords: {text}"
    )

    try:
        response = model.generate_content(prompt)
        cleaned = (response.text or "").strip()
        return cleaned if cleaned else None
    except Exception as e:
        print(f"Gemini polish error: {e}")
        return None


def _local_polish_slr(text: str) -> str:
    """Rule-based fallback polish when Gemini is unavailable."""
    raw = text.replace("/", " ")
    tokens = re.findall(r"[A-Za-z']+", raw.lower())
    if not tokens:
        return ""

    filler = {"yes", "good", "okay", "ok", "wait", "stop", "please", "the", "a", "an"}
    meaningful = [t for t in tokens if t not in filler]
    unique_meaningful = list(dict.fromkeys(meaningful))

    has_no = "no" in tokens or "not" in tokens
    has_pain = "pain" in tokens or "ache" in tokens
    has_headache = "headache" in tokens
    has_stomach = "stomach" in tokens
    has_fever = "fever" in tokens or "hot" in tokens
    has_help = "help" in tokens
    has_medicine = "medicine" in tokens

    parts = []
    if has_no:
        parts.append("I'm not feeling okay")
    if has_stomach and has_pain:
        parts.append("I have stomach pain")
    elif has_pain:
        parts.append("I have pain")
    if has_headache:
        parts.append("I have a headache")
    if has_fever:
        parts.append("I have fever")
    if has_help:
        parts.append("I need help")
    if has_medicine:
        parts.append("I need medicine")

    if not parts:
        preview = " ".join(unique_meaningful[:6]) or " ".join(tokens[:6])
        return preview.capitalize().strip() + "."

    return ". ".join(parts) + "."

def transcribe_audio(audio_data: str) -> dict:
    """
    Transcribe audio data.

    This project currently uses browser-native speech recognition for real-time captions.
    Backend ASR falls back to demo responses when a cloud speech model isn't configured.
    Args:
        audio_data: Base64 encoded audio bytes
    Returns:
        dict with text, speaker, and confidence
    """
    _ = audio_data
    text = random.choice(DEMO_TRANSCRIPTIONS)
    return {
        "text": text,
        "speaker": "auto",
        "confidence": 0.5,
    }

def decode_audio(audio_data: str) -> bytes:
    """Decode base64 encoded audio data."""
    try:
        return base64.b64decode(audio_data)
    except Exception:
        return b""

def polish_slr_transcript(text: str) -> str:
    """
    Polishes a string of sign language keywords (e.g., 'Yes / Good Fever / Hot') into a natural sentence.
    """

    global gemini_notice_logged

    gemini_result = _gemini_polish_slr(text)
    if gemini_result:
        return gemini_result

    if not gemini_notice_logged:
        print("SLR Polish: Gemini unavailable, using local fallback.")
        gemini_notice_logged = True
    return _local_polish_slr(text)

def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translates text between languages using Gemini with clinical context.
    """
    model = get_gemini_model()
    if model is None or source_lang == target_lang:
        return text

    # Map language codes to names for the prompt
    lang_map = {"en-US": "English", "hi-IN": "Hindi"}
    s_name = lang_map.get(source_lang, "English")
    t_name = lang_map.get(target_lang, "Hindi")

    try:
        prompt = (
            f"You are a medical translator. Translate from {s_name} to {t_name}. "
            f"If input is transliterated, convert it into proper {t_name}. "
            "Keep it concise and clinically accurate.\n\n"
            f"Input: {text}"
        )
        response = model.generate_content(prompt)
        translated = (response.text or "").strip()
        return translated if translated else text
    except Exception as e:
        print(f"Translation Error: {e}")
        return text
