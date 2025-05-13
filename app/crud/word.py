from app.models.word import Word
from sqlalchemy.orm import Session
from app.schemas.word import WordCreate

def save_words_to_wordbook(db: Session, wordbook_id: int, words: list[WordCreate]):
    created_words = []
    for word in words:
        db_word = Word(
            word=word.word,
            meaning=word.meaning,
            wordbook_id=wordbook_id
        )
        db.add(db_word)
        created_words.append(db_word)
    db.commit()
    return {"message": f"{len(created_words)}개 단어 저장 완료"}
