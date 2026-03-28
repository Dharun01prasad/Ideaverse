import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext

from app.database import get_db
from app.models.user import User
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=str(uuid.uuid4()),
        name=user_data.name,
        email=user_data.email,
        password_hash=pwd_context.hash(user_data.password),
        role=user_data.role.value,
        phone=user_data.phone,
        specialization=user_data.specialization,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return Token(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == credentials.email,
        User.role == credentials.role.value,
    ).first()

    if not user or not pwd_context.verify(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return Token(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
