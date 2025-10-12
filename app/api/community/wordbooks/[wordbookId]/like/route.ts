// app/api/community/wordbooks/[wordbookId]/like/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

export async function POST(request: Request, { params }: { params: { wordbookId: string } }) {
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const wordbookId = params.wordbookId;

        const wordbookRef = firestore.collection('communityWordbooks').doc(wordbookId);
        const doc = await wordbookRef.get();

        if (!doc.exists) {
            return NextResponse.json({ message: '단어장을 찾을 수 없습니다.' }, { status: 404 });
        }

        const likedBy = doc.data()?.likedBy || [];
        let newLikesCount;

        if (likedBy.includes(userId)) {
            // 좋아요 취소
            await wordbookRef.update({
                likedBy: admin.firestore.FieldValue.arrayRemove(userId),
                likes: admin.firestore.FieldValue.increment(-1),
            });
            newLikesCount = (doc.data()?.likes || 1) - 1;
        } else {
            // 좋아요
            await wordbookRef.update({
                likedBy: admin.firestore.FieldValue.arrayUnion(userId),
                likes: admin.firestore.FieldValue.increment(1),
            });
            newLikesCount = (doc.data()?.likes || 0) + 1;
        }

        return NextResponse.json({ likes: newLikesCount });

    } catch (error) {
        console.error("'좋아요' 처리 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}