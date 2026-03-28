from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, doctors, appointments, consultations, reports, ai, signaling
from app.database import engine, Base

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SignBridge API",
    description="AI-powered telemedicine platform for deaf and hard-of-hearing users",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(doctors.router, prefix="/api/doctors", tags=["Doctors"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(consultations.router, prefix="/api/consultations", tags=["Consultations"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Services"])
app.include_router(signaling.router, prefix="/api/signaling", tags=["Signaling"])


@app.get("/")
def root():
    return {"message": "SignBridge API", "version": "1.0.0", "status": "running"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
