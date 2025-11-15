// [!!!] 이 한 줄을 파일 맨 위에 추가하세요
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db, admin } from '@/lib/firebase-admin';

// (기존 GET 함수)
export async function GET(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    //
    // [!!! 여기가 수정된 부분입니다 !!!]
    // 'lastStudied' (최신 활동순)으로 정렬하는 쿼리를 추가합니다.
    const snapshot = await db.collection('wordbooks')
      .where('userId', '==', userId)
      .orderBy('lastStudied', 'desc') // <-- 이 줄이 추가되었습니다!
      .get();
    // [!!! 수정 완료 !!!]
    //

    if (snapshot.empty) {
      return NextResponse.json([]);
    }

    const wordbooks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(wordbooks);

  } catch (error: any) {
    console.error('Failed to fetch wordbooks:', error);

    // [추가] Firestore 색인 오류 감지
    if (error.code === 'FAILED_PRECONDITION' && error.message.includes('index')) {
      console.error("===================================================================");
      console.error(">>> Firestore 복합 색인이 필요합니다!");
      console.error(">>> 오류 메시지에 포함된 URL을 클릭하여 색인을 생성하세요.");
      console.error(">>> (대상: 'wordbooks' 컬렉션, 필드: userId (오름차순), lastStudied (내림차순))");
      console.error("===================================================================");
      return NextResponse.json(
        { message: '데이터베이스 색인 작업이 필요합니다. 잠시 후 다시 시도해주세요.', detail: error.message },
        { status: 500 }
      );
    }

    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ message: 'Token expired' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// (기존 POST 함수 - 단어장 생성)
export async function POST(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email || 'Unknown User'; // 이메일이 없을 경우 대비

    const { name, description, category } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const newWordbookRef = await db.collection('wordbooks').add({
      userId: userId,
      userName: userEmail, // 또는 사용자의 다른 식별자
      name: name,
      description: description || '',
      category: category || '일반',
      wordCount: 0,
      masteredCount: 0,
      progress: 0,
      createdAt: timestamp,
      lastStudied: timestamp, // [중요] 생성 시에도 lastStudied를 설정해야 정렬됨
      isShared: false,
      likes: 0,
      downloads: 0,
      views: 0,
    });

    return NextResponse.json({ id: newWordbookRef.id, message: 'Wordbook created' }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to create wordbook:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ message: 'Token expired' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}