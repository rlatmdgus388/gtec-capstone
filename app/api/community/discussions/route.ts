// app/api/community/discussions/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import type { Query } from 'firebase-admin/firestore'; // Query 타입 import

// 모든 게시글 목록을 가져옵니다.
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sortBy = searchParams.get('sortBy') || 'createdAt';

        const headersList = await headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];

        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        await adminAuth.verifyIdToken(token);

        // 'query' 변수의 타입을 명시적으로 Query로 지정
        let query: Query = firestore.collection('discussions');

        if (sortBy === 'likes') {
            query = query.orderBy('likes', 'desc');
        } else {
            query = query.orderBy('createdAt', 'desc');
        }

        const discussionsSnapshot = await query.get();
        const discussions = discussionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(discussions);
    } catch (error) {
        console.error("게시글 목록 조회 실패:", error);
        if (error instanceof Error && 'code' in error && (error as any).code === 'auth/id-token-expired') {
            return NextResponse.json({ message: '인증 토큰이 만료되었습니다.' }, { status: 401 });
        }
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 새로운 게시글을 생성합니다.
export async function POST(request: Request) {
    try {
        const headersList = await headers();
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
                name: userDoc.displayName || userDoc.email || 'Anonymous',
                photoURL: userDoc.photoURL || null,
            },
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            replies: 0,
            views: 0, // 조회수 필드 추가
        };

        const docRef = await firestore.collection('discussions').add(newPost);

        return NextResponse.json({ id: docRef.id, ...newPost }, { status: 201 });
    } catch (error) {
        console.error("게시글 생성 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
