import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// 특정 게시글 정보와 댓글 목록을 가져옵니다. (이 부분은 변경되지 않았습니다)
export async function GET(request: Request, { params }: { params: { postId: string } }) {
    try {
        const { postId } = params;
        const postDoc = await firestore.collection('discussions').doc(postId).get();

        if (!postDoc.exists) {
            return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        const commentsSnapshot = await firestore
            .collection('discussions')
            .doc(postId)
            .collection('comments')
            .orderBy('createdAt', 'asc')
            .get();

        const comments = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const post = { id: postDoc.id, ...postDoc.data(), comments };

        return NextResponse.json(post);
    } catch (error) {
        console.error("게시글 상세 조회 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 게시글 수정 (향상된 오류 처리 추가)
export async function PUT(request: Request, { params }: { params: { postId: string } }) {
    console.log(`PUT /api/community/discussions/${params.postId} - 요청 시작`);
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            console.log("인증 토큰 없음.");
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        console.log(`사용자 인증 성공: ${userId}`);

        const { postId } = params;
        const { title, content, category } = await request.json();

        if (!title || !content || !category) {
            return NextResponse.json({ message: '제목, 내용, 카테고리는 필수입니다.' }, { status: 400 });
        }

        const postRef = firestore.collection('discussions').doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            console.log(`게시글 없음: ${postId}`);
            return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        const postAuthorId = postDoc.data()?.author?.uid;
        console.log(`게시글 작성자: ${postAuthorId}, 현재 사용자: ${userId}`);

        if (postAuthorId !== userId) {
            console.log("권한 오류: 사용자가 게시글의 소유자가 아님.");
            return NextResponse.json({ message: '게시글을 수정할 권한이 없습니다.' }, { status: 403 });
        }

        console.log("권한 확인 완료, Firestore 업데이트 시작.");
        await postRef.update({
            title,
            content,
            category,
            updatedAt: new Date().toISOString()
        });
        console.log("Firestore 업데이트 성공.");

        const updatedPostDoc = await postRef.get();
        return NextResponse.json({ id: updatedPostDoc.id, ...updatedPostDoc.data() });

    } catch (error) {
        console.error("게시글 수정 API 오류:", error);
        if (error instanceof Error && 'code' in error) {
            return NextResponse.json({ message: `Firestore 오류: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 게시글 삭제 (향상된 오류 처리 추가)
export async function DELETE(request: Request, { params }: { params: { postId: string } }) {
    console.log(`DELETE /api/community/discussions/${params.postId} - 요청 시작`);
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            console.log("인증 토큰 없음.");
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        console.log(`사용자 인증 성공: ${userId}`);

        const { postId } = params;

        const postRef = firestore.collection('discussions').doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            console.log(`게시글 없음: ${postId}`);
            return NextResponse.json({ message: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        const postAuthorId = postDoc.data()?.author?.uid;
        console.log(`게시글 작성자: ${postAuthorId}, 현재 사용자: ${userId}`);

        if (postAuthorId !== userId) {
            console.log("권한 오류: 사용자가 게시글의 소유자가 아님.");
            return NextResponse.json({ message: '게시글을 삭제할 권한이 없습니다.' }, { status: 403 });
        }

        console.log("권한 확인 완료, 하위 컬렉션(댓글) 삭제 시작.");
        const commentsRef = postRef.collection('comments');
        const commentsSnapshot = await commentsRef.get();

        if (!commentsSnapshot.empty) {
            const batch = firestore.batch();
            commentsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`${commentsSnapshot.size}개의 댓글 삭제 완료.`);
        } else {
            console.log("삭제할 댓글 없음.");
        }

        console.log("게시글 본문 삭제 시작.");
        await postRef.delete();
        console.log("게시글 삭제 성공.");

        return new Response(null, { status: 204 });

    } catch (error) {
        console.error("게시글 삭제 API 오류:", error);
        if (error instanceof Error && 'code' in error) {
            return NextResponse.json({ message: `Firestore 오류: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
    }
}