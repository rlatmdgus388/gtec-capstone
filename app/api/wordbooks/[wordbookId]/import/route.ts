// app/api/wordbooks/[wordbookId]/import/route.ts
// [Final Fix] 'memorized' 대신 'mastered' 필드를 기준으로 진행도 계산
// [Fix] Next.js 15 'params' 경고 수정
// [Fix] validWordsToAdd 타입 추론 오류 수정 (any[] 명시)
// [수정] CSV 순서 보장을 위한 importOrder 필드 추가

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db, admin } from '@/lib/firebase-admin';

interface ImportedWord {
    W?: string;
    M?: string;
    D?: string;
    P?: string;
    [key: string]: any;
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ wordbookId: string }> }
) {
    try {
        const { wordbookId } = await params;
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
        const initialWordbookDoc = await wordbookRef.get();

        if (!initialWordbookDoc.exists || initialWordbookDoc.data()?.userId !== userId) {
            return NextResponse.json({ message: 'Wordbook not found or access denied' }, { status: 404 });
        }

        const wordsCollectionRef = wordbookRef.collection('words');
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        let importedCount = 0;

        // 3. 유효한 단어 목록 준비
        // [!!!] 여기가 수정된 부분입니다. (any[] 타입 추가)
        const validWordsToAdd: any[] = [];

        // [수정] CSV 순서 보장을 위해 for...of 대신 for 루프 사용
        for (let i = 0; i < wordsToImport.length; i++) {
            const word = wordsToImport[i];

            if (word.W && word.M) {
                importedCount++;
                validWordsToAdd.push({
                    userId: userId,
                    wordbookId: wordbookId,
                    word: word.W,
                    meaning: word.M,
                    example: word.D || '',
                    pronunciation: word.P || '',

                    text: word.W,
                    partOfSpeech: 'n',
                    mastered: false,
                    createdAt: timestamp,
                    lastStudied: null,
                    studyCount: 0,
                    correctCount: 0,
                    incorrectCount: 0,
                    memorized: false,
                    importOrder: i, // [수정] 순서 필드(importOrder) 추가
                });
            }
        }

        if (importedCount === 0) {
            return NextResponse.json({ message: 'Words array was empty or invalid (check W and M headers)' }, { status: 400 });
        }

        // 4. db.runTransaction 사용
        await db.runTransaction(async (transaction) => {
            const wordbookDoc = await transaction.get(wordbookRef);
            if (!wordbookDoc.exists) {
                throw new Error("단어장이 존재하지 않습니다.");
            }
            const wordbookData = wordbookDoc.data()!;

            // 'mastered' 단어를 쿼리
            const masteredWordsSnapshot = await transaction.get(
                wordsCollectionRef.where('mastered', '==', true)
            );

            const currentMasteredCount = masteredWordsSnapshot.size;
            const currentWordCount = wordbookData.wordCount || 0;

            // 5. 트랜잭션 내에서 단어 추가
            for (const newWordData of validWordsToAdd) {
                const newWordRef = wordsCollectionRef.doc();
                transaction.set(newWordRef, newWordData);
            }

            // 6. 트랜잭션 내에서 단어장 업데이트
            const newTotalWordCount = currentWordCount + importedCount;

            const newProgress = (newTotalWordCount > 0)
                ? Math.floor((currentMasteredCount / newTotalWordCount) * 100)
                : 0;

            transaction.update(wordbookRef, {
                wordCount: newTotalWordCount,
                progress: newProgress,
                masteredCount: currentMasteredCount,
            });
        });

        // 7. 트랜잭션 성공
        return NextResponse.json({ message: 'Import successful', importedCount });

    } catch (error: any) {
        console.error('Failed to import words:', error);

        if (error.code === 9 || (error.message && error.message.includes("index"))) {
            console.error("===================================================================");
            console.error(">>> Firestore 색인이 필요합니다! 터미널의 오류 메시지에 포함된 URL을 클릭하여 색인을 생성하세요.");
            console.error(">>> (쿼리: 'words' 컬렉션의 'mastered' 필드 단일 색인)");
            console.error("===================================================================");
            return NextResponse.json(
                { message: '데이터베이스 색인 작업이 필요합니다. 잠시 후 다시 시도해주세요.', detail: error.message },
                { status: 500 }
            );
        }

        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ message: 'Token expired' }, { status: 401 });
        }
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}