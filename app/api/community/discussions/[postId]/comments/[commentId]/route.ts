// app/api/community/discussions/[postId]/comments/[commentId]/route.ts
import { NextResponse } from 'next/server'
import { firestore, auth as adminAuth } from '@/lib/firebase-admin'
import { headers } from 'next/headers'
import admin from 'firebase-admin'

// 인증 및 토큰 검증 헬퍼
async function verifyUser(request: Request) {
  const h = headers()
  const authHeader = h.get('Authorization') || h.get('authorization')
  const token = authHeader?.toString().replace(/^Bearer\s+/i, '')

  if (!token) {
    throw new Error('인증 토큰이 없습니다.')
  }

  const decodedToken = await adminAuth.verifyIdToken(token)
  return decodedToken.uid
}

// ✨ 2번 요청: 댓글 수정 (PUT)
export async function PUT(
  request: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const { postId, commentId } = params
    const userId = await verifyUser(request)
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ message: '댓글 내용이 필요합니다.' }, { status: 400 })
    }

    const commentRef = firestore
      .collection('discussions')
      .doc(postId)
      .collection('comments')
      .doc(commentId)

    const commentDoc = await commentRef.get()
    if (!commentDoc.exists) {
      return NextResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const commentData = commentDoc.data()
    // 본인 확인
    if (commentData?.author.uid !== userId) {
      return NextResponse.json({ message: '수정 권한이 없습니다.' }, { status: 403 })
    }

    // 댓글 업데이트
    await commentRef.update({
      content: String(content),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    const updatedCommentDoc = await commentRef.get()

    return NextResponse.json(
      { id: updatedCommentDoc.id, ...updatedCommentDoc.data() },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('댓글 수정 오류:', error)
    if (error.message.includes('인증')) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// ✨ 2번 요청: 댓글 삭제 (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const { postId, commentId } = params
    const userId = await verifyUser(request)

    const postRef = firestore.collection('discussions').doc(postId)
    const commentRef = postRef.collection('comments').doc(commentId)

    const commentDoc = await commentRef.get()
    if (!commentDoc.exists) {
      return NextResponse.json({ message: '댓글을 찾을 수 없습니다.' }, { status: 404 })
    }

    const commentData = commentDoc.data()
    // 본인 확인
    if (commentData?.author.uid !== userId) {
      return NextResponse.json({ message: '삭제 권한이 없습니다.' }, { status: 403 })
    }

    // 트랜잭션으로 댓글 삭제 및 게시물 댓글 수 감소
    await firestore.runTransaction(async (transaction) => {
      transaction.delete(commentRef)
      transaction.update(postRef, {
        commentCount: admin.firestore.FieldValue.increment(-1),
      })
    })

    return NextResponse.json(null, { status: 204 }) // 204 No Content
  } catch (error: any) {
    console.error('댓글 삭제 오류:', error)
    if (error.message.includes('인증')) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}