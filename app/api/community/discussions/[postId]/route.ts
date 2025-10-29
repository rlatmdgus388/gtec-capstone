// app/api/community/discussions/[postId]/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// 특정 게시글 정보와 댓글 목록을 가져옵니다. (조회수 증가 로직 포함)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> } // ✅ Promise로 받고
) {
  try {
    const { postId } = await params; // ✅ 먼저 await 해서 사용
    const postRef = firestore.collection('discussions').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 조회수 1 증가
    await postRef.update({
      views: admin.firestore.FieldValue.increment(1),
    });

    const commentsSnapshot = await postRef
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .get();

    // 문서 데이터 + id 포함
    const comments = commentsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    const postData = postDoc.data();
    const post = {
      id: postDoc.id,
      ...postData,
      views: (postData?.views || 0) + 1, // 응답에는 증가 반영
      comments,
    };

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error('게시글 상세 조회 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 게시글 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ postId: string }> } // ✅ Promise로 받고
) {
  try {
    // headers()는 동기입니다.
    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { postId } = await params; // ✅ await
    const { title, content, category } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json({ message: '모든 필드를 입력해야 합니다.' }, { status: 400 });
    }

    const postRef = firestore.collection('discussions').doc(postId);
    const doc = await postRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (doc.data()?.author?.uid !== userId) {
      return NextResponse.json({ message: '게시글을 수정할 권한이 없습니다.' }, { status: 403 });
    }

    await postRef.update({ title, content, category });
    const updatedDoc = await postRef.get();

    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() }, { status: 200 });
  } catch (error) {
    console.error('게시글 수정 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 게시글 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> } // ✅ Promise로 받고
) {
  try {
    const headersList = headers(); // ❌ await 제거
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { postId } = await params; // ✅ await

    const postRef = firestore.collection('discussions').doc(postId);
    const doc = await postRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (doc.data()?.author?.uid !== userId) {
      return NextResponse.json({ message: '게시글을 삭제할 권한이 없습니다.' }, { status: 403 });
    }

    // TODO: 댓글(하위 컬렉션) 삭제 로직 필요 시 추가

    await postRef.delete();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
