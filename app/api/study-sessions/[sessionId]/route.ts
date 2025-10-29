import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

// 특정 학습 세션의 상세 정보를 가져옵니다.
export async function GET(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const headersList = await headers(); // ✅ await 추가
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    await adminAuth.verifyIdToken(token);

    const { sessionId } = params;

    const sessionDoc = await firestore.collection('studySessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
      return NextResponse.json({ message: '학습 기록을 찾을 수 없습니다.' }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    if (!sessionData) {
      return NextResponse.json({ message: '학습 기록 데이터가 없습니다.' }, { status: 404 });
    }

    const { wordbookId, correctWords: correctWordIds, incorrectWords: incorrectWordIds } = sessionData;

    const wordsRef = firestore.collection('wordbooks').doc(wordbookId).collection('words');

    const fetchWordsByIds = async (ids: string[]) => {
      if (!ids || ids.length === 0) return [];
      const wordPromises = ids.map(id => wordsRef.doc(id).get());
      const wordDocs = await Promise.all(wordPromises);
      return wordDocs
        .filter(doc => doc.exists)
        .map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const correctWords = await fetchWordsByIds(correctWordIds || []);
    const incorrectWords = await fetchWordsByIds(incorrectWordIds || []);

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
