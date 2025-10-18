import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

export async function POST(request: Request, { params }: { params: { postId: string } }) {
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

        const postData = doc.data();
        const likedBy = postData?.likedBy || [];
        let newLikesCount;

        if (likedBy.includes(userId)) {
            // 좋아요 취소
            await postRef.update({
                likedBy: admin.firestore.FieldValue.arrayRemove(userId),
                likes: admin.firestore.FieldValue.increment(-1),
            });
            newLikesCount = (postData?.likes || 1) - 1;
        } else {
            // 좋아요
            await postRef.update({
                likedBy: admin.firestore.FieldValue.arrayUnion(userId),
                likes: admin.firestore.FieldValue.increment(1),
            });
            newLikesCount = (postData?.likes || 0) + 1;
        }

        const updatedDoc = await postRef.get();
        const updatedData = updatedDoc.data();

        return NextResponse.json({ likes: newLikesCount, likedBy: updatedData?.likedBy || [] });

    } catch (error) {
        console.error("'좋아요' 처리 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
