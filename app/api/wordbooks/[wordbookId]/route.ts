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

    // [수정] lastStudied를 Firestore Timestamp로 갱신 (형식 통일)
    await wordbookRef.update({
      lastStudied: admin.firestore.FieldValue.serverTimestamp()
    });

    // createdAt 기준으로만 정렬하여 *모든* 단어를 불러옵니다.
    const wordsSnapshot = await wordbookRef.collection('words')
      .orderBy("createdAt", "desc")
      .get();

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
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 특정 단어장 정보를 수정합니다.
export async function PUT(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  try {
    const { wordbookId } = await params;
    const body = await request.json();

    const updateData: { [key: string]: any } = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // [수정] 정보 수정도 최신 활동으로 간주 (형식 통일)
      lastStudied: admin.firestore.FieldValue.serverTimestamp()
    };

    if (body.name !== undefined) {
      if (body.name === "") {
        return NextResponse.json({ message: '단어장 이름은 비워둘 수 없습니다.' }, { status: 400 });
      }
      updateData.name = body.name;
    }

    if (body.category !== undefined) {
      updateData.category = body.category;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    await firestore.collection('wordbooks').doc(wordbookId).update(updateData);

    return NextResponse.json({ message: '단어장이 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error("단어장 수정 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}


//
// [!!! 여기가 핵심 수정 사항입니다 !!!]
//
// 특정 단어장을 삭제합니다. (관련 학습 기록 포함)
export async function DELETE(request: Request, { params }: { params: Promise<{ wordbookId: string }> }) {
  try {
    const { wordbookId } = await params;

    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);

    // 2. [수정] 'studySessions' 컬렉션에서 'wordbookId'가 일치하는 문서를 찾음
    const studySessionsRef = firestore.collection('studySessions');
    const studySessionsSnapshot = await studySessionsRef.where('wordbookId', '==', wordbookId).get();

    // 3. 단어장 내부의 'words' 서브컬렉션 쿼리
    const wordsRef = wordbookRef.collection('words');
    const wordsSnapshot = await wordsRef.get();

    // 4. 하나의 배치(batch)로 모든 삭제 작업을 준비
    const batch = firestore.batch();

    // 4a. 모든 'words' 문서를 배치에 추가
    wordsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // 4b. [추가] 모든 관련 'studySessions' 문서를 배치에 추가
    studySessionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // 4c. 'wordbook' (부모 문서) 자체를 배치에 추가
    batch.delete(wordbookRef);

    // 5. 모든 삭제 작업을 한 번에 커밋
    await batch.commit();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("단어장 삭제 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}