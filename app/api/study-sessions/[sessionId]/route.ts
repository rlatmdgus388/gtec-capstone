import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const headersList = await headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    await adminAuth.verifyIdToken(token);

    const { sessionId } = await context.params;

    const sessionDoc = await firestore.collection('studySessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
      return NextResponse.json({ message: '학습 기록을 찾을 수 없습니다.' }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    const { wordbookId, correctWords: correctIds = [], incorrectWords: incorrectIds = [] } = sessionData!;

    const wordsRef = firestore.collection('wordbooks').doc(wordbookId).collection('words');

    const fetchWords = async (ids: string[]) => {
      const wordDocs = await Promise.all(ids.map(id => wordsRef.doc(id).get()));
      return wordDocs.filter(doc => doc.exists).map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const correctWords = await fetchWords(correctIds);
    const incorrectWords = await fetchWords(incorrectIds);

    return NextResponse.json({
      ...sessionData,
      correctWords,
      incorrectWords,
    });

  } catch (error) {
    console.error("학습 기록 상세 조회 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
