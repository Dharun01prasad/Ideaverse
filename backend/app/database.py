import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:password@localhost:3306/signbridge"
)

# For development/demo, use SQLite fallback if MySQL is not available
SQLITE_URL = "sqlite:///./signbridge.db"

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception:
    print("⚠️  MySQL not available, using SQLite for development")
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
