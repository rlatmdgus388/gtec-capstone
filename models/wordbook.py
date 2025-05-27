from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base


class Wordbook(Base):
    __tablename__ = "wordbooks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    owner_id = Column(String(20), ForeignKey("users.system_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    words = relationship("Word", back_populates="wordbook")

    __table_args__ = (
        UniqueConstraint("owner_id", "title", name="uix_owner_title"),  # ✅ 복합 유니크 제약 조건
    )