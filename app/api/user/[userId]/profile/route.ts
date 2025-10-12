import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
    try {
        const { userId } = params;

        // 1. 사용자 기본 정보 가져오기 (Authentication)
        const userRecord = await adminAuth.getUser(userId);

        // 2. 사용자 추가 정보 가져오기 (Firestore)
        const userDoc = await firestore.collection('users').doc(userId).get();
        const userData = userDoc.data();

        // 3. 사용자가 공유한 단어장 목록 가져오기
        const sharedWordbooksSnapshot = await firestore
            .collection('communityWordbooks')
            .where('author.uid', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        const sharedWordbooks = sharedWordbooksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 4. 사용자가 작성한 게시글 목록 가져오기
        const discussionsSnapshot = await firestore
            .collection('discussions')
            .where('author.uid', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        const discussions = discussionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 모든 정보를 조합하여 반환
        const profile = {
            uid: userRecord.uid,
            name: userRecord.displayName || userData?.name,
            email: userRecord.email,
            photoURL: userRecord.photoURL,
            bio: userData?.bio || '',
            createdAt: userRecord.metadata.creationTime,
            // 팔로워/팔로잉 수는 별도 컬렉션으로 관리해야 정확하지만, 우선 0으로 설정
            followers: 0,
            following: 0,
            sharedWordbooks,
            discussions,
        };

        return NextResponse.json(profile);
    } catch (error) {
        console.error("사용자 프로필 조회 오류:", error);
        return NextResponse.json({ message: '사용자 프로필을 불러올 수 없습니다.' }, { status: 500 });
    }
}
