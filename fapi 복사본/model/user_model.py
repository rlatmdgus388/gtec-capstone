from sqlalchemy import Column, String, TIMESTAMP
from config.database import Base

class User(Base):
    __tablename__ = "users"

    system_id = Column(String(20), primary_key=True)
    input_id = Column(String(20), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, default=None)
