import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

// 특정 단어장 정보와 포함된 단어 목록을 가져옵니다.
export async function GET(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  try {
    const { wordbookId } = await params; // ✅ params await

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
      return NextResponse.json({ message: '단어장을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 });
    }

    // lastStudied 필드를 현재 시간으로 업데이트합니다.
    await wordbookRef.update({ lastStudied: new Date().toISOString() });

    const wordsSnapshot = await wordbookRef.collection('words').orderBy('createdAt', 'desc').get();
    const words = wordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ id: wordbookDoc.id, ...wordbookDoc.data(), words });
  } catch (error) {
    console.error("단어장 상세 조회 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 특정 단어장 정보를 수정합니다.
export async function PUT(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  try {
    const { wordbookId } = await params; // ✅ params await
    const { name, description, category } = await request.json();
    await firestore.collection('wordbooks').doc(wordbookId).update({ name, description, category });
    return NextResponse.json({ message: '단어장이 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error("단어장 수정 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 특정 단어장을 삭제합니다.
export async function DELETE(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  try {
    const { wordbookId } = await params; // ✅ params await
    const wordsRef = firestore.collection('wordbooks').doc(wordbookId).collection('words');
    const wordsSnapshot = await wordsRef.get();

    const batch = firestore.batch();
    wordsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    await firestore.collection('wordbooks').doc(wordbookId).delete();
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("단어장 삭제 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
