// app/api/community/wordbooks/[wordbookId]/route.ts
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function GET(request: Request, { params }: { params: { wordbookId: string } }) {
    try {
        const wordbookId = params.wordbookId;
        const wordbookDoc = await firestore.collection('communityWordbooks').doc(wordbookId).get();

        if (!wordbookDoc.exists) {
            return NextResponse.json({ message: '공유된 단어장을 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({ id: wordbookDoc.id, ...wordbookDoc.data() });
    } catch (error) {
        console.error("공유 단어장 상세 조회 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}