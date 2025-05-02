from pydantic import BaseModel, model_validator
from datetime import datetime

class UserCreate(BaseModel):
    user_id: str
    password: str
    nickname: str
    password_confirm: str
    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError("비밀번호가 일치하지 않습니다.")
        return self
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