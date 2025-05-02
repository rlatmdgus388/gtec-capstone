from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.session import Base

class Word(Base):
    __tablename__ = "words"
    id = Column(Integer, primary_key=True, index=True)
    wordbook_id = Column(Integer, ForeignKey("wordbooks.id"))
    word = Column(String(50), nullable=False)
    meaning = Column(String(255), nullable=False)
