from pydantic import BaseModel
from app.utils.word_filter import filter_important_words

class ExtractToWordbookRequest(BaseModel):
    keyword: str  # 예: "토익", "수능", "편입"

