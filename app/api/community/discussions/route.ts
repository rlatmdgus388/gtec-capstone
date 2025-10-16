import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

// 모든 게시글 목록을 가져옵니다. (인증 추가)
export async function GET() {
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        // 인증 토큰이 없는 경우에도 에러 대신 빈 배열을 반환하여 비로그인 상태를 처리할 수 있습니다.
        // 하지만 현재 구조에서는 인증된 사용자만 API를 호출하므로, 토큰이 없으면 오류로 처리하는 것이 맞습니다.
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        await adminAuth.verifyIdToken(token);

        const discussionsSnapshot = await firestore.collection('discussions').orderBy('createdAt', 'desc').get();
        const discussions = discussionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(discussions);
    } catch (error) {
        console.error("게시글 목록 조회 실패:", error);
        if (error instanceof Error && 'code' in error && error.code === 'auth/id-token-expired') {
            return NextResponse.json({ message: '인증 토큰이 만료되었습니다.' }, { status: 401 });
        }
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 새로운 게시글을 생성합니다.
export async function POST(request: Request) {
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

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
                name: decodedToken.name || 'Anonymous',
                photoURL: decodedToken.picture || null,
            },
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            replies: 0,
        };

        const docRef = await firestore.collection('discussions').add(newPost);

        return NextResponse.json({ id: docRef.id, ...newPost }, { status: 201 });
    } catch (error) {
        console.error("게시글 생성 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}