// app/api/community/wordbooks/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import type { Query } from 'firebase-admin/firestore'; // Query 타입 import

// 공유된 모든 단어장 목록 가져오기
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sortBy = searchParams.get('sortBy') || 'createdAt'; // 기본 정렬: 생성일

        // 'query' 변수의 타입을 명시적으로 Query로 지정
        let query: Query = firestore.collection('communityWordbooks');

        if (sortBy === 'downloads') {
            query = query.orderBy('downloads', 'desc');
        } else {
            query = query.orderBy('createdAt', 'desc');
        }

        const wordbooksSnapshot = await query.get();
        const wordbooks = wordbooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(wordbooks);
    } catch (error) {
        console.error("공유 단어장 목록 조회 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 새로운 단어장 공유하기
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

        const { wordbookId, name, description, category, wordCount, words } = await request.json();

        const newSharedWordbook = {
            originalWordbookId: wordbookId,
            name,
            description,
            category,
            wordCount,
            words, // 단어 목록 전체를 포함
            author: {
                uid: userId,
                name: userDoc.displayName || userDoc.email,
                photoURL: userDoc.photoURL || '',
            },
            likes: 0,
            likedBy: [],
            downloads: 0,
            views: 0, // 조회수 필드 추가
            createdAt: new Date().toISOString(),
        };

        const docRef = await firestore.collection('communityWordbooks').add(newSharedWordbook);

        return NextResponse.json({ id: docRef.id, ...newSharedWordbook }, { status: 201 });
    } catch (error) {
        console.error("단어장 공유 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> db7745a (다크모드, 프로필 설정)
