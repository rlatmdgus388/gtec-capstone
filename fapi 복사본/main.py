from fastapi import FastAPI
from controller import user_router
from config.database import Base, engine

app = FastAPI()

# DB 테이블 생성 (최초 한 번만)
Base.metadata.create_all(bind=engine)

# 라우터 등록
app.include_router(user_router.router)
