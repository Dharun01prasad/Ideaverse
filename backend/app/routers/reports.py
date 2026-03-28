import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.consultation import MedicalReport
from app.schemas.schemas import MedicalReportCreate, MedicalReportResponse

router = APIRouter()


@router.post("/", response_model=MedicalReportResponse)
def create_report(data: MedicalReportCreate, db: Session = Depends(get_db)):
    report = MedicalReport(
        id=str(uuid.uuid4()),
        consultation_id=data.consultation_id,
        summary=data.summary,
        symptoms=data.symptoms,
        diagnosis=data.diagnosis,
        prescriptions=data.prescriptions,
        follow_up_notes=data.follow_up_notes,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return MedicalReportResponse.model_validate(report)


@router.get("/{consultation_id}", response_model=MedicalReportResponse)
def get_report(consultation_id: str, db: Session = Depends(get_db)):
    report = db.query(MedicalReport).filter(
        MedicalReport.consultation_id == consultation_id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return MedicalReportResponse.model_validate(report)
