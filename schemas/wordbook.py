from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.word import WordCreate  # ✅ 단어 등록용 스키마 (word, meaning, note, importance 등 포함)

# ✅ 1. 단어장 생성 요청용
class WordbookCreate(BaseModel):
    title: str
    description: Optional[str] = None

# ✅ 2. 단어장 수정 요청용
class WordbookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

# ✅ 3. 단어장 조회 응답용
class WordbookOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    owner_id: str
    created_at: datetime

    class Config:
        from_attributes = True  # ✅ Pydantic v2 기준 (orm_mode 대체)

# ✅ 4. 단어장 + 단어들 한번에 생성 시 요청용
class WordbookWithWordsCreate(WordbookCreate):
    words: List[WordCreate]