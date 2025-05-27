# app/api/extract.py
import os
import re
import easyocr
import nltk
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.utils.word_filter import filter_important_words
from app.utils.dictionary_api import get_english_meaning
from app.schemas.word import WordCreate
from app.crud.word import save_words_to_wordbook
from app.utils.dictionary_api import get_korean_meaning
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.wordbook import Wordbook


router = APIRouter(prefix="/extract", tags=["Extract"])
reader = easyocr.Reader(['en'], gpu=False)

# 사용자 지정 nltk 데이터 경로 설정
nltk.data.path.append("/Users/kimjeongmin/nltk_data")

@router.post("/filtered-preview")
async def extract_filtered_words(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="이미지 파일만 허용됩니다.")

    contents = await file.read()
    with open("temp_img.jpg", "wb") as f:
        f.write(contents)

    try:
        results = reader.readtext("temp_img.jpg", detail=0)
        text = " ".join(results).lower()
        words = re.findall(r'\b[a-z]{2,}\b', text)

        # 의미 있는 단어만 필터링
        filtered_words = filter_important_words(words)
        word_meanings = [
        {"word": w, "meaning": get_korean_meaning(w)} for w in filtered_words
        ]
        return JSONResponse(content={"filtered_words": word_meanings})

    finally:
        os.remove("temp_img.jpg")
    
@router.post("/save-to-wordbook")
async def extract_and_save(
    title: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="이미지 파일만 허용됩니다.")

    # 🔍 단어장 찾기
    wordbook = db.query(Wordbook).filter_by(owner_id=current_user.system_id, title=title).first()
    if not wordbook:
        raise HTTPException(status_code=404, detail="해당 제목의 단어장을 찾을 수 없습니다.")

    contents = await file.read()
    with open("temp_img.jpg", "wb") as f:
        f.write(contents)

    try:
        results = reader.readtext("temp_img.jpg", detail=0)
        text = " ".join(results).lower()
        words = re.findall(r'\b[a-z]{2,}\b', text)
        filtered_words = filter_important_words(words)

        word_objs = []
        for word in filtered_words:
            meaning = get_korean_meaning(word)
            if meaning:
                word_objs.append(WordCreate(
                    word=word,
                    meaning=meaning,
                    note="",
                    importance=3
                ))

        return save_words_to_wordbook(db, wordbook.id, word_objs)

    finally:
        os.remove("temp_img.jpg")