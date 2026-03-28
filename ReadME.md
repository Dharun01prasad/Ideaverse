# SignBridge — AI-Powered Accessible Telemedicine Platform

## Overview
SignBridge is a full-stack telemedicine platform designed to enable seamless communication between doctors and deaf or hard-of-hearing patients.

It bridges the gap between sign language, speech, and text using real-time AI-powered processing.

---

## Key Features

- Role-based authentication (Patient and Doctor)
- Appointment scheduling and management
- Real-time video consultation (WebRTC)
- Live transcript synchronization (WebSocket)
- Sign Language Recognition (SLR) using MediaPipe
- Speech-to-Text (ASR) via browser APIs
- AI-powered transcript cleanup (Gemini with fallback NLP)
- Automated consultation summaries and medical reports

---

## Tech Stack

### Frontend
- React (TypeScript)
- Zustand for state management
- WebRTC for peer-to-peer video
- WebSocket for real-time signaling

### Backend
- FastAPI
- SQLAlchemy ORM
- JWT Authentication
- MySQL (fallback to SQLite)

### AI / Processing
- MediaPipe Holistic (gesture tracking)
- Rule-based SLR token mapping
- Gemini API (text cleanup and translation)
- Rule-based NLP fallback pipeline

---

## How It Works

1. User logs in as Patient or Doctor
2. Patient requests an appointment
3. Doctor approves or rejects the request
4. Both users join the consultation session
5. WebRTC establishes the video connection
6. SLR and ASR generate transcript data
7. AI cleans and structures the medical text
8. Transcript is stored in the database
9. AI generates summary and report

---

## System Architecture

### Layers

- Presentation Layer: React UI (pages and components)
- State Layer: Client stores (authentication, appointments, consultation)
- API Layer: FastAPI routers
- Data Layer: SQLAlchemy models and schemas
- AI Layer: SLR, ASR, summarizer, translator

---

## Setup Instructions

### 1. Clone Repository
```
git clone <repo-url>
cd signbridge
```

### 2. Backend Setup
```
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```
DATABASE_URL=<your_database_url>
GEMINI_API_KEY=<your_api_key>
```

Run backend:
```
uvicorn main:app --reload
```

---

### 3. Frontend Setup
```
cd frontend
npm install
npm run dev
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | MySQL or SQLite connection string |
| GEMINI_API_KEY | API key for AI processing |

---

## Data Flow (Simplified)

Video Input → MediaPipe → Gesture Tokens → AI Cleanup → Final Transcript  
Audio Input → Speech Recognition → Text → AI Cleanup  

---

## Known Limitations

- Heuristic-based SLR instead of deep learning model
- Browser-dependent ASR accuracy
- Some AI modules overlap and can be consolidated
- Minor inconsistencies between documentation and implementation

---

## Future Improvements

- Deep learning-based SLR model
- Multilingual support
- Improved clinical NLP pipeline
- Scalable cloud deployment (e.g., Kubernetes)
- Real-time multilingual translation

---

## Team

Winning Algorithm

---

## License

This project is intended for hackathon and demonstration purposes.

---

## Vision

To make healthcare accessible for everyone, regardless of how they communicate.

