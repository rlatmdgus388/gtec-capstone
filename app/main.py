from fastapi import FastAPI
from app.api import auth, user  # 라우터들
from app.db.init_db import init_db  # 테이블 생성 함수

app = FastAPI()

# 라우터 등록
app.include_router(user.router, prefix="/api/user")
app.include_router(auth.router, prefix="/api/auth")  # prefix 추가하는 걸 추천

# DB 테이블 생성
init_db()  # 내부에서 Base.metadata.create_all 수행
