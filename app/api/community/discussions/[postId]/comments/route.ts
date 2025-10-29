// app/api/community/discussions/[postId]/comments/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// 새로운 댓글을 작성합니다.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> } // ✅ params는 Promise로 받고
) {
  try {
    // ✅ headers()는 네 환경 기준 await 필요
    const h = await headers();
    const authHeader = h.get('Authorization') || h.get('authorization');
    const token = authHeader?.toString().replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const userRecord = await adminAuth.getUser(userId);

    // ✅ params 먼저 await 해서 postId 추출
    const { postId } = await params;

    const { content } = await request.json();
    if (!content || !String(content).trim()) {
      return NextResponse.json({ message: '댓글 내용이 필요합니다.' }, { status: 400 });
    }

    // 게시글 존재 여부 확인
    const postRef = firestore.collection('discussions').doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) {
      return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const newComment = {
      content: String(content).trim(),
      author: {
        uid: userId,
        name: userRecord.displayName || userRecord.email || '익명',
        photoURL: userRecord.photoURL || '',
      },
      // ✅ Firestore 정렬/쿼리를 위해 서버 타임스탬프 사용
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const commentRef = await postRef.collection('comments').add(newComment);

    // 댓글 수(replies) 1 증가
    await postRef.update({
      replies: admin.firestore.FieldValue.increment(1),
    });

    // 방금 추가한 댓글의 실제 데이터(서버타임스탬프 포함) 재조회
    const saved = await commentRef.get();
    const savedData = saved.data() || {};

    return NextResponse.json(
      {
        id: saved.id,
        ...savedData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
