from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    user_id: str
    password: str
    nickname: str

class UserLogin(BaseModel):
    user_id: str
    password: str

class UserOut(BaseModel):
    system_id: str         # ✅ 시스템 ID 추가
    user_id: str
    nickname: str
    created_at: datetime   # ✅ 생성일 추가

    class Config:
        from_attributes = True  # ✅ Pydantic v2에서는 orm_mode → from_attributes