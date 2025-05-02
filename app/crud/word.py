from sqlalchemy.orm import Session
from app.models.word import Word
from app.schemas.word import WordCreate

def save_words_to_wordbook(db: Session, wordbook_id: int, words: list[WordCreate]):
    created = []
    for word_data in words:
        word = Word(
            wordbook_id=wordbook_id,
            word=word_data.word,
            meaning=word_data.meaning
        )
        db.add(word)
        created.append(word)
    db.commit()
    return created
