import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// POST: 단어 추가 (기존 코드)
export async function POST(request: Request, { params }: { params: { wordbookId: string } }) {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const { wordbookId } = params;

    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);
    const wordbookDoc = await wordbookRef.get();

    if (!wordbookDoc.exists || wordbookDoc.data()?.userId !== userId) {
      return NextResponse.json({ message: '단어장을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 });
    }

    const wordsToAdd = await request.json();

    if (!Array.isArray(wordsToAdd) || wordsToAdd.length === 0) {
      return NextResponse.json({ message: '추가할 단어가 없습니다.' }, { status: 400 });
    }

    const batch = firestore.batch();
    const wordsCollectionRef = wordbookRef.collection('words');
    const newWords = [];

    for (const wordData of wordsToAdd) {
      if (!wordData.word || !wordData.meaning) {
        console.warn('Invalid word data skipped:', wordData);
        continue;
      }

      const newWordRef = wordsCollectionRef.doc();
      const wordPayload = {
        word: wordData.word,
        meaning: wordData.meaning,
        example: wordData.example || '',
        pronunciation: wordData.pronunciation || '',
        mastered: false,
        createdAt: new Date().toISOString(),
      };
      batch.set(newWordRef, wordPayload);
      newWords.push({ id: newWordRef.id, ...wordPayload });
    }

    if (newWords.length === 0) {
      return NextResponse.json({ message: '유효한 단어가 없습니다.' }, { status: 400 });
    }

    await batch.commit();

    await wordbookRef.update({
      wordCount: admin.firestore.FieldValue.increment(newWords.length)
    });

    return NextResponse.json({ message: `${newWords.length}개의 단어가 추가되었습니다.`, words: newWords }, { status: 201 });

  } catch (error) {
    console.error("단어 추가 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE: 여러 단어 삭제 (새로 추가)
export async function DELETE(request: Request, { params }: { params: { wordbookId: string } }) {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const { wordbookId } = params;
    const { wordIds } = await request.json();

    if (!Array.isArray(wordIds) || wordIds.length === 0) {
      return NextResponse.json({ message: '삭제할 단어 ID가 필요합니다.' }, { status: 400 });
    }

    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);
    const wordbookDoc = await wordbookRef.get();

    if (!wordbookDoc.exists || wordbookDoc.data()?.userId !== userId) {
      return NextResponse.json({ message: '단어장을 찾을 수 없거나 권한이 없습니다.' }, { status: 403 });
    }

    const batch = firestore.batch();
    const wordsCollectionRef = wordbookRef.collection('words');

    wordIds.forEach(id => {
      batch.delete(wordsCollectionRef.doc(id));
    });

    await batch.commit();

    // 단어장 wordCount 업데이트
    await wordbookRef.update({
      wordCount: admin.firestore.FieldValue.increment(-wordIds.length)
    });

    return NextResponse.json({ message: `${wordIds.length}개의 단어가 삭제되었습니다.` }, { status: 200 });

  } catch (error) {
    console.error("여러 단어 삭제 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}