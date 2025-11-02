// app/api/community/wordbooks/route.ts
import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';
import type { Query } from 'firebase-admin/firestore';

// [추가] 단어장 생성 시 사용하는 영문 key -> 커뮤니티용 한글 value 매핑
const CATEGORY_TRANSLATION_MAP: Record<string, string> = {
  // (create-wordbook-screen.tsx의 영문 value -> 한글 label)
  toeic: "토익",
  voca: "수능",
  exam: "시험",
  daily: "일상",
  travel: "여행",
  business: "비즈니스",
  free: "자유",
  etc: "기타",
  // (만약 단어장 생성 시 사용하는 다른 영문 value가 있다면 여기에 추가)
};


// 공유된 모든 단어장 목록 가져오기
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = (searchParams.get('sortBy') || 'createdAt').toLowerCase(); // 'createdAt' | 'downloads'
    const category = searchParams.get('category') || 'all'; // [수정] 카테고리 파라미터 읽기

    let query: Query = firestore.collection('communityWordbooks');

    // [수정] 카테고리 필터링 로직 추가 (Firestore 색인 필요)
    if (category !== 'all') {
      // (예: ...where('category', '==', '토익'))
      query = query.where('category', '==', category);
    }

    // [수정] 정렬 순서 변경 (필터링 -> 정렬)
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
    const h = await headers(); // [수정] 원본 파일대로 await 유지
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

    // [핵심 수정] 영문 카테고리를 한글로 번역
    const incomingCategory = String(category); // 예: "exam"
    const translatedCategory = CATEGORY_TRANSLATION_MAP[incomingCategory] || incomingCategory; // 예: "시험"
    // 만약 매핑에 없는 값이면 원본(아마도 영문)을 그대로 저장

    const newSharedWordbook = {
      originalWordbookId: String(wordbookId),
      name: String(name),
      description: description ? String(description) : '',
      category: translatedCategory, // [수정] 번역된 한글 카테고리를 저장
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