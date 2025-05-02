from pydantic import BaseModel

class ExtractToWordbookRequest(BaseModel):
    keyword: str  # 예: "토익", "수능", "편입"