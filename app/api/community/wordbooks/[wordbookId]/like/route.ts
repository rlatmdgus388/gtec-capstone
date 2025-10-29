// app/api/community/wordbooks/[wordbookId]/like/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ wordbookId: string }> } // ✅ Promise로 받기
) {
  try {
    // ✅ headers() await
    const h = await headers();
    const authHeader = h.get('Authorization') || h.get('authorization');
    const token = authHeader?.toString().replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { wordbookId } = await params; // ✅ await

    const wordbookRef = firestore.collection('communityWordbooks').doc(wordbookId);
    const doc = await wordbookRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: '단어장을 찾을 수 없습니다.' }, { status: 404 });
    }

    const data = doc.data() || {};
    const likedBy: string[] = Array.isArray(data.likedBy) ? data.likedBy : [];
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      // 좋아요 취소
      await wordbookRef.update({
        likedBy: admin.firestore.FieldValue.arrayRemove(userId),
        likes: admin.firestore.FieldValue.increment(-1),
      });
    } else {
      // 좋아요
      await wordbookRef.update({
        likedBy: admin.firestore.FieldValue.arrayUnion(userId),
        likes: admin.firestore.FieldValue.increment(1),
      });
    }

    // 최신 상태 재조회해 정확한 수 반환
    const updated = await wordbookRef.get();
    const updatedData = updated.data() || {};

    return NextResponse.json(
      {
        likes: updatedData.likes ?? 0,
        likedBy: updatedData.likedBy ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("'좋아요' 처리 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
