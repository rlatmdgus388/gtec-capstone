// app/api/wordbooks/[wordbookId]/import/route.ts
// (이 코드로 파일을 덮어쓰세요)

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db, admin } from '@/lib/firebase-admin';

// 불러올 단어의 예상 구조
interface ImportedWord {
    original: string;
    text: string;
    partOfSpeech: string;
    meaning: string;
}

export async function POST(
    request: Request,
    { params }: { params: { wordbookId: string } }
) {
    try {
        const { wordbookId } = params;
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
            if (word.original && word.meaning) {
                const newWordRef = wordsCollectionRef.doc();

                // [!!!] 최종 스키마 통일: 'original' 대신 'word' 필드에 저장하고, 'original' 필드는 제거
                batch.set(newWordRef, {
                    userId: userId,
                    wordbookId: wordbookId,
                    word: word.original, // <--- word 필드에 저장
                    meaning: word.meaning,
                    // CSV에서 가져온 부가 정보
                    text: word.text || word.original, // text 필드 유지
                    partOfSpeech: word.partOfSpeech || 'n', // partOfSpeech 필드 유지
                    // 표준 스키마를 위한 빈 필드
                    example: '',
                    pronunciation: '',
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
            return NextResponse.json({ message: 'Words array was empty or invalid (check original/meaning headers)' }, { status: 400 });
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