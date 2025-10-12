// app/api/community/discussions/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

// 모든 게시글 목록 가져오기
export async function GET() {
    try {
        const postsSnapshot = await firestore.collection('discussions').orderBy('createdAt', 'desc').get();
        const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(posts);
    } catch (error) {
        console.error("게시글 목록 조회 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 새로운 게시글 작성하기
export async function POST(request: Request) {
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const userDoc = await adminAuth.getUser(userId);

        const { title, content, category } = await request.json();

        if (!title || !content || !category) {
            return NextResponse.json({ message: '제목, 내용, 카테고리는 필수입니다.' }, { status: 400 });
        }

        const newPost = {
            title,
            content,
            category,
            author: {
                uid: userId,
                name: userDoc.displayName || userDoc.email,
                photoURL: userDoc.photoURL || '',
            },
            likes: 0,
            replies: 0,
            createdAt: new Date().toISOString(),
        };

        const docRef = await firestore.collection('discussions').add(newPost);

        return NextResponse.json({ id: docRef.id, ...newPost }, { status: 201 });
    } catch (error) {
        console.error("게시글 생성 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}