// app/api/community/wordbooks/[wordbookId]/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { headers } from 'next/headers';

// 특정 공유 단어장 정보 가져오기 (조회수 증가 포함)
export async function GET(request: Request, { params }: { params: { wordbookId: string } }) {
    try {
        const wordbookId = params.wordbookId;
        const wordbookRef = firestore.collection('communityWordbooks').doc(wordbookId);
        const wordbookDoc = await wordbookRef.get();

        if (!wordbookDoc.exists) {
            return NextResponse.json({ message: '공유된 단어장을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 조회수 1 증가 (트랜잭션을 사용하지 않고 간단하게 처리)
        // 사용자가 페이지를 새로고침할 때마다 증가할 수 있음
        await wordbookRef.update({
            views: admin.firestore.FieldValue.increment(1)
        });

        const data = wordbookDoc.data();
        // 응답에는 증가된 조회수를 포함하여 반환
        return NextResponse.json({ id: wordbookDoc.id, ...data, views: (data?.views || 0) + 1 });

    } catch (error) {
        console.error("공유 단어장 상세 조회 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 공유 단어장 삭제
export async function DELETE(request: Request, { params }: { params: { wordbookId: string } }) {
    try {
        const headersList = await headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const { wordbookId } = params;

        const wordbookRef = firestore.collection('communityWordbooks').doc(wordbookId);
        const doc = await wordbookRef.get();

        if (!doc.exists) {
            return NextResponse.json({ message: '단어장을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 단어장 작성자만 삭제 가능
        if (doc.data()?.author.uid !== userId) {
            return NextResponse.json({ message: '단어장을 삭제할 권한이 없습니다.' }, { status: 403 });
        }

        await wordbookRef.delete();

        return new Response(null, { status: 204 }); // 성공적으로 삭제되었음을 의미

    } catch (error) {
        console.error("단어장 삭제 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
