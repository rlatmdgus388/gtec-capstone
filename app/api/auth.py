from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.crud import user as crud_user
from app.db.session import get_db
from app.core.security import verify_password
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_userid(db, user.user_id)
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    return crud_user.create_user(db, user)

@router.get("/check-userid")
def check_user_id(user_id: str = Query(...), db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.user_id == user_id).first()
    if exists:
        return {"available": False, "message": "이미 존재하는 아이디입니다."}
    else:
        return {"available": True, "message": "사용 가능한 아이디입니다."}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_userid(db, user.user_id)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful"}