from sqlalchemy.orm import Session
from app.models.word import Word
from app.schemas.word import WordCreate
from datetime import datetime

def save_words_to_wordbook(db: Session, wordbook_id: int, words: list[WordCreate]):
    new_words = [
        Word(
            word=w.word,
            meaning=w.meaning,
            note=w.note,
            importance=w.importance,
            wordbook_id=wordbook_id,
            created_at=datetime.utcnow()
        )
        for w in words
    ]
    db.add_all(new_words)
    db.commit()
    return {"message": f"{len(new_words)} words added to wordbook {wordbook_id}"}

