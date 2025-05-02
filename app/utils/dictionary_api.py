import requests
from typing import Optional
from googletrans import Translator

def get_korean_meaning(word: str) -> Optional[str]:
    translator = Translator()
    try:
        result = translator.translate(word, src="en", dest="ko")
        return result.text
    except Exception:
        return None

def get_english_meaning(word: str) -> Optional[str]:
    # 지금은 단어 전체를 한국어로 번역하는 방식으로 변경
    return get_korean_meaning(word)
