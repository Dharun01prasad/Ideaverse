from fastapi import APIRouter
from app.schemas.schemas import (
    SLRRequest, SLRResponse,
    ASRRequest, ASRResponse,
    SummarizationRequest, SummarizationResponse,
    TranslationRequest, TranslationResponse,
)
from app.ai.slr import recognize_sign
from app.ai.asr import transcribe_audio
from app.ai.summarizer import summarize_consultation
from app.ai.translator import translate_text

router = APIRouter()


@router.post("/slr", response_model=SLRResponse)
async def sign_language_recognition(request: SLRRequest):
    """Process MediaPipe landmarks and return recognized sign/gesture."""
    result = recognize_sign(request.landmarks)
    return result


@router.post("/asr", response_model=ASRResponse)
async def speech_recognition(request: ASRRequest):
    """Process audio data and return transcribed text."""
    result = transcribe_audio(request.audio_data)
    return result


@router.post("/summarize", response_model=SummarizationResponse)
async def summarize(request: SummarizationRequest):
    """Summarize consultation transcript and extract medical entities."""
    result = summarize_consultation(request.transcript)
    return result


@router.post("/translate", response_model=TranslationResponse)
async def translate(request: TranslationRequest):
    """Translate text to target language."""
    result = translate_text(request.text, request.target_language)
    return result
