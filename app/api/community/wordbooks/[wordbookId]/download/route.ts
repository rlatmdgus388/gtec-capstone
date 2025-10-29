// app/api/community/wordbooks/[wordbookId]/download/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

export async function POST(request: Request, { params }: { params: { wordbookId: string } }) {
    try {
        const headersList = await headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const { wordbookId } = params;

        const communityWordbookRef = firestore.collection('communityWordbooks').doc(wordbookId);
        const communityWordbookDoc = await communityWordbookRef.get();

        if (!communityWordbookDoc.exists) {
            return NextResponse.json({ message: '공유 단어장을 찾을 수 없습니다.' }, { status: 404 });
        }

        const wordbookData = communityWordbookDoc.data();

        // 1. 내 단어장 목록에 복사본 생성
        const newWordbookRef = await firestore.collection('wordbooks').add({
            userId,
            name: wordbookData?.name,
            description: wordbookData?.description,
            category: wordbookData?.category,
            wordCount: wordbookData?.wordCount,
            progress: 0,
            createdAt: new Date().toISOString(),
            source: wordbookId, // 원본 출처 표시
        });

        // 2. 단어들(words)을 서브컬렉션으로 복사
        const words = wordbookData?.words || [];
        const batch = firestore.batch();
        words.forEach((word: any) => {
            const wordRef = newWordbookRef.collection('words').doc();
            batch.set(wordRef, { ...word, mastered: false, createdAt: new Date().toISOString() });
        });
        await batch.commit();

        // 3. 다운로드 수 증가
        await communityWordbookRef.update({
            downloads: admin.firestore.FieldValue.increment(1),
        });

        return NextResponse.json({ message: '단어장이 성공적으로 다운로드되었습니다.', newWordbookId: newWordbookRef.id });
    } catch (error) {
        console.error("단어장 다운로드 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
