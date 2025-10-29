// app/api/community/discussions/[postId]/comments/[commentId]/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// 댓글 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ postId: string; commentId: string }> } // ✅ Promise로 받기
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

    // ✅ params await
    const { postId, commentId } = await params;

    const { content } = await request.json();
    if (!content || !String(content).trim()) {
      return NextResponse.json({ message: '내용이 필요합니다.' }, { status: 400 });
    }

    const postRef = firestore.collection('discussions').doc(postId);
    const commentRef = postRef.collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return NextResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (commentDoc.data()?.author?.uid !== userId) {
      return NextResponse.json({ message: '수정 권한이 없습니다.' }, { status: 403 });
    }

    await commentRef.update({
      content: String(content).trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // ✅ 서버 타임스탬프
    });

    const updated = await commentRef.get();
    return NextResponse.json({ id: updated.id, ...updated.data() }, { status: 200 });
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 댓글 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ postId: string; commentId: string }> } // ✅ Promise로 받기
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

    // ✅ params await
    const { postId, commentId } = await params;

    const postRef = firestore.collection('discussions').doc(postId);
    const commentRef = postRef.collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return NextResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }
    if (commentDoc.data()?.author?.uid !== userId) {
      return NextResponse.json({ message: '삭제 권한이 없습니다.' }, { status: 403 });
    }

    await commentRef.delete();

    // 게시글의 댓글 수 감소
    await postRef.update({
      replies: admin.firestore.FieldValue.increment(-1),
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
