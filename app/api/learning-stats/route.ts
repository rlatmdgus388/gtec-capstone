// app/api/learning-stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { firestore as adminDb, auth as adminAuth } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

// verifyIdToken 함수 정의 (가정)
async function verifyIdToken(token: string) {
  return adminAuth.verifyIdToken(token)
}

// GET 요청 처리: 사용자의 학습 통계 데이터 가져오기
export async function GET(req: NextRequest) {
  try {
    // 1. 인증 토큰 확인
    const authToken = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!authToken) {
      return NextResponse.json({ message: 'Authorization header is missing or invalid.' }, { status: 401 })
    }

    let decodedToken
    try {
      decodedToken = await verifyIdToken(authToken)
    } catch (authError: any) {
      console.error('Error verifying auth token:', authError)
      return NextResponse.json({ message: `Invalid or expired token: ${authError.message}` }, { status: 401 })
    }
    const userId = decodedToken.uid

    console.log(`Fetching learning stats for user: ${userId}`)

    // --- Firebase 데이터 조회 (시작) ---

    // ✅ [수정] KST 시간대 고려: 한국 시간 기준으로 오늘/내일 설정
    const KST_OFFSET = 9 * 60 * 60 * 1000 // 한국 시간 오프셋 (UTC+9)
    const now = new Date()
    const kstNow = new Date(now.getTime() + KST_OFFSET) // 현재 KST 시간

    // KST 기준 "오늘"의 시작 (KST 00:00:00)
    // KST의 00:00:00은 UTC로는 (KST - 9시간) 입니다.
    // Date.UTC(year, month, day, hour, min, sec) -> hour에 -9 적용
    const todayStart = new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate(), -9, 0, 0, 0))

    // KST 기준 "내일"의 시작 (KST 00:00:00)
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    // Firestore Timestamp 객체 생성 (로깅용)
    const todayStartTimestamp = Timestamp.fromDate(todayStart)
    const tomorrowStartTimestamp = Timestamp.fromDate(tomorrowStart)

    console.log(`Querying studySessions between ${todayStartTimestamp.toDate()} (UTC: ${todayStart.toISOString()}) and ${tomorrowStartTimestamp.toDate()} (UTC: ${tomorrowStart.toISOString()})`)

    // --- 예시 1: 오늘의 학습 기록 조회 ---
    const studyLogsSnapshot = await adminDb.collection('studySessions')
      .where('userId', '==', userId)
      // ✅ [수정] KST 기준으로 계산된 Date 객체 사용 (ISOString 변환 필요)
      .where('completedAt', '>=', todayStart.toISOString())
      .where('completedAt', '<', tomorrowStart.toISOString())
      .orderBy('completedAt', 'desc')
      .get()

    let wordsLearnedToday = 0
    let totalStudyTimeTodaySeconds = 0

    studyLogsSnapshot.forEach(doc => {
      const log = doc.data()
      const correctCount = log.correctWords?.length || 0
      const incorrectCount = log.incorrectWords?.length || 0
      wordsLearnedToday += (correctCount + incorrectCount)
      totalStudyTimeTodaySeconds += log.duration || 0
    })

    const totalStudyTimeToday = Math.round(totalStudyTimeTodaySeconds / 60) // 분 단위로 변환
    console.log(`Today's stats: ${wordsLearnedToday} words, ${totalStudyTimeToday} minutes`)

    // --- 예시 2: 연속 학습일 조회 ('users' 컬렉션 가정) ---
    const userProfileDoc = await adminDb.collection('users').doc(userId).get()
    const streak = userProfileDoc.data()?.streak || 0
    console.log(`User streak: ${streak}`)

    // --- 예시 3: 주간 학습 데이터 조회 (그래프용) ---
    const weeklyData = []
    // ✅ [수정] KST 기준 "7일 전"의 시작 (오늘 포함 7일)
    const weekAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000)
    const weekAgoTimestamp = Timestamp.fromDate(weekAgo) // 로깅용

    console.log(`Querying weekly studySessions from ${weekAgoTimestamp.toDate()} (UTC: ${weekAgo.toISOString()})`)

    const weeklyLogsSnapshot = await adminDb.collection('studySessions')
      .where('userId', '==', userId)
      // ✅ [수정] KST 기준으로 계산된 Date 객체 사용
      .where('completedAt', '>=', weekAgo.toISOString())
      .where('completedAt', '<', tomorrowStart.toISOString()) // 오늘까지
      .orderBy('completedAt', 'desc')
      .get()

    // 날짜별로 데이터 집계 (차트 표시는 KST 기준 MM/DD로)
    const dailyStats: { [key: string]: { words: number; time: number } } = {}
    
    // ✅ [수정] KST 기준으로 7일간의 날짜 문자열 생성
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000)
      // KST로 변환된 날짜 객체 (표시용)
      const dKst = new Date(d.getTime() + KST_OFFSET)
      // KST 날짜의 월/일 사용
      const dateString = `${dKst.getUTCMonth() + 1}/${dKst.getUTCDate()}`
      dailyStats[dateString] = { words: 0, time: 0 }
    }

    weeklyLogsSnapshot.forEach(doc => {
      const log = doc.data()
      const logDate = new Date(log.completedAt)
      
      // ✅ [수정] KST 기준으로 날짜 문자열 생성 (표시용)
      const logKstDate = new Date(logDate.getTime() + KST_OFFSET)
      const dateString = `${logKstDate.getUTCMonth() + 1}/${logKstDate.getUTCDate()}`

      if (dailyStats[dateString]) {
        const correctCount = log.correctWords?.length || 0
        const incorrectCount = log.incorrectWords?.length || 0
        dailyStats[dateString].words += (correctCount + incorrectCount)
        dailyStats[dateString].time += Math.round((log.duration || 0) / 60) // 분 단위로 변환
      }
    });

    // 배열로 변환 (날짜 순서대로 - 최근 7일)
    // ✅ [수정] KST 기준으로 7일간의 날짜 문자열 생성 (역순)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000)
      const dKst = new Date(d.getTime() + KST_OFFSET)
      const dateString = `${dKst.getUTCMonth() + 1}/${dKst.getUTCDate()}`
      weeklyData.push({ date: dateString, ...dailyStats[dateString] })
    }

    console.log('Weekly data calculated:', weeklyData)

    // --- Firebase 데이터 조회 (끝) ---

    // 3. 데이터 가공 및 응답 반환
    const statsData = {
      wordsLearned: wordsLearnedToday,
      studyTime: totalStudyTimeToday, // 분 단위
      streak: streak,
      weeklyData: weeklyData, // 그래프용 주간 데이터
    }

    console.log('Successfully fetched learning stats:', statsData)
    return NextResponse.json(statsData)

  } catch (error: any) {
    console.error('Error fetching learning stats:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ message: `Failed to fetch learning stats: ${errorMessage}` }, { status: 500 })
  }
}