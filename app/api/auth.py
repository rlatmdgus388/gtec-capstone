from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.crud import user as crud_user
from app.db.session import get_db
from app.core.security import verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_userid(db, user.user_id)
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    return crud_user.create_user(db, user)

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_userid(db, user.user_id)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful"}