#api/wordbook/py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.wordbook import WordbookCreate, WordbookOut, WordbookWithWordsCreate
from app.schemas.word import WordCreate
from app.crud.wordbook import (
    create_wordbook,
    get_all_wordbooks,
    create_wordbook_and_words,
    get_wordbook_by_title
)
from app.crud.word import save_words_to_wordbook
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/wordbooks", tags=["Wordbook"])


# ✅ 1. 단어장만 생성
@router.post("/", summary="단어장 생성")
def create_manual_wordbook(
    wordbook_data: WordbookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_wordbook(db, current_user.system_id, wordbook_data)


# ✅ 2. 단어장 생성 + 단어 저장 한 번에
@router.post("/full-create", response_model=WordbookOut)
def create_wordbook_with_words(
    full_data: WordbookWithWordsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_wordbook_and_words(
        db=db,
        user_id=current_user.system_id,
        wordbook_data=full_data,
        word_list=full_data.words
    )


# ✅ 3. 기존 단어장에 단어 추가 (제목 기반)
@router.post("/add-words-by-title", summary="제목으로 단어장 찾아 단어 추가")
def add_words_by_title(
    title: str,
    payload: List[WordCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wordbook = get_wordbook_by_title(db, current_user.system_id, title)
    if not wordbook:
        raise HTTPException(status_code=404, detail="해당 제목의 단어장을 찾을 수 없습니다.")
    
    return save_words_to_wordbook(db, wordbook.id, payload)


# ✅ 4. 단어장 목록 조회
@router.get("/", summary="단어장 목록 조회")
def get_wordbook_list(db: Session = Depends(get_db)):
    return get_all_wordbooks(db)
