// app/api/community/wordbooks/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';
import type { Query } from 'firebase-admin/firestore';

// 공유된 모든 단어장 목록 가져오기
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = (searchParams.get('sortBy') || 'createdAt').toLowerCase(); // 'createdAt' | 'downloads'

    let query: Query = firestore.collection('communityWordbooks');

    if (sortBy === 'downloads') {
      query = query.orderBy('downloads', 'desc');
    } else {
      // createdAt 정렬 (서버 타임스탬프 사용 권장)
      query = query.orderBy('createdAt', 'desc');
    }

    const wordbooksSnapshot = await query.get();
    const wordbooks = wordbooksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(wordbooks, { status: 200 });
  } catch (error) {
    console.error('공유 단어장 목록 조회 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 새로운 단어장 공유하기
export async function POST(request: Request) {
  try {
    // ✅ headers()는 네 환경 기준 await 필요
    const h = await headers();
    const authHeader = h.get('Authorization') || h.get('authorization');
    const token = authHeader?.toString().replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const userRecord = await adminAuth.getUser(userId);

    const payload = await request.json();
    const { wordbookId, name, description, category, wordCount, words } = payload || {};

    if (!wordbookId || !name || !category) {
      return NextResponse.json(
        { message: 'wordbookId, name, category는 필수입니다.' },
        { status: 400 }
      );
    }

    const newSharedWordbook = {
      originalWordbookId: String(wordbookId),
      name: String(name),
      description: description ? String(description) : '',
      category: String(category),
      wordCount: Number.isFinite(Number(wordCount)) ? Number(wordCount) : Array.isArray(words) ? words.length : 0,
      words: Array.isArray(words) ? words : [], // 단어 목록 전체 포함 (필요 시 축약/인덱싱 고려)
      author: {
        uid: userId,
        name: userRecord.displayName || userRecord.email || '익명',
        photoURL: userRecord.photoURL || '',
      },
      likes: 0,
      likedBy: [] as string[],
      downloads: 0,
      views: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // ✅ 서버 타임스탬프
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection('communityWordbooks').add(newSharedWordbook);
    const saved = await docRef.get();
    const savedData = saved.data() || {};

    return NextResponse.json({ id: saved.id, ...savedData }, { status: 201 });
  } catch (error) {
    console.error('단어장 공유 오류:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
