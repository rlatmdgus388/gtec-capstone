from fastapi import FastAPI
from app.api import auth
from app.models import user
from app.db.session import engine

app = FastAPI()
app.include_router(auth.router)

# DB 테이블 생성
user.Base.metadata.create_all(bind=engine)