import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

// 사용자의 모든 단어장 목록을 가져옵니다.
export async function GET() {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // 정렬 기준을 다시 'createdAt'으로 변경합니다.
    const wordbooksSnapshot = await firestore.collection('wordbooks').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    const wordbooks = wordbooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(wordbooks);
  } catch (error) {
    console.error("단어장 목록 조회 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 새로운 단어장을 생성합니다.
export async function POST(request: Request) {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { name, description, category } = await request.json();
    if (!name || !category) {
      return NextResponse.json({ message: '단어장 이름과 카테고리는 필수입니다.' }, { status: 400 });
    }

    const currentTime = new Date().toISOString();
    const newWordbookRef = await firestore.collection('wordbooks').add({
      userId,
      name,
      description: description || '',
      category,
      progress: 0,
      wordCount: 0,
      createdAt: currentTime,
      lastStudied: currentTime, // lastStudied 필드는 그대로 유지합니다.
    });

    const newWordbook = {
      id: newWordbookRef.id,
      name,
      description,
      category,
      progress: 0,
      wordCount: 0,
    };

    return NextResponse.json(newWordbook, { status: 201 });
  } catch (error) {
    console.error("단어장 생성 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}