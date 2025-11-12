// app/api/wordbooks/route.ts

import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

// 사용자의 모든 단어장 목록을 가져옵니다. (GET 함수는 수정 없음)
export async function GET() {
  try {
    const headersList = await headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const wordbooksSnapshot = await firestore.collection('wordbooks').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    const wordbooks = wordbooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(wordbooks);
  } catch (error) {
    console.error("단어장 목록 조회 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 새로운 단어장을 생성합니다. (POST 함수 수정됨)
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

    // [!!!] 수정 1: 'name'만 필수 항목으로 변경
    if (!name) {
      return NextResponse.json({ message: '단어장 이름은 필수입니다.' }, { status: 400 });
    }

    const currentTime = new Date().toISOString();

    // [!!!] 수정 2: DB에 저장할 데이터 (기본값 설정)
    const newWordbookData = {
      userId,
      name,
      description: description || '',
      category: category || "imported", // category가 없으면 "imported"로 기본값
      progress: 0,
      wordCount: 0,
      createdAt: currentTime,
      lastStudied: currentTime,
    };

    const newWordbookRef = await firestore.collection('wordbooks').add(newWordbookData);

    // [!!!] 수정 3: 프론트엔드(import-screen)가 ID를 포함한 전체 객체를 기대함
    const newWordbook = {
      id: newWordbookRef.id, // 생성된 ID 포함
      ...newWordbookData
    };

    return NextResponse.json(newWordbook, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("단어장 생성 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}