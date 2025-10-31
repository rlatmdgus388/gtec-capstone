// app/api/community/discussions/[postId]/comments/route.ts
import { NextResponse } from 'next/server'
import { firestore, auth as adminAuth } from '@/lib/firebase-admin'
import { headers } from 'next/headers'
import admin from 'firebase-admin'

// 특정 게시물의 댓글 목록 가져오기 (✨ 최신순 정렬 추가)
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params

    if (!postId) {
      return NextResponse.json({ message: 'Post ID가 필요합니다.' }, { status: 400 })
    }

    // ✨ 6번 요청: 'createdAt' 기준으로 내림차순(desc) 정렬하여 최신 댓글이 위로 오게 함
    const commentsSnapshot = await firestore
      .collection('discussions')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'desc') // 최신순 정렬
      .get()

    const comments = commentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(comments, { status: 200 })
  } catch (error) {
    console.error('댓글 목록 조회 오류:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 새 댓글 작성
export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    if (!postId) {
      return NextResponse.json({ message: 'Post ID가 필요합니다.' }, { status: 400 })
    }

    const h = headers()
    const authHeader = h.get('Authorization') || h.get('authorization')
    const token = authHeader?.toString().replace(/^Bearer\s+/i, '')

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid
    const userRecord = await adminAuth.getUser(userId)

    const payload = await request.json()
    const { content } = payload || {}

    if (!content) {
      return NextResponse.json({ message: '댓글 내용이 필요합니다.' }, { status: 400 })
    }

    const newComment = {
      content: String(content),
      author: {
        uid: userId,
        name: userRecord.displayName || userRecord.email || '익명',
        photoURL: userRecord.photoURL || '',
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const postRef = firestore.collection('discussions').doc(postId)
    const commentRef = await postRef.collection('comments').add(newComment)

    // 게시물 댓글 수 업데이트 (Transaction)
    await firestore.runTransaction(async (transaction) => {
      transaction.update(postRef, {
        commentCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), // 댓글 달릴 때 게시물 updatedAt 갱신
      })
    })

    const commentDoc = await commentRef.get()
    const commentData = commentDoc.data()

    return NextResponse.json({ id: commentDoc.id, ...commentData }, { status: 201 })
  } catch (error) {
    console.error('댓글 작성 오류:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}