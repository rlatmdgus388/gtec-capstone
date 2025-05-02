# app/api/wordbook.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.word import WordCreate
from app.crud.word import save_words_to_wordbook
from app.db.session import get_db

router = APIRouter()

@router.get("/")
def list_wordbooks():
    return {"message": "단어장 목록 조회 API 작동 중"}

@router.post("/{wordbook_id}/words")
def add_words_to_wordbook(
    wordbook_id: int,
    payload: list[WordCreate],
    db: Session = Depends(get_db)
):
    return save_words_to_wordbook(db, wordbook_id, payload)