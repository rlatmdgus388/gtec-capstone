import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// POST request handler to add a new word to a wordbook
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

    const { word, meaning, example = '', pronunciation = '' } = await request.json();

    if (!word || !meaning) {
      return NextResponse.json({ message: '단어와 뜻은 필수입니다.' }, { status: 400 });
    }

    const newWordRef = await wordbookRef.collection('words').add({
      word,
      meaning,
      example,
      pronunciation,
      mastered: false,
      createdAt: new Date().toISOString(),
    });

    // Update word count in the wordbook document
    await wordbookRef.update({
      wordCount: admin.firestore.FieldValue.increment(1)
    });

    const newWord = {
      id: newWordRef.id,
      word,
      meaning,
      example,
      pronunciation,
      mastered: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newWord, { status: 201 });
  } catch (error) {
    console.error("단어 추가 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}