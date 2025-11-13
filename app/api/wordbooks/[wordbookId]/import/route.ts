// app/api/wordbooks/[wordbookId]/import/route.ts
// [수정] W, M, D, P 헤더를 매핑하도록 변경

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db, admin } from '@/lib/firebase-admin';

// [수정] 불러올 단어의 예상 구조 (any[]로 변경하여 W, M, D, P 키를 동적으로 받음)
interface ImportedWord {
    W?: string; // 단어
    M?: string; // 뜻
    D?: string; // 메모
    P?: string; // 발음
    [key: string]: any; // 다른 행은 무시
}

export async function POST(
    request: Request,
    { params }: { params: { wordbookId: string } }
) {
    try {
        const { wordbookId } = params;
        // [수정] 타입을 any[] 또는 ImportedWord[]로 받음
        const wordsToImport = (await request.json()) as ImportedWord[];

        if (!Array.isArray(wordsToImport) || wordsToImport.length === 0) {
            return NextResponse.json({ message: 'No words to import' }, { status: 400 });
        }

        // 1. 사용자 인증
        const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!idToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const userId = decodedToken.uid;

        // 2. 단어장 소유권 확인
        const wordbookRef = db.collection('wordbooks').doc(wordbookId);
        const wordbookDoc = await wordbookRef.get();

        if (!wordbookDoc.exists || wordbookDoc.data()?.userId !== userId) {
            return NextResponse.json({ message: 'Wordbook not found or access denied' }, { status: 404 });
        }

        // 3. Batch Write를 사용하여 모든 단어를 원자적으로 추가
        const batch = db.batch();
        const wordsCollectionRef = wordbookRef.collection('words');
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        let importedCount = 0;

        for (const word of wordsToImport) {
            // [수정] W(단어)와 M(뜻)이 있는지 확인
            if (word.W && word.M) {
                const newWordRef = wordsCollectionRef.doc();

                // [!!!] 최종 스키마 통일: W, M, D, P를 DB 필드에 매핑
                batch.set(newWordRef, {
                    userId: userId,
                    wordbookId: wordbookId,
                    word: word.W,           // W -> word (단어)
                    meaning: word.M,       // M -> meaning (뜻)
                    example: word.D || '', // D -> example (메모)
                    pronunciation: word.P || '', // P -> pronunciation (발음)

                    // 기존 스키마 호환 및 기본값
                    text: word.W, // text 필드는 word.W (단어) 값으로 채움
                    partOfSpeech: 'n', // partOfSpeech는 기본값 'n'으로 설정
                    mastered: false,
                    createdAt: timestamp,
                    lastStudied: null,
                    studyCount: 0,
                    correctCount: 0,
                    incorrectCount: 0,
                    memorized: false,
                });
                importedCount++;
            }
        }

        if (importedCount === 0) {
            // [수정] 오류 메시지 변경
            return NextResponse.json({ message: 'Words array was empty or invalid (check W and M headers)' }, { status: 400 });
        }

        // 4. 단어장 메타데이터 업데이트 (총 단어 수 증가)
        batch.update(wordbookRef, {
            wordCount: admin.firestore.FieldValue.increment(importedCount),
        });

        // 5. 배치 커밋
        await batch.commit();

        return NextResponse.json({ message: 'Import successful', importedCount });

    } catch (error: any) {
        console.error('Failed to import words:', error);
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ message: 'Token expired' }, { status: 401 });
        }
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}