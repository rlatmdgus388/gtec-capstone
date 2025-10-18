import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

// POST request handler to fetch multiple words by their IDs from different wordbooks
export async function POST(request: Request) {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }
    await adminAuth.verifyIdToken(token);

    // The body will contain an array of objects: { wordbookId: string, wordId: string }
    const wordIdsToFetch: { wordbookId: string, wordId: string }[] = await request.json();

    if (!Array.isArray(wordIdsToFetch) || wordIdsToFetch.length === 0) {
      return NextResponse.json({ message: '조회할 단어 ID가 없습니다.' }, { status: 400 });
    }

    const wordPromises = wordIdsToFetch.map(({ wordbookId, wordId }) =>
      firestore.collection('wordbooks').doc(wordbookId).collection('words').doc(wordId).get()
    );

    const wordDocs = await Promise.all(wordPromises);

    const words = wordDocs
      .filter(doc => doc.exists)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(words);

  } catch (error) {
    console.error("여러 단어 조회 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> db7745a (다크모드, 프로필 설정)
