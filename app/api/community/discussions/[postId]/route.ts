import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

// 특정 게시글 정보와 댓글 목록을 가져옵니다.
export async function GET(request: Request, { params }: { params: { postId: string } }) {
    try {
        const { postId } = params;

        const postDoc = await firestore.collection('discussions').doc(postId).get();

        if (!postDoc.exists) {
            return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        const commentsSnapshot = await firestore
            .collection('discussions')
            .doc(postId)
            .collection('comments')
            .orderBy('createdAt', 'asc')
            .get();

        const comments = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const post = { id: postDoc.id, ...postDoc.data(), comments };

        return NextResponse.json(post);
    } catch (error) {
        console.error("게시글 상세 조회 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
