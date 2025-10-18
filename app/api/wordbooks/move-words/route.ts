import { NextResponse } from 'next/server';
import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import admin from 'firebase-admin';

export async function POST(request: Request) {
    try {
        const headersList = headers();
        const token = headersList.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const { sourceWordbookId, destinationWordbookId, wordIds } = await request.json();

        if (!sourceWordbookId || !destinationWordbookId || !Array.isArray(wordIds) || wordIds.length === 0) {
            return NextResponse.json({ message: '잘못된 요청입니다.' }, { status: 400 });
        }

        const sourceWordbookRef = firestore.collection('wordbooks').doc(sourceWordbookId);
        const destinationWordbookRef = firestore.collection('wordbooks').doc(destinationWordbookId);

        // Firestore 트랜잭션을 사용하여 데이터 일관성 보장
        await firestore.runTransaction(async (transaction) => {
            const [sourceDoc, destinationDoc] = await Promise.all([
                transaction.get(sourceWordbookRef),
                transaction.get(destinationWordbookRef),
            ]);

            if (!sourceDoc.exists || sourceDoc.data()?.userId !== userId) {
                throw new Error('소스 단어장을 찾을 수 없거나 권한이 없습니다.');
            }
            if (!destinationDoc.exists || destinationDoc.data()?.userId !== userId) {
                throw new Error('목적지 단어장을 찾을 수 없거나 권한이 없습니다.');
            }

            const wordsToMove = [];
            const sourceWordsRef = sourceWordbookRef.collection('words');

            for (const wordId of wordIds) {
                const wordDoc = await transaction.get(sourceWordsRef.doc(wordId));
                if (wordDoc.exists) {
                    wordsToMove.push({ id: wordId, data: wordDoc.data() });
                }
            }

            if (wordsToMove.length === 0) {
                return; // 이동할 단어가 없음
            }

            const destinationWordsRef = destinationWordbookRef.collection('words');

            // 단어 이동 (소스에서 삭제, 목적지에 추가)
            for (const word of wordsToMove) {
                transaction.delete(sourceWordsRef.doc(word.id));
                transaction.set(destinationWordsRef.doc(), word.data);
            }

            // 각 단어장의 단어 수 업데이트
            transaction.update(sourceWordbookRef, {
                wordCount: admin.firestore.FieldValue.increment(-wordsToMove.length)
            });
            transaction.update(destinationWordbookRef, {
                wordCount: admin.firestore.FieldValue.increment(wordsToMove.length)
            });
        });

        return NextResponse.json({ message: `${wordIds.length}개의 단어가 성공적으로 이동되었습니다.` });

    } catch (error) {
        console.error("단어 이동 오류:", error);
        const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
