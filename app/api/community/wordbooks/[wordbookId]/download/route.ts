// app/api/community/wordbooks/[wordbookId]/download/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ wordbookId: string }> } // ✅ params는 Promise
) {
  try {
    // ✅ headers()는 await
    const h = await headers();
    const authHeader = h.get('Authorization') || h.get('authorization');
    const token = authHeader?.toString().replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const userId = decoded.uid;

    // ✅ params await 해서 wordbookId 추출
    const { wordbookId } = await params;

    const communityWordbookRef = firestore.collection('communityWordbooks').doc(wordbookId);
    const communityWordbookDoc = await communityWordbookRef.get();

    if (!communityWordbookDoc.exists) {
      return NextResponse.json({ message: '공유 단어장을 찾을 수 없습니다.' }, { status: 404 });
    }

    const wordbookData = communityWordbookDoc.data() || {};
    const words = Array.isArray(wordbookData.words) ? wordbookData.words : [];

    // 1) 내 단어장 컬렉션에 문서 생성 (add 대신 미리 doc() 만들어 id 확보)
    const newWordbookRef = firestore.collection('wordbooks').doc();
    await newWordbookRef.set({
      userId,
      name: wordbookData.name ?? '',
      description: wordbookData.description ?? '',
      category: wordbookData.category ?? '',
      wordCount: Number.isFinite(Number(wordbookData.wordCount))
        ? Number(wordbookData.wordCount)
        : words.length,
      progress: 0,
      source: wordbookId, // 원본 출처
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // ✅ 서버 타임스탬프
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2) 단어들(words)을 서브컬렉션으로 복사
    if (words.length > 0) {
      const batch = firestore.batch();
      for (const w of words) {
        const wordRef = newWordbookRef.collection('words').doc();
        batch.set(wordRef, {
          ...w,
          mastered: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(), // ✅ 서버 타임스탬프
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
