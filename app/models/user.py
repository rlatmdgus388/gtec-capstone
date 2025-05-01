from sqlalchemy import Column, Integer, String
from app.db.session import Base
from sqlalchemy import Column, String, DateTime, Boolean, Integer
from datetime import datetime
class User(Base):
    __tablename__ = "users"

    system_id = Column(String(20), primary_key=True, index=True)  # 예: USR20240501001
    user_id = Column(String(30), unique=True, index=True)
    hashed_password = Column(String(255))
    nickname = Column(String(30))
    created_at = Column(DateTime, default=datetime.utcnow)