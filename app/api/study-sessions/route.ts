import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const sessionsSnapshot = await firestore
      .collection('studySessions')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .get();

    const sessions = sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("학습 기록 조회 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const {
      wordbookId,
      wordbookName,
      mode,
      score,
      duration,
      correctWords = [],
      incorrectWords = []
    } = await request.json();

    if (!wordbookId || !wordbookName || !mode || score === undefined || !duration) {
      return NextResponse.json({ message: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    const newSession = {
      userId,
      wordbookId,
      wordbookName,
      mode,
      score,
      duration,
      completedAt: new Date().toISOString(),
      correctWords,
      incorrectWords,
    };

    await firestore.collection('studySessions').add(newSession);

    return NextResponse.json(newSession, { status: 201 });

  } catch (error) {
    console.error("학습 기록 저장 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
