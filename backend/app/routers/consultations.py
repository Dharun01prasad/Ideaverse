import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.consultation import Consultation, Transcript
from app.schemas.schemas import TranscriptEntry, ConsultationStatus, SummarizationResponse
from app.ai.summarizer import summarize_consultation as summarize_consultation_local

from app.ai.asr import polish_slr_transcript
from pydantic import BaseModel

router = APIRouter()


# Accept JSON body for SLR polish
class SLRPolishRequest(BaseModel):
    text: str

@router.post("/slr-polish")
def polish_slr(request: SLRPolishRequest, db: Session = Depends(get_db)):
    polished = polish_slr_transcript(request.text)
    return {"polished": polished}


@router.post("/translate")
def translate_transcript(text: str, source_lang: str, target_lang: str):
    from app.ai.asr import translate_text
    translated = translate_text(text, source_lang, target_lang)
    return {"translated": translated}


@router.post("/{appointment_id}/start")
def start_consultation(appointment_id: str, db: Session = Depends(get_db)):
    consultation = Consultation(
        id=str(uuid.uuid4()),
        appointment_id=appointment_id,
        status=ConsultationStatus.in_progress.value,
        started_at=datetime.utcnow(),
    )
    db.add(consultation)
    db.commit()
    return {"consultation_id": consultation.id, "status": "in_progress"}


@router.post("/{consultation_id}/join")
def join_consultation(consultation_id: str, role: str = "patient", db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    if role == "doctor":
        consultation.status = ConsultationStatus.doctor_joined.value
    else:
        consultation.status = ConsultationStatus.patient_joined.value

    db.commit()
    return {"status": consultation.status}


@router.post("/{consultation_id}/end")
def end_consultation(consultation_id: str, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    consultation.status = ConsultationStatus.completed.value
    consultation.ended_at = datetime.utcnow()
    db.commit()
    return {"status": "completed"}


@router.post("/{consultation_id}/transcript")
def add_transcript(
    consultation_id: str,
    entry: TranscriptEntry,
    db: Session = Depends(get_db),
):
    transcript = Transcript(
        id=str(uuid.uuid4()),
        consultation_id=consultation_id,
        speaker=entry.speaker,
        text=entry.text,
        timestamp=entry.timestamp,
        source=entry.source,
    )
    db.add(transcript)
    db.commit()
    return {"id": transcript.id, "status": "saved"}


@router.get("/{consultation_id}/transcript")
def get_transcript(consultation_id: str, db: Session = Depends(get_db)):
    entries = db.query(Transcript).filter(
        Transcript.consultation_id == consultation_id
    ).order_by(Transcript.created_at.asc()).all()
    return [{
        "id": e.id,
        "speaker": e.speaker,
        "text": e.text,
        "timestamp": e.timestamp,
        "source": e.source,
    } for e in entries]
 
 
@router.get("/appointment/{appointment_id}")
def get_consultation_by_appointment(appointment_id: str, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(
        Consultation.appointment_id == appointment_id
    ).order_by(Consultation.created_at.desc()).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return {"id": consultation.id, "status": consultation.status}


@router.post("/{consultation_id}/summarize", response_model=SummarizationResponse)
def summarize_consultation(consultation_id: str, db: Session = Depends(get_db)):
    entries = db.query(Transcript).filter(
        Transcript.consultation_id == consultation_id
    ).order_by(Transcript.created_at.asc()).all()
    
    if not entries:
        return {
            "summary": "No consultation data available.",
            "symptoms": [],
            "diagnosis": "Unknown",
            "prescriptions": []
        }

    transcript_payload = [
        {"speaker": e.speaker, "text": e.text}
        for e in entries
    ]
    return summarize_consultation_local(transcript_payload)
