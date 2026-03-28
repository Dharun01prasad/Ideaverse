"""
Medical NLP Summarizer Module

Uses BERT-based models for medical text summarization.
Extracts symptoms, diagnosis, and prescriptions from consultation transcripts.

For production:
- Fine-tune on medical conversation datasets (e.g., MTS-Dialog)
- Use Bio-BERT or PubMedBERT for medical entity extraction
- Implement named entity recognition (NER) for medications
"""

from typing import List


def summarize_consultation(transcript: list) -> dict:
    """
    Summarize a medical consultation transcript.

    In production, this would:
    1. Concatenate transcript entries
    2. Run NER to extract medical entities
    3. Generate abstractive summary using fine-tuned BART/T5
    4. Extract structured data (symptoms, diagnosis, prescriptions)

    Args:
        transcript: List of TranscriptEntry objects

    Returns:
        dict with summary, symptoms, diagnosis, and prescriptions
    """
    # Combine transcript text
    full_text = " ".join([
        f"{entry.speaker}: {entry.text}"
        for entry in transcript
    ]) if transcript else ""

    # Demo: return structured summary based on keywords
    symptoms = extract_symptoms(full_text)
    diagnosis = generate_diagnosis(symptoms)
    prescriptions = generate_prescriptions(diagnosis)

    summary = generate_summary(full_text, symptoms, diagnosis)

    return {
        "summary": summary,
        "symptoms": symptoms,
        "diagnosis": diagnosis,
        "prescriptions": prescriptions,
    }


def extract_symptoms(text: str) -> List[str]:
    """
    Extract symptoms from consultation text using NER.

    In production: Use Bio-BERT or a fine-tuned medical NER model.
    """
    symptom_keywords = {
        "headache": "Recurring headaches",
        "pain": "Pain reported",
        "fever": "Elevated temperature / Fever",
        "cough": "Persistent cough",
        "dizzy": "Dizziness",
        "tired": "Fatigue / Tiredness",
        "sleep": "Sleep disturbances",
        "stress": "Elevated stress levels",
        "nausea": "Nausea",
        "breathing": "Breathing difficulties",
    }

    text_lower = text.lower()
    found = []
    for keyword, symptom in symptom_keywords.items():
        if keyword in text_lower:
            found.append(symptom)

    if not found:
        found = ["General discomfort reported", "Further evaluation needed"]

    return found


def generate_diagnosis(symptoms: List[str]) -> str:
    """Generate provisional diagnosis based on extracted symptoms."""
    if any("headache" in s.lower() for s in symptoms):
        return "Tension-type headache, possibly stress-related"
    if any("fever" in s.lower() for s in symptoms):
        return "Possible viral infection, further tests recommended"
    if any("cough" in s.lower() for s in symptoms):
        return "Upper respiratory tract infection"
    return "Preliminary assessment pending further evaluation"


def generate_prescriptions(diagnosis: str) -> List[dict]:
    """Generate prescription recommendations based on diagnosis."""
    prescriptions = []

    if "headache" in diagnosis.lower() or "tension" in diagnosis.lower():
        prescriptions = [
            {
                "medication": "Ibuprofen",
                "dosage": "200mg",
                "frequency": "Every 6-8 hours",
                "duration": "5 days",
                "notes": "Take with food. Do not exceed 3 doses per day."
            },
            {
                "medication": "Lifestyle modifications",
                "dosage": "N/A",
                "frequency": "Daily",
                "duration": "Ongoing",
                "notes": "Regular sleep schedule, stress management, adequate hydration"
            },
        ]
    elif "infection" in diagnosis.lower():
        prescriptions = [
            {
                "medication": "Acetaminophen",
                "dosage": "500mg",
                "frequency": "Every 6 hours",
                "duration": "3-5 days",
                "notes": "For fever and pain management"
            },
        ]
    else:
        prescriptions = [
            {
                "medication": "General consultation follow-up",
                "dosage": "N/A",
                "frequency": "As needed",
                "duration": "1 week",
                "notes": "Schedule follow-up if symptoms persist"
            },
        ]

    return prescriptions


def generate_summary(text: str, symptoms: List[str], diagnosis: str) -> str:
    """Generate a plain-language consultation summary."""
    symptom_text = ", ".join(symptoms[:3]) if symptoms else "general concerns"

    return (
        f"The patient consulted regarding {symptom_text.lower()}. "
        f"After evaluation, the provisional assessment is: {diagnosis}. "
        f"The patient has been provided with treatment recommendations and advised to "
        f"schedule a follow-up appointment if symptoms persist or worsen."
    )
