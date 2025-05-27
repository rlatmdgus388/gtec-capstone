# app/utils/dictionary_api.py

from typing import Optional
from googletrans import Translator

translator = Translator()  # ✅ 전역에서 Translator 한 번만 생성

def get_korean_meaning(word: str) -> Optional[str]:
    try:
        result = translator.translate(word, src="en", dest="ko")
        return result.text
    except Exception:
        return None

def get_english_meaning(word: str) -> Optional[str]:
    # 지금은 단어 전체를 한국어로 번역하는 방식
    return get_korean_meaning(word)