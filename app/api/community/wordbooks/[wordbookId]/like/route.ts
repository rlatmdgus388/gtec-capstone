// app/api/community/wordbooks/[wordbookId]/like/route.ts
import { NextResponse } from 'next/server'
import { firestore, auth as adminAuth } from '@/lib/firebase-admin'
import { headers } from 'next/headers'
import admin from 'firebase-admin'

// 단어장 좋아요 / 좋아요 취소 (토글)
export async function POST(
  request: Request,
  { params }: { params: { wordbookId: string } }
) {
  try {
    const { wordbookId } = params

    const h = headers()
    const authHeader = h.get('Authorization') || h.get('authorization')
    const token = authHeader?.toString().replace(/^Bearer\s+/i, '')

    if (!token) {
      return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    const wordbookRef = firestore.collection('communityWordbooks').doc(wordbookId)

    // ✨ 1번 요청: 트랜잭션을 사용하여 좋아요/취소 동시 처리
    const result = await firestore.runTransaction(async (transaction) => {
      const wordbookDoc = await transaction.get(wordbookRef)
      if (!wordbookDoc.exists) {
        throw new Error('단어장을 찾을 수 없습니다.')
      }

      const data = wordbookDoc.data()!
      const likedBy = (data.likedBy || []) as string[]
      let newLikes = data.likes || 0
      let isLiked = false

      if (likedBy.includes(userId)) {
        // --- 좋아요 취소 ---
        transaction.update(wordbookRef, {
          likes: admin.firestore.FieldValue.increment(-1),
          likedBy: admin.firestore.FieldValue.arrayRemove(userId),
        })
        newLikes--
        isLiked = false
      } else {
        // --- 좋아요 ---
        transaction.update(wordbookRef, {
          likes: admin.firestore.FieldValue.increment(1),
          likedBy: admin.firestore.FieldValue.arrayUnion(userId),
        })
        newLikes++
        isLiked = true
      }

      return { newLikes, isLiked }
    })

    // ✨ 프론트엔드 상태 관리를 위해 좋아요 수와 여부 반환
    return NextResponse.json(result, { status: 200 })

  } catch (error: any) {
    console.error('좋아요 처리 오류:', error)
    if (error.message === '단어장을 찾을 수 없습니다.') {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}