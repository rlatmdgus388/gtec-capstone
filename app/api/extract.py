import re
import easyocr
from collections import Counter

from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.wordbook import WordbookCreate
from app.crud import wordbook as crud_wordbook
from app.utils.dictionary_api import get_english_meaning

# ✅ 라우터 정의는 위에 위치해야 함
router = APIRouter(prefix="/extract", tags=["Extract"])

# ✅ OCR 초기화
reader = easyocr.Reader(['en'], gpu=False)


@router.post("/preview")
async def preview_words(file: UploadFile = File(...)):
    contents = await file.read()
    with open("temp_img.jpg", "wb") as f:
        f.write(contents)

    results = reader.readtext("temp_img.jpg", detail=0)
    text = " ".join(results).lower()
    words = re.findall(r'\b[a-z]{2,}\b', text)

    # 중복 제거
    unique_words = list(set(w for w in words if len(w) >= 3))

    response_data = []

    for word in unique_words:
        meaning = get_english_meaning(word)
        if meaning:
            response_data.append({
                "word": word,
                "meaning": meaning
            })

    return response_data


@router.post("/words-to-wordbook/")
async def extract_and_create_wordbook(
    file: UploadFile = File(...),
    keyword: str = Form(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Image file only.")

    contents = await file.read()
    with open("temp_img.jpg", "wb") as f:
        f.write(contents)

    results = reader.readtext("temp_img.jpg", detail=0)
    text = " ".join(results).lower()
    words = re.findall(r'\b[a-z]{2,}\b', text)

    if not words:
        return {"message": "No English words found."}

    counts = Counter(words)
    sorted_words = sorted(counts.items(), key=lambda x: x[1], reverse=True)

    # 실제 존재하는 사용자 ID로 대체
    TEMP_USER_ID = "USR20250502001"

    # 단어장 생성
    wordbook = WordbookCreate(
        title=f"{keyword.upper()} 자동 생성 단어장",
        description=f"{keyword} 분석 기반 자동 추출"
    )
    new_wordbook = crud_wordbook.create_wordbook(db, TEMP_USER_ID, wordbook)

    return {
        "message": f"{new_wordbook.title} 생성 완료",
        "wordbook_id": new_wordbook.id,
        "top_words": sorted_words[:10]
    }