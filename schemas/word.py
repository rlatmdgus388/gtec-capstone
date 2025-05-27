from pydantic import BaseModel, Field
from typing import Optional

class WordCreate(BaseModel):
    word: str
    meaning: str
    note: Optional[str] = ""
    importance: int = Field(default=3, ge=1, le=5)

class Word(WordCreate):
    id: int
    wordbook_id: int

    class Config:
        orm_mode = True
