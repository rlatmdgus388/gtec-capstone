import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { headers } from 'next/headers';

// 특정 단어를 수정합니다. (진행률 업데이트 로직 추가 및 트랜잭션 순서 수정)
export async function PUT(request: Request, { params }: { params: { wordbookId: string, wordId: string } }) {
  try {
    // --- 인증 로직 ---
    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    // --- 인증 로직 끝 ---

    const { wordbookId, wordId } = params;
    const updateData = await request.json(); // 전체 업데이트 데이터 받기

    // 유효성 검사: mastered 필드가 포함되어 있는지 확인
    const updatesMastered = updateData.mastered !== undefined;

    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);
    const wordRef = wordbookRef.collection('words').doc(wordId);

    // --- 단어장 소유권 확인 (트랜잭션 외부에서 수행) ---
    const wordbookDocInitial = await wordbookRef.get();
    if (!wordbookDocInitial.exists || wordbookDocInitial.data()?.userId !== userId) {
      // 오류 메시지에 wordbookId 포함
      return NextResponse.json({ message: `단어장(ID: ${wordbookId})을 찾을 수 없거나 수정 권한이 없습니다.` }, { status: 403 });
    }
    // --- 소유권 확인 끝 ---


    await firestore.runTransaction(async (transaction) => {
      // --- 모든 읽기 작업 먼저 수행 ---
      const wordDoc = await transaction.get(wordRef);
      if (!wordDoc.exists) {
        // <<--- 수정된 오류 메시지: wordId 포함 --- >>
        throw new Error(`단어장(ID: ${wordbookId})에서 ID '${wordId}'를 가진 단어를 찾을 수 없습니다.`);
      }

      let newProgress = wordbookDocInitial.data()?.progress ?? 0; // 기본값 설정

      // mastered 상태가 변경된 경우 진행률 계산을 위해 모든 단어 읽기
      if (updatesMastered) {
        const wordsSnapshot = await transaction.get(wordbookRef.collection('words'));
        const totalWords = wordsSnapshot.size;
        let masteredCount = 0;

        wordsSnapshot.forEach(doc => {
          const wordData = doc.data();
          if (doc.id === wordId) { // 현재 업데이트되는 단어
            if (updateData.mastered === true) {
              masteredCount++;
            }
          } else if (wordData.mastered === true) { // 다른 단어들
            masteredCount++;
          }
        });
        newProgress = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
      }
      // --- 읽기 작업 끝 ---

      // --- 모든 쓰기 작업 수행 ---
      // 1. 단어 업데이트
      transaction.update(wordRef, updateData);

      // 2. 필요시 단어장 진행률 업데이트
      if (updatesMastered) {
        transaction.update(wordbookRef, { progress: newProgress });
      }
      // --- 쓰기 작업 끝 ---
    });

    return NextResponse.json({ message: '단어가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error("단어 수정 및 진행률 업데이트 오류:", error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    // <<--- 오류 메시지를 그대로 클라이언트에 전달 --- >>
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// 특정 단어를 삭제합니다. (진행률 업데이트 로직 추가 및 트랜잭션 순서 수정)
export async function DELETE(request: Request, { params }: { params: { wordbookId: string, wordId: string } }) {
  try {
    // --- 인증 로직 ---
    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    // --- 인증 로직 끝 ---

    const { wordbookId, wordId } = params;
    const wordbookRef = firestore.collection('wordbooks').doc(wordbookId);
    const wordRef = wordbookRef.collection('words').doc(wordId);

    // --- 단어장 소유권 확인 (트랜잭션 외부에서 수행) ---
    const wordbookDocInitial = await wordbookRef.get();
    if (!wordbookDocInitial.exists || wordbookDocInitial.data()?.userId !== userId) {
      // <<--- 수정된 오류 메시지: wordbookId 포함 --- >>
      return NextResponse.json({ message: `단어장(ID: ${wordbookId})을 찾을 수 없거나 삭제 권한이 없습니다.` }, { status: 403 });
    }
    // --- 소유권 확인 끝 ---

    await firestore.runTransaction(async (transaction) => {
      // --- 모든 읽기 작업 먼저 수행 ---
      const wordDoc = await transaction.get(wordRef);
      if (!wordDoc.exists) {
        // <<--- 수정된 오류 메시지: wordId 포함 --- >>
        throw new Error(`단어장(ID: ${wordbookId})에서 ID '${wordId}'를 가진 단어를 찾을 수 없습니다.`);
      }

      // 삭제 후 진행률 계산을 위해 모든 단어 읽기
      const wordsSnapshot = await transaction.get(wordbookRef.collection('words'));

      let totalWordsAfterDelete = 0;
      let masteredCountAfterDelete = 0;

      wordsSnapshot.forEach(doc => {
        if (doc.id !== wordId) { // 삭제될 단어 제외
          totalWordsAfterDelete++;
          if (doc.data().mastered === true) {
            masteredCountAfterDelete++;
          }
        }
      });

      const newProgress = totalWordsAfterDelete > 0 ? Math.round((masteredCountAfterDelete / totalWordsAfterDelete) * 100) : 0;
      // --- 읽기 작업 끝 ---

      // --- 모든 쓰기 작업 수행 ---
      // 1. 단어 삭제
      transaction.delete(wordRef);

      // 2. 단어장 업데이트 (단어 수 감소 및 진행률 업데이트)
      transaction.update(wordbookRef, {
        wordCount: admin.firestore.FieldValue.increment(-1),
        progress: newProgress
      });
      // --- 쓰기 작업 끝 ---
    });

    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("단어 삭제 및 진행률 업데이트 오류:", error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    // <<--- 오류 메시지를 그대로 클라이언트에 전달 --- >>
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
