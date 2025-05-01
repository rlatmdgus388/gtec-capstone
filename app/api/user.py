# app/api/user.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

@router.get("/check-username")
def check_username(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if user:
        raise HTTPException(status_code=409, detail="이미 사용 중인 아이디입니다.")
    return {"message": "사용 가능한 아이디입니다."}
