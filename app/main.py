from fastapi import FastAPI
from app.api import auth, extract, wordbook  # 라우터들
from app.db.init_db import init_db  # 테이블 생성 함수
from app.models import user
from app.models import wordbook as wordbook_model
from app.db.session import engine
from app.models import word as word_model

user.Base.metadata.create_all(bind=engine)
wordbook_model.Base.metadata.create_all(bind=engine)
word_model.Base.metadata.create_all(bind=engine)

app = FastAPI()
# 라우터 등록
app.include_router(auth.router, prefix="/api/auth")
app.include_router(extract.router, prefix="/api/extract")
app.include_router(wordbook.router, prefix="/api/wordbooks")

