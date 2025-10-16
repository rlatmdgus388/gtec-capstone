import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// 댓글 수정
export async function PUT(request: Request, { params }: { params: { postId: string, commentId: string } }) {
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const { postId, commentId } = params;
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json({ message: '내용이 필요합니다.' }, { status: 400 });
        }

        const commentRef = firestore.collection('discussions').doc(postId).collection('comments').doc(commentId);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists || commentDoc.data()?.author.uid !== userId) {
            return NextResponse.json({ message: '댓글을 찾을 수 없거나 수정 권한이 없습니다.' }, { status: 403 });
        }

        await commentRef.update({ content, updatedAt: new Date().toISOString() });
        const updatedCommentDoc = await commentRef.get();

        return NextResponse.json({ id: updatedCommentDoc.id, ...updatedCommentDoc.data() });
    } catch (error) {
        console.error("댓글 수정 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 댓글 삭제
export async function DELETE(request: Request, { params }: { params: { postId: string, commentId: string } }) {
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const { postId, commentId } = params;

        const postRef = firestore.collection('discussions').doc(postId);
        const commentRef = postRef.collection('comments').doc(commentId);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists || commentDoc.data()?.author.uid !== userId) {
            return NextResponse.json({ message: '댓글을 찾을 수 없거나 삭제 권한이 없습니다.' }, { status: 403 });
        }

        await commentRef.delete();

        // 게시글의 댓글 수 감소
        await postRef.update({
            replies: admin.firestore.FieldValue.increment(-1)
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("댓글 삭제 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}