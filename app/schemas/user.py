from pydantic import BaseModel, field_validator
from datetime import datetime

class UserCreate(BaseModel):
    user_id: str
    password: str
    nickname: str
    password_confirm: str
    @field_validator("password_confirm", mode="after")
    @classmethod
    def passwords_match(cls, values):
        if values.password != values.password_confirm:
            raise ValueError("비밀번호가 일치하지 않습니다.")
        return values
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