import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// 새로운 댓글을 작성합니다.
export async function POST(request: Request, { params }: { params: { postId: string } }) {
    try {
        const headersList = await headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const userDoc = await adminAuth.getUser(userId);

        const { postId } = params;
        const { content } = await request.json();

        if (!content) {
            return NextResponse.json({ message: '댓글 내용이 필요합니다.' }, { status: 400 });
        }

        const newComment = {
            content,
            author: {
                uid: userId,
                name: userDoc.displayName || userDoc.email,
                photoURL: userDoc.photoURL || '',
            },
            createdAt: new Date().toISOString(),
        };

        const commentRef = await firestore.collection('discussions').doc(postId).collection('comments').add(newComment);

        // 게시글의 댓글 수(replies) 1 증가
        await firestore.collection('discussions').doc(postId).update({
            replies: admin.firestore.FieldValue.increment(1)
        });

        return NextResponse.json({ id: commentRef.id, ...newComment }, { status: 201 });
    } catch (error) {
        console.error("댓글 작성 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
