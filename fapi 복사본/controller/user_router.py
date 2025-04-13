from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from model.user_model import User
from config.database import SessionLocal
from passlib.context import CryptContext
from datetime import datetime

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_system_id(db: Session):
    today = datetime.now().strftime("%Y%m%d")
    prefix = "USR" + today

    last_user = (
        db.query(User)
        .filter(User.system_id.like(f"{prefix}%"))
        .order_by(User.system_id.desc())
        .first()
    )

    if last_user:
        last_number = int(last_user.system_id[-3:])
        new_number = f"{last_number + 1:03}"
    else:
        new_number = "001"

    return prefix + new_number

@router.post("/register")
def register_user(input_id: str, email: str, password: str, db: Session = Depends(get_db)):
    # 중복 검사
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 비밀번호 암호화
    hashed_password = pwd_context.hash(password)

    # system_id 생성
    system_id = generate_system_id(db)

    new_user = User(
        system_id=system_id,
        input_id=input_id,
        email=email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"msg": "User registered successfully", "system_id": system_id}
