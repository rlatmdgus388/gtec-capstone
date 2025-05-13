# app/api/extract.py

import os, re
import easyocr
from collections import Counter

from fastapi import APIRouter, File, UploadFile, HTTPException
from app.utils.dictionary_api import get_english_meaning

router = APIRouter(prefix="/extract", tags=["Extract"])
reader = easyocr.Reader(['en'], gpu=False)

@router.post("/preview")
async def preview_words(file: UploadFile = File(...)):
    contents = await file.read()
    with open("temp_img.jpg", "wb") as f:
        f.write(contents)

    results = reader.readtext("temp_img.jpg", detail=0)
    os.remove("temp_img.jpg")

    text = " ".join(results).lower()
    words = re.findall(r'\b[a-z]{2,}\b', text)

    unique_words = sorted(set(w for w in words if len(w) >= 3))

    response_data = []
    for word in unique_words:
        meaning = get_english_meaning(word)
        if meaning:
            response_data.append({
                "word": word,
                "meaning": meaning
            })

    return response_data
