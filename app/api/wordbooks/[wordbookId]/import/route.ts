// app/api/wordbooks/[wordbookId]/import/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db, admin } from '@/lib/firebase-admin'; // admin 유틸리티 임포트

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
        const wordsCollectionRef = db.collection('words');
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        let importedCount = 0;

        for (const word of wordsToImport) {
            // 기본 유효성 검사 (original과 meaning은 필수)
            if (word.original && word.meaning) {
                const newWordRef = wordsCollectionRef.doc(); // 새 문서 참조 생성
                batch.set(newWordRef, {
                    userId: userId,
                    wordbookId: wordbookId,
                    original: word.original,
                    text: word.text || word.original, // text가 없으면 original로 대체
                    partOfSpeech: word.partOfSpeech || 'n', // 기본값 'n'
                    meaning: word.meaning,
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
            return NextResponse.json({ message: 'Words array was empty or invalid' }, { status: 400 });
        }

        // 4. 단어장
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