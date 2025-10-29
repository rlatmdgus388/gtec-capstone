// app/api/community/discussions/[postId]/like/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> } // params는 Promise로 받고
) {
  try {
    // ✅ headers()도 await (네 환경 메시지 기준)
    const headersList = await headers();
    const authHeader = headersList.get('Authorization') || headersList.get('authorization');
    const token = authHeader?.toString().replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // ✅ params 먼저 await
    const { postId } = await params;

    const postRef = firestore.collection('discussions').doc(postId);
    const doc = await postRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const postData = doc.data() || {};
    const likedBy: string[] = Array.isArray(postData.likedBy) ? postData.likedBy : [];

    if (likedBy.includes(userId)) {
      // 좋아요 취소
      await postRef.update({
        likedBy: admin.firestore.FieldValue.arrayRemove(userId),
        likes: admin.firestore.FieldValue.increment(-1),
      });
    } else {
      // 좋아요
      await postRef.update({
        likedBy: admin.firestore.FieldValue.arrayUnion(userId),
        likes: admin.firestore.FieldValue.increment(1),
      });
    }

    // 최신 상태 재조회
    const updatedDoc = await postRef.get();
    const updatedData = updatedDoc.data() || {};

    return NextResponse.json({
      likes: updatedData.likes ?? 0,
      likedBy: updatedData.likedBy ?? [],
    });
  } catch (error) {
    console.error("'좋아요' 처리 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
