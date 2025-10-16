// app/api/community/discussions/[postId]/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// 특정 게시글 정보와 댓글 목록을 가져옵니다. (조회수 증가 로직 추가)
export async function GET(request: Request, { params }: { params: { postId: string } }) {
    try {
        const { postId } = params;
        const postRef = firestore.collection('discussions').doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 조회수 1 증가
        await postRef.update({
            views: admin.firestore.FieldValue.increment(1)
        });

        const commentsSnapshot = await postRef.collection('comments').orderBy('createdAt', 'asc').get();
        const comments = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const postData = postDoc.data();
        const post = {
            id: postDoc.id,
            ...postData,
            views: (postData?.views || 0) + 1, // 응답에 증가된 조회수 포함
            comments
        };

        return NextResponse.json(post);
    } catch (error) {
        console.error("게시글 상세 조회 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}


// 게시글 수정
export async function PUT(request: Request, { params }: { params: { postId: string } }) {
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const { postId } = params;
        const { title, content, category } = await request.json();

        if (!title || !content || !category) {
            return NextResponse.json({ message: '모든 필드를 입력해야 합니다.' }, { status: 400 });
        }

        const postRef = firestore.collection('discussions').doc(postId);
        const doc = await postRef.get();

        if (!doc.exists) {
            return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        if (doc.data()?.author.uid !== userId) {
            return NextResponse.json({ message: '게시글을 수정할 권한이 없습니다.' }, { status: 403 });
        }

        await postRef.update({ title, content, category });
        const updatedDoc = await postRef.get();

        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        console.error("게시글 수정 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 게시글 삭제
export async function DELETE(request: Request, { params }: { params: { postId: string } }) {
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const { postId } = params;

        const postRef = firestore.collection('discussions').doc(postId);
        const doc = await postRef.get();

        if (!doc.exists) {
            return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        if (doc.data()?.author.uid !== userId) {
            return NextResponse.json({ message: '게시글을 삭제할 권한이 없습니다.' }, { status: 403 });
        }

        // TODO: 댓글(하위 컬렉션) 삭제 로직 추가 필요

        await postRef.delete();

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("게시글 삭제 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}