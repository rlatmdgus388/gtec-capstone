from sqlalchemy.orm import Session
from app.models.wordbook import Wordbook
from app.schemas.wordbook import WordbookCreate, WordbookUpdate
from app.models.word import Word
from app.schemas.word import WordCreate
from datetime import datetime

def create_wordbook(db: Session, user_id: str, wordbook: WordbookCreate):
    new_wordbook = Wordbook(
        title=wordbook.title,
        description=wordbook.description,
        owner_id=user_id
    )
    db.add(new_wordbook)
    db.commit()
    db.refresh(new_wordbook)
    return new_wordbook

def get_all_wordbooks(db: Session):
    return db.query(Wordbook).all()

def create_wordbook_and_words(
    db: Session,
    user_id: str,
    wordbook_data: WordbookCreate,
    word_list: list[WordCreate]
) -> Wordbook:
    new_wordbook = Wordbook(
        title=wordbook_data.title,
        description=wordbook_data.description,
        owner_id=user_id,
        created_at=datetime.utcnow()
    )
    db.add(new_wordbook)
    db.flush()  # ID 확보를 위해 flush

    for word in word_list:
        new_word = Word(
            word=word.word,
            meaning=word.meaning,
            note=word.note,
            importance=word.importance,
            wordbook_id=new_wordbook.id,
            created_at=datetime.utcnow()
        )
        db.add(new_word)

    db.commit()
    db.refresh(new_wordbook)
    return new_wordbook


def get_wordbook_by_title(db: Session, owner_id: str, title: str):
    return db.query(Wordbook).filter_by(owner_id=owner_id, title=title).first()
