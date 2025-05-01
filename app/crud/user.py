from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password
from app.schemas.user import UserCreate

# ✅ 사용자 고유 ID 생성 함수
def generate_user_system_id(db: Session) -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    prefix = "USR"
    today_count = db.query(User).filter(User.system_id.like(f"{prefix}{today}%")).count()
    sequence = f"{today_count + 1:03d}"
    return f"{prefix}{today}{sequence}"

# ✅ 회원가입 함수
def create_user(db: Session, user: UserCreate):
    system_id = generate_user_system_id(db)
    db_user = User(
        system_id=system_id,
        user_id=user.user_id,
        hashed_password=hash_password(user.password),
        nickname=user.nickname
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_userid(db: Session, user_id: str):
    return db.query(User).filter(User.user_id == user_id).first()
