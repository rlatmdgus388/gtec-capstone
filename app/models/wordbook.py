from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Wordbook(Base):
    __tablename__ = "wordbooks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    owner_id = Column(String(20), ForeignKey("users.system_id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # 사용자와의 관계
    owner = relationship("User", backref="wordbooks")

    # ✅ 단어(word)와의 관계 추가
    words = relationship("Word", back_populates="wordbook", cascade="all, delete")
