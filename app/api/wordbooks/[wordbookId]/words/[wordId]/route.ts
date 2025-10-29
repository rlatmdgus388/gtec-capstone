import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// PUT: 단일 단어 수정
export async function PUT(request: Request, { params }: { params: Promise<{ wordbookId: string, wordId: string }> }) {
  try {
    const { wordbookId, wordId } = await params; // ✅ params await
    const headersList = await headers(); // ✅ headers await
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);
    const wordbookDoc = await wordbookRef.get();

    if (!wordbookDoc.exists || wordbookDoc.data()?.userId !== userId) {
      return NextResponse.json({ message: '권한이 없거나 단어장을 찾을 수 없습니다.' }, { status: 403 });
    }

    const wordRef = wordbookRef.collection('words').doc(wordId);
    const wordDoc = await wordRef.get();
    if (!wordDoc.exists) {
      return NextResponse.json({ message: '단어를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updateData = await request.json();
    await wordRef.update(updateData);

    return NextResponse.json({ message: '단어가 업데이트되었습니다.', word: { id: wordId, ...updateData } });
  } catch (error) {
    console.error("단어 업데이트 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE: 단일 단어 삭제
export async function DELETE(request: Request, { params }: { params: Promise<{ wordbookId: string, wordId: string }> }) {
  try {
    const { wordbookId, wordId } = await params; // ✅ params await
    const headersList = await headers(); // ✅ headers await
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);
    const wordbookDoc = await wordbookRef.get();

    if (!wordbookDoc.exists || wordbookDoc.data()?.userId !== userId) {
      return NextResponse.json({ message: '권한이 없거나 단어장을 찾을 수 없습니다.' }, { status: 403 });
    }

    const wordRef = wordbookRef.collection('words').doc(wordId);
    const wordDoc = await wordRef.get();

    if (!wordDoc.exists) {
      return NextResponse.json({ message: '단어를 찾을 수 없습니다.' }, { status: 404 });
    }

    await wordRef.delete();

    // 단어장 wordCount 감소
    await wordbookRef.update({
      wordCount: admin.firestore.FieldValue.increment(-1)
    });

    return NextResponse.json({ message: '단어가 삭제되었습니다.' });
  } catch (error) {
    console.error("단일 단어 삭제 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
