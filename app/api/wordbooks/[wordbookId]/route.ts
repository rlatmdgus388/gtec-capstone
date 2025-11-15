// app/api/wordbooks/[wordbookId]/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

// 특정 단어장 정보와 포함된 단어 목록을 가져옵니다.
export async function GET(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  try {
    const { wordbookId } = await params;

    const headersList = await headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);
    const wordbookDoc = await wordbookRef.get();

    if (!wordbookDoc.exists || wordbookDoc.data()?.userId !== userId) {
      return NextResponse.json({ message: '단어장을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 });
    }

    // lastStudied 필드를 현재 시간으로 업데이트합니다.
    await wordbookRef.update({ lastStudied: new Date().toISOString() });

    //
    // [!!! 여기가 수정된 부분입니다 !!!]
    // createdAt 기준으로만 정렬하여 *모든* 단어를 불러옵니다.
    const wordsSnapshot = await wordbookRef.collection('words')
      .orderBy("createdAt", "desc") // 1순위: 생성시간 내림차순 (최신순)
      .get();
    // [!!! 수정 완료 !!!]
    //

    const words = wordsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id
      };
    });

    const wordbookData = wordbookDoc.data();

    return NextResponse.json({
      ...wordbookData,
      id: wordbookDoc.id,
      words: words
    });
  } catch (error: any) {
    console.error("단어장 상세 조회 오류:", error);
    // (색인 오류 감지 코드 제거)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// [!!! 여기를 수정합니다 !!!]
// 특정 단어장 정보를 수정합니다.
export async function PUT(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  try {
    const { wordbookId } = await params;
    // 1. 요청 본문(body)을 통째로 받습니다.
    const body = await request.json();

    // 2. 업데이트할 데이터 객체를 동적으로 구성합니다.
    const updateData: { [key: string]: any } = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 3. body에 'name' 필드가 있으면 updateData에 추가합니다.
    if (body.name !== undefined) {
      if (body.name === "") {
        return NextResponse.json({ message: '단어장 이름은 비워둘 수 없습니다.' }, { status: 400 });
      }
      updateData.name = body.name;
    }

    // 4. body에 'category' 필드가 있으면 updateData에 추가합니다.
    if (body.category !== undefined) {
      updateData.category = body.category;
    }

    // 5. body에 'description' 필드가 있으면 updateData에 추가합니다. (미래의 확장성을 위해)
    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    // 6. 동적으로 구성된 updateData 객체로 Firestore 문서를 업데이트합니다.
    await firestore.collection('wordbooks').doc(wordbookId).update(updateData);

    return NextResponse.json({ message: '단어장이 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error("단어장 수정 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
// [!!! 수정 끝 !!!]


// 특정 단어장을 삭제합니다.
export async function DELETE(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  // ... (기존 DELETE 함수와 동일)
  try {
    const { wordbookId } = await params;

    const wordsRef = firestore.collection('wordbooks').doc(wordbookId).collection('words');
    const wordsSnapshot = await wordsRef.get();

    const batch = firestore.batch();
    wordsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    await firestore.collection('wordbooks').doc(wordbookId).delete();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("단어장 삭제 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}