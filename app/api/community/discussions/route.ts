// app/api/community/discussions/route.ts
import { NextResponse } from 'next/server'
import { firestore, auth as adminAuth } from '@/lib/firebase-admin'
import { headers } from 'next/headers'
import admin from 'firebase-admin'
import type { Query } from 'firebase-admin/firestore' // Query 타입 임포트

// 토론 목록 가져오기 (✨ 'hot' 정렬 추가)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const sortBy = searchParams.get('sortBy') || 'createdAt' // 'createdAt', 'likes', 'hot'
        const category = searchParams.get('category') || 'all'

        let query: Query = firestore.collection('discussions')

        // 카테고리 필터링
        if (category !== 'all') {
            query = query.where('category', '==', category)
        }

        // 정렬 로직
        if (sortBy === 'hot') {
            // ✨ 5번 요청: '핫' 게시판 로직 (좋아요 3개 이상, 좋아요순 정렬)
            query = query
                .where('likes', '>=', 3)
                .orderBy('likes', 'desc')
            // .orderBy('createdAt', 'desc') // [임시 주석] 색인 생성 완료 시 주석 해제
        } else if (sortBy === 'likes') {
            query = query.orderBy('likes', 'desc')
            // .orderBy('createdAt', 'desc') // [임시 주석] 색인 생성 완료 시 주석 해제
        } else {
            // 기본값 (createdAt)
            query = query.orderBy('createdAt', 'desc')
        }

        const snapshot = await query.get()
        const discussions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))

        return NextResponse.json(discussions, { status: 200 })
    } catch (error) {
        console.error('토론 목록 조회 오류:', error)
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
    }
}

// 새 토론 생성
export async function POST(request: Request) {
    try {
        const h = headers() // await 제거 (Next.js 14 기준)
        const authHeader = h.get('Authorization') || h.get('authorization')
        const token = authHeader?.toString().replace(/^Bearer\s+/i, '')

        if (!token) {
            return NextResponse.json({ message: '인증되지 않은 사용자입니다.' }, { status: 401 })
        }

        const decodedToken = await adminAuth.verifyIdToken(token)
        const userId = decodedToken.uid
        const userRecord = await adminAuth.getUser(userId)

        const payload = await request.json()
        const { title, content, category } = payload || {}

        if (!title || !content || !category) {
            return NextResponse.json(
                { message: '제목, 내용, 카테고리는 필수입니다.' },
                { status: 400 }
            )
        }

        const newDiscussion = {
            title: String(title),
            content: String(content),
            category: String(category),
            author: {
                uid: userId,
                name: userRecord.displayName || userRecord.email || '익명',
                photoURL: userRecord.photoURL || '',
            },
            likes: 0,
            likedBy: [] as string[],
            commentCount: 0,
            views: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }

        const docRef = await firestore.collection('discussions').add(newDiscussion)
        const saved = await docRef.get()
        const savedData = saved.data() || {}

        return NextResponse.json({ id: saved.id, ...savedData }, { status: 201 })
    } catch (error) {
        console.error('토론 생성 오류:', error)
        return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
    }
}