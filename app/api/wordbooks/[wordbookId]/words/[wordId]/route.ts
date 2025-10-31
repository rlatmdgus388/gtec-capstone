// app/api/wordbooks/[wordbookId]/words/[wordId]/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

/**
 * [추가됨] 단어장의 'words' 컬렉션을 기반으로
 * wordCount와 progress를 다시 계산하여 부모 wordbook 문서를 업데이트하는 함수
 */
async function updateWordbookProgress(wordbookRef: admin.firestore.DocumentReference) {
  const wordsSnapshot = await wordbookRef.collection('words').get();
  const words = wordsSnapshot.docs.map(doc => doc.data());

  const total = words.length;

  if (total === 0) {
    await wordbookRef.update({
      progress: 0,
      wordCount: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return; // 0으로 업데이트 후 종료
  }

  const masteredCount = words.filter(w => w.mastered === true).length;
  const progress = Math.round((masteredCount / total) * 100);

  // 부모 wordbook 문서를 업데이트
  await wordbookRef.update({
    progress: progress,
    wordCount: total,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

// PUT: 단일 단어 수정 (암기 상태 변경 등)
export async function PUT(request: Request, { params }: { params: Promise<{ wordbookId: string, wordId: string }> }) {
  try {
    const { wordbookId, wordId } = await params;
    const headersList = await headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);
    const wordbookDoc = await wordbookRef.get();

    // 소유권 확인 (userId 필드 사용)
    if (!wordbookDoc.exists || wordbookDoc.data()?.userId !== userId) {
      return NextResponse.json({ message: '권한이 없거나 단어장을 찾을 수 없습니다.' }, { status: 403 });
    }

    // 'words' 하위 컬렉션에서 'wordId' 문서를 찾음
    const wordRef = wordbookRef.collection('words').doc(wordId);
    const wordDoc = await wordRef.get();

    if (!wordDoc.exists) {
      return NextResponse.json({ message: '단어를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updateData = await request.json();
    await wordRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // [!!! 수정됨 !!!]
    // 단어 상태 변경 후, 단어장 전체의 progress를 다시 계산합니다.
    await updateWordbookProgress(wordbookRef);

    return NextResponse.json({ message: '단어가 업데이트되었습니다.', word: { id: wordId, ...updateData } });
  } catch (error) {
    console.error("단어 업데이트 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE: 단일 단어 삭제
export async function DELETE(request: Request, { params }: { params: Promise<{ wordbookId: string, wordId: string }> }) {
  try {
    const { wordbookId, wordId } = await params;
    const headersList = await headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);
    const wordbookDoc = await wordbookRef.get();

    // 소유권 확인 (userId 필드 사용)
    if (!wordbookDoc.exists || wordbookDoc.data()?.userId !== userId) {
      return NextResponse.json({ message: '권한이 없거나 단어장을 찾을 수 없습니다.' }, { status: 403 });
    }

    const wordRef = wordbookRef.collection('words').doc(wordId);
    const wordDoc = await wordRef.get();

    if (!wordDoc.exists) {
      return NextResponse.json({ message: '단어를 찾을 수 없습니다.' }, { status: 404 });
    }

    await wordRef.delete();

    // [!!! 수정됨 !!!]
    // 단어 삭제 후, 단어장 전체의 progress와 wordCount를 다시 계산합니다.
    await updateWordbookProgress(wordbookRef);

    return NextResponse.json({ message: '단어가 삭제되었습니다.' });
  } catch (error) {
    console.error("단일 단어 삭제 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}