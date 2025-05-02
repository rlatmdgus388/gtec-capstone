from sqlalchemy.orm import Session
from app.models.wordbook import Wordbook
from app.schemas.wordbook import WordbookCreate, WordbookUpdate

def create_wordbook(db: Session, user_id: str, wordbook: WordbookCreate):
    db_wordbook = Wordbook(
        title=wordbook.title,
        description=wordbook.description,
        owner_id=user_id
    )
    db.add(db_wordbook)
    db.commit()
    db.refresh(db_wordbook)
    return db_wordbook
