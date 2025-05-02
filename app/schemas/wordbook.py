from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# 단어장 생성 요청에 사용할 모델
class WordbookCreate(BaseModel):
    title: str
    description: Optional[str] = None

# 단어장 수정 요청 시 사용할 모델
class WordbookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

# 단어장 조회 응답에 사용할 모델
class WordbookOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    owner_id: str
    created_at: datetime

    class Config:
        from_attributes = True  # ✅ Pydantic v2 기준 (orm_mode 대체)