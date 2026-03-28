"""
Translation Module

Uses Google Translate API for multilingual accessibility.

For production:
- Use Google Cloud Translation API v3
- Implement caching for frequently translated phrases
- Support medical terminology dictionaries
"""


# Demo translations for common medical phrases
DEMO_TRANSLATIONS = {
    "es": {
        "hello": "Hola",
        "how are you feeling": "¿Cómo se siente?",
        "headache": "dolor de cabeza",
        "prescription": "receta médica",
        "follow up": "seguimiento",
    },
    "fr": {
        "hello": "Bonjour",
        "how are you feeling": "Comment vous sentez-vous?",
        "headache": "mal de tête",
        "prescription": "ordonnance",
        "follow up": "suivi",
    },
    "hi": {
        "hello": "नमस्ते",
        "how are you feeling": "आप कैसा महसूस कर रहे हैं?",
        "headache": "सिरदर्द",
        "prescription": "नुस्खा",
        "follow up": "अनुवर्ती",
    },
}


def translate_text(text: str, target_language: str) -> dict:
    """
    Translate text to target language.

    In production, this would:
    1. Detect source language
    2. Call Google Cloud Translation API
    3. Handle medical terminology specializations
    4. Cache common translations

    Args:
        text: Source text to translate
        target_language: ISO 639-1 language code (e.g., 'es', 'fr', 'hi')

    Returns:
        dict with translated_text, source_language, and target_language
    """
    # Demo: simple keyword-based translation
    translated = text
    lang_dict = DEMO_TRANSLATIONS.get(target_language, {})

    for eng, translated_word in lang_dict.items():
        if eng.lower() in text.lower():
            translated = text.replace(eng, translated_word)
            break

    if translated == text and target_language in DEMO_TRANSLATIONS:
        translated = f"[{target_language.upper()}] {text}"

    return {
        "translated_text": translated,
        "source_language": "en",
        "target_language": target_language,
    }
