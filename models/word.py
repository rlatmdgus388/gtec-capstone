# app/models/word.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String(100), nullable=False)
    meaning = Column(String(255), nullable=False)
    note = Column(String(255), nullable=True)  # ✅ 이 줄이 없으면 오류 발생
    importance = Column(Integer, default=3)
    wordbook_id = Column(Integer, ForeignKey("wordbooks.id"))
    created_at = Column(DateTime, default=datetime.utcnow)


    wordbook = relationship("Wordbook", back_populates="words")

