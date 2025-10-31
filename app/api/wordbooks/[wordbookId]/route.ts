// app/api/wordbooks/[wordbookId]/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// 특정 단어장 정보와 포함된 단어 목록을 가져옵니다.
export async function GET(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  try {
    const { wordbookId } = await params;

    const headersList = await headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);
    const wordbookDoc = await wordbookRef.get();

    if (!wordbookDoc.exists || wordbookDoc.data()?.userId !== userId) {
      return NextResponse.json({ message: '단어장을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 });
    }

    // lastStudied 필드를 현재 시간으로 업데이트합니다.
    await wordbookRef.update({ lastStudied: new Date().toISOString() });

    // [!!! 수정됨 !!!]
    // 'words' 하위 컬렉션에서 단어 목록 가져오기 (orderBy 제거)
    // orderBy('createdAt', 'desc')를 사용하면 Firebase 인덱스가 필요하여 오류가 날 수 있습니다.
    // 클라이언트에서 필요시 정렬하는 것이 더 안전합니다.
    const wordsSnapshot = await wordbookRef.collection('words').get();

    // [!!! 수정됨 !!!]
    // React Key/404 오류 해결: ...doc.data()가 doc.id를 덮어쓰지 못하도록
    // data()를 먼저 받고, id를 마지막에 덮어씁니다.
    const words = wordsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id // [중요] data 안에 id가 있어도, 항상 doc.id를 사용
      };
    });

    const wordbookData = wordbookDoc.data();

    return NextResponse.json({
      ...wordbookData,
      id: wordbookDoc.id,
      words: words // 하위 컬렉션의 단어 목록 포함
    });
  } catch (error) {
    console.error("단어장 상세 조회 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 특정 단어장 정보를 수정합니다.
export async function PUT(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  try {
    const { wordbookId } = await params;
    const { name, description, category } = await request.json();
    await firestore.collection('wordbooks').doc(wordbookId).update({
      name,
      description,
      category,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return NextResponse.json({ message: '단어장이 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error("단어장 수정 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 특정 단어장을 삭제합니다.
export async function DELETE(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  try {
    const { wordbookId } = await params;

    // [!!! 수정됨 !!!]
    // 단어장 삭제 시 하위 컬렉션의 모든 단어를 삭제하는 로직 (배치 사용)
    const wordsRef = firestore.collection('wordbooks').doc(wordbookId).collection('words');
    const wordsSnapshot = await wordsRef.get();

    const batch = firestore.batch();
    wordsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // 하위 컬렉션 삭제 후 단어장 문서 삭제
    await firestore.collection('wordbooks').doc(wordbookId).delete();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("단어장 삭제 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}