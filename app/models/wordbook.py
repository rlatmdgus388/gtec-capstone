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

    # 관계 설정 (단어장.owner → 사용자)
    owner = relationship("User", backref="wordbooks")
