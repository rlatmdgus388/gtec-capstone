# app/db/init_db.py
from app.db.session import Base, engine
from app import models  # models/__init__.py에서 모든 모델 import 되게 해둠

def init_db():
    Base.metadata.create_all(bind=engine)
