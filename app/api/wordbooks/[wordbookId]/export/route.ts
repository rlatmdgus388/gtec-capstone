// app/api/wordbooks/[wordbookId]/export/route.ts
import { NextResponse } from 'next/server';
import { db, auth as adminAuth } from '@/lib/firebase-admin';

// CSV 필드 이스케이프 헬퍼 함수
function escapeCSV(field: string | undefined | null): string {
    if (field === null || field === undefined) {
        return '""'; // 필드가 없으면 빈 따옴표("") 반환
    }
    const str = String(field);
    if (/[",\r\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
}

// Word 타입을 가정 (프로젝트에 맞게 수정)
interface Word {
    id: string;
    original: string; // W
    text: string; // D
    partOfSpeech: string; // P
    meaning: string; // M
    // ... other fields
}

// [!!!] CSV 열 순서 (W, M, D, P) - 요청대로 수정됨
function convertToCSV(words: Word[]): string {
    if (!words.length) {
        // 헤더만 있는 CSV 파일 (BOM 문자 추가 - Excel 한글 깨짐 방지)
        // [수정] 헤더 변경
        return '\uFEFFW,M,D,P\n';
    }

    // [수정] 헤더 순서 변경 (요청대로)
    const headers = ['W', 'M', 'D', 'P'];
    // Excel에서 한글이 깨지지 않도록 BOM(Byte Order Mark) 추가
    const csvRows = ['\uFEFF' + headers.join(',')]; // 헤더 행

    for (const word of words) {
        // [수정] 값(value) 순서를 W, M, D, P 순서로 변경
        const values = [
            escapeCSV(word.original),     // W
            escapeCSV(word.meaning),      // M
            escapeCSV(word.text),         // D (4번째: 텍스트 (메모))
            escapeCSV(word.partOfSpeech), // P (3번째: 품사 (발음))
        ];
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

export async function GET(
    request: Request,
    { params }: { params: { wordbookId: string } }
) {
    try {
        const { wordbookId } = params;

        // 1. 사용자 인증 (필수)
        const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!idToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const userId = decodedToken.uid;

        // 2. 단어장 소유권 확인 (필수)
        const wordbookRef = db.collection('wordbooks').doc(wordbookId);
        const wordbookDoc = await wordbookRef.get();

        if (!wordbookDoc.exists || wordbookDoc.data()?.userId !== userId) {
            return NextResponse.json({ message: 'Wordbook not found or access denied' }, { status: 404 });
        }
        const wordbookName = wordbookDoc.data()?.name || 'export';

        // 3. 단어장 쿼리 (UI API와 동일하게)
        // 'words' 서브컬렉션을 쿼리합니다.
        const wordsQuery = db
            .collection('wordbooks')
            .doc(wordbookId)
            .collection('words')
            .orderBy('createdAt', 'desc');

        const wordsSnapshot = await wordsQuery.get();

        // [!!!] 4. 데이터 매핑 수정 (매핑 교체)
        // Firestore 필드명을 CSV 필드명에 맞게 매핑합니다.
        // 이 부분은 그대로 둡니다. CSV 변환 함수에서 순서만 바꿉니다.
        const words: Word[] = wordsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                // 'original' (W) <- data.word 또는 data.original (Firestore)
                original: data.word || data.original || "",

                // 'text' (D) <- data.example (Firestore '메모메모')
                text: data.example || data.text || data.Text || "",

                // 'partOfSpeech' (P) <- data.pronunciation (Firestore '발음')
                partOfSpeech: data.pronunciation || data.partOfSpeech || data.PartOfSpeech || "",

                // 'meaning' (M) <- data.meaning (Firestore)
                meaning: data.meaning || data.Meaning || "",
            };
        });

        // 5. CSV 데이터로 변환 (수정된 convertToCSV 함수 사용)
        const csvData = convertToCSV(words);

        // 6. 안전한 파일명 생성
        const safeFilename = wordbookName.replace(/[\\/:*?"<>|]/g, '_') + '.csv';

        // 7. CSV 응답 반환
        return new Response(csvData, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="export.csv"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`,
            },
        });

    } catch (error: any) {
        console.error('Failed to export wordbook:', error);

        if (error.code === 9) { // 색인(Index) 오류일 경우
            console.error(">>> Firestore 색인이 필요합니다! 터미널의 링크를 클릭하여 생성하세요.");
        }

        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ message: 'Token expired' }, { status: 401 });
        }
        return NextResponse.json(
            { message: 'Internal Server Error', error: String(error) },
            { status: 500 }
        );
    }
}