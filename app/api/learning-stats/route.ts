// app/api/learning-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore'; // Firestore Timestamp 타입

// GET 요청 처리: 사용자의 학습 통계 데이터 가져오기
export async function GET(req: NextRequest) {
  try {
    // 1. 인증 토큰 확인 및 사용자 ID 가져오기
    const authToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // --- Firebase 데이터 조회 (시작) ---
    // !!! 실제 Firestore 데이터 구조에 맞게 이 부분을 수정해야 합니다 !!!

    // --- 예시 1: 오늘의 학습 기록 조회 (studyLogs 컬렉션 가정) ---
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 시작 시간 (KST 기준)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // 내일 시작 시간

    const todayStartTimestamp = Timestamp.fromDate(today);
    const tomorrowStartTimestamp = Timestamp.fromDate(tomorrow);

    const studyLogsSnapshot = await adminDb.collection('users').doc(userId)
                                      .collection('studyLogs') // 가정: 학습 기록 컬렉션 이름
                                      .where('timestamp', '>=', todayStartTimestamp) // 가정: timestamp 필드
                                      .where('timestamp', '<', tomorrowStartTimestamp)
                                      .get();

    let wordsLearnedToday = 0;
    let totalStudyTimeToday = 0; // 분 단위

    studyLogsSnapshot.forEach(doc => {
      const log = doc.data();
      wordsLearnedToday += log.wordsLearned || 0; // 가정: 학습 단어 수 필드
      totalStudyTimeToday += log.durationMinutes || 0; // 가정: 학습 시간(분) 필드
    });

    // --- 예시 2: 연속 학습일 조회 (userProfiles 컬렉션 가정) ---
    const userProfileDoc = await adminDb.collection('users').doc(userId).get(); // 사용자 프로필 문서
    const streak = userProfileDoc.data()?.streak || 0; // 가정: 연속 학습일 필드

    // --- 예시 3: 주간 학습 데이터 조회 (그래프용, studyLogs 컬렉션 가정) ---
    const weeklyData = [];
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6); // 7일 전 (오늘 포함)
    const weekAgoTimestamp = Timestamp.fromDate(weekAgo);

    const weeklyLogsSnapshot = await adminDb.collection('users').doc(userId)
                                      .collection('studyLogs')
                                      .where('timestamp', '>=', weekAgoTimestamp)
                                      .where('timestamp', '<', tomorrowStartTimestamp) // 오늘까지
                                      .orderBy('timestamp', 'asc')
                                      .get();

    // 날짜별로 데이터 집계 (간단한 예시)
    const dailyStats: { [key: string]: { words: number; time: number } } = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateString = `${d.getMonth() + 1}/${d.getDate()}`; // 'MM/DD' 형식
        dailyStats[dateString] = { words: 0, time: 0 };
    }

    weeklyLogsSnapshot.forEach(doc => {
        const log = doc.data();
        const logDate = (log.timestamp as Timestamp).toDate();
        const dateString = `${logDate.getMonth() + 1}/${logDate.getDate()}`;
        if (dailyStats[dateString]) {
            dailyStats[dateString].words += log.wordsLearned || 0;
            dailyStats[dateString].time += log.durationMinutes || 0;
        }
    });

    // 배열로 변환 (날짜 순서대로)
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateString = `${d.getMonth() + 1}/${d.getDate()}`;
        weeklyData.push({ date: dateString, ...dailyStats[dateString] });
    }

    // --- Firebase 데이터 조회 (끝) ---


    // 3. 데이터 가공 및 응답 반환
    const statsData = {
      wordsLearned: wordsLearnedToday,
      studyTime: totalStudyTimeToday,
      streak: streak,
      weeklyData: weeklyData, // 그래프용 주간 데이터
    };

    return NextResponse.json(statsData);

  } catch (error) {
    console.error('Error fetching learning stats:', error);
    if (error instanceof Error && error.message.includes('verifyIdToken')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch learning stats' }, { status: 500 });
  }
}