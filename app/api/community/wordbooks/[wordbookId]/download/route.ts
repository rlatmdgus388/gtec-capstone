// app/api/community/wordbooks/[wordbookId]/download/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ wordbookId: string }> }
) {
  try {
    const h = await headers();
    const authHeader = h.get('Authorization') || h.get('authorization');
    const token = authHeader?.toString().replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid; // 403 해결 (uid 가져오기)

    const { wordbookId } = await params;

    const communityWordbookRef = firestore.collection('communityWordbooks').doc(wordbookId);
    const communityWordbookDoc = await communityWordbookRef.get();

    if (!communityWordbookDoc.exists) {
      return NextResponse.json({ message: '공유 단어장을 찾을 수 없습니다.' }, { status: 404 });
    }

    const wordbookData = communityWordbookDoc.data() || {};
    // [수정됨] words 배열에 'id'가 포함되어 있다고 가정합니다.
    const words: any[] = Array.isArray(wordbookData.words) ? wordbookData.words : [];

    // 1) 내 단어장 컬렉션에 문서 생성
    const newWordbookRef = firestore.collection('wordbooks').doc();
    await newWordbookRef.set({
      userId: userId, // 403 해결 (uid를 userId 필드에 저장)
      name: wordbookData.name ?? '',
      description: wordbookData.description ?? '',
      category: wordbookData.category ?? '',
      wordCount: words.length, // [수정됨] words.length로 통일
      progress: 0,
      source: wordbookId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2) 단어들(words)을 서브컬렉션으로 복사
    if (words.length > 0) {
      const batch = firestore.batch();
      for (const w of words) {

        // 404 에러 해결: 원본 단어의 ID(w.id)를 새 문서의 ID로 사용합니다.
        const wordId = w.id || firestore.collection('dummy').doc().id;
        const wordRef = newWordbookRef.collection('words').doc(wordId);

        // [!!! 수정됨 !!!]
        // React Key/404 오류 해결: ...w (스프레드)를 사용하지 않고,
        // 필요한 필드만 명시적으로 복사하여 'id' 필드 오염을 막습니다.
        batch.set(wordRef, {
          word: w.word || '',
          meaning: w.meaning || '',
          example: w.example || '',
          pronunciation: w.pronunciation || '',
          // id: w.id, // [제거] id 필드를 데이터 안에 저장하지 않습니다.
          mastered: false, // 다운로드 시 암기 상태 초기화
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
    }

    // 3) 다운로드 수 증가
    await communityWordbookRef.update({
      downloads: admin.firestore.FieldValue.increment(1),
    });

    return NextResponse.json(
      {
        message: '단어장이 성공적으로 다운로드되었습니다.',
        newWordbookId: newWordbookRef.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('단어장 다운로드 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}