import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

// 특정 단어를 수정합니다 (예: 암기 여부).
export async function PUT(request: Request, { params }: { params: { wordbookId: string, wordId: string } }) {
  try {
    const { wordbookId, wordId } = params;
    const { mastered } = await request.json();

    await firestore
      .collection('wordbooks')
      .doc(wordbookId)
      .collection('words')
      .doc(wordId)
      .update({ mastered });

    return NextResponse.json({ message: '단어가 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error("단어 수정 오류:", error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 특정 단어를 삭제합니다.
export async function DELETE(request: Request, { params }: { params: { wordbookId: string, wordId: string } }) {
    try {
        const { wordbookId, wordId } = params;

        await firestore
            .collection('wordbooks')
            .doc(wordbookId)
            .collection('words')
            .doc(wordId)
            .delete();
        
        // 단어장 문서의 wordCount 필드 1 감소
        await firestore.collection('wordbooks').doc(wordbookId).update({
          wordCount: admin.firestore.FieldValue.increment(-1)
        });

        return new Response(null, { status: 204 }); // No Content
    } catch (error) {
        console.error("단어 삭제 오류:", error);
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}