// app/api/learning-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
// ⚠️ firebase-admin import 수정: verifyIdToken 포함 확인 (만약 별도 파일이라면 해당 파일 import)
import { firestore as adminDb, auth as adminAuth } from '@/lib/firebase-admin'; // 'auth' import 추가 가정
import { Timestamp } from 'firebase-admin/firestore'; // Firestore Timestamp 타입

// verifyIdToken 함수 정의 (만약 lib/firebase-admin.ts에 없다면 여기에 추가 또는 별도 import)
// 예시: 실제 구현은 다를 수 있습니다.
async function verifyIdToken(token: string) {
  // adminAuth.verifyIdToken이 lib/firebase-admin.ts 에서 export 되었다고 가정
  return adminAuth.verifyIdToken(token);
}


// GET 요청 처리: 사용자의 학습 통계 데이터 가져오기
export async function GET(req: NextRequest) {
  try {
    // 1. 인증 토큰 확인 및 사용자 ID 가져오기
    const authToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authToken) {
      // ⚠️ 상세 에러 메시지 추가
      return NextResponse.json({ message: 'Authorization header is missing or invalid.' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await verifyIdToken(authToken);
    } catch (authError: any) {
      console.error('Error verifying auth token:', authError);
      // ⚠️ 토큰 검증 실패 시 상세 에러 메시지 추가
      return NextResponse.json({ message: `Invalid or expired token: ${authError.message}` }, { status: 401 });
    }
    const userId = decodedToken.uid;

    console.log(`Fetching learning stats for user: ${userId}`); // 사용자 ID 로그 추가

    // --- Firebase 데이터 조회 (시작) ---
    // !!! ⬇️ 실제 Firestore 데이터 구조에 맞게 컬렉션 및 필드 이름을 수정해야 합니다 ⬇️ !!!
    // 예: 'studyLogs' -> 실제 학습 기록 컬렉션 이름
    // 예: 'timestamp', 'wordsLearned', 'durationMinutes', 'streak' -> 실제 필드 이름

    // --- 예시 1: 오늘의 학습 기록 조회 ('studySessions' 컬렉션 사용 가정) ---
    const today = new Date();
    // ⚠️ KST 시간대 고려: 한국 시간 기준으로 오늘/내일 설정
    const KST_OFFSET = 9 * 60 * 60 * 1000; // 한국 시간 오프셋 (UTC+9)
    // ⚠️ UTC 자정 기준으로 날짜 생성 후 KST 오프셋 적용하지 않도록 수정 (Firestore는 UTC 기준 처리)
    const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Firestore Timestamp 객체 생성 (로깅용)
    const todayStartTimestamp = Timestamp.fromDate(todayStart);
    const tomorrowStartTimestamp = Timestamp.fromDate(tomorrowStart);

    // ⚠️ console.log 수정: Firestore Timestamp 객체의 toDate() 사용
    console.log(`Querying studySessions between ${todayStartTimestamp.toDate()} and ${tomorrowStartTimestamp.toDate()}`);

    const studyLogsSnapshot = await adminDb.collection('studySessions') // ⚠️ 컬렉션 이름: 'studySessions' 로 변경 가정
      .where('userId', '==', userId) // ⚠️ userId 필터 추가
      // ⚠️ JavaScript Date 객체의 toISOString() 직접 사용
      .where('completedAt', '>=', todayStart.toISOString())
      .where('completedAt', '<', tomorrowStart.toISOString())
      .orderBy('completedAt', 'desc') // 👈 *** 수정된 부분: 기존 색인과 일치하도록 추가 ***
      .get();

    let wordsLearnedToday = 0;
    let totalStudyTimeTodaySeconds = 0; // 초 단위로 변경

    studyLogsSnapshot.forEach(doc => {
      const log = doc.data();
      // ⚠️ 필드 이름: correctWords, incorrectWords 배열 길이 합산, duration (초 단위)
      const correctCount = log.correctWords?.length || 0;
      const incorrectCount = log.incorrectWords?.length || 0;
      wordsLearnedToday += (correctCount + incorrectCount);
      totalStudyTimeTodaySeconds += log.duration || 0; // 'duration' 필드가 초 단위라고 가정
    });

    const totalStudyTimeToday = Math.round(totalStudyTimeTodaySeconds / 60); // 분 단위로 변환

    console.log(`Today's stats: ${wordsLearnedToday} words, ${totalStudyTimeToday} minutes`);

    // --- 예시 2: 연속 학습일 조회 ('users' 컬렉션 가정) ---
    const userProfileDoc = await adminDb.collection('users').doc(userId).get();
    const streak = userProfileDoc.data()?.streak || 0; // 'streak' 필드 이름 가정
    console.log(`User streak: ${streak}`);

    // --- 예시 3: 주간 학습 데이터 조회 (그래프용, 'studySessions' 컬렉션 가정) ---
    const weeklyData = [];
    // ⚠️ UTC 자정 기준으로 7일 전 계산
    const weekAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000); // 7일 전 (오늘 포함)
    const weekAgoTimestamp = Timestamp.fromDate(weekAgo); // 로깅용 Firestore Timestamp

    // ⚠️ console.log 수정: Firestore Timestamp 객체의 toDate() 사용
    console.log(`Querying weekly studySessions from ${weekAgoTimestamp.toDate()}`);

    const weeklyLogsSnapshot = await adminDb.collection('studySessions')
      .where('userId', '==', userId) // ⚠️ userId 필터 추가
      // ⚠️ JavaScript Date 객체의 toISOString() 직접 사용
      .where('completedAt', '>=', weekAgo.toISOString())
      .where('completedAt', '<', tomorrowStart.toISOString()) // 오늘까지
      // 👇 --- 이 부분은 이전에 수정한 대로 'desc' 유지 --- 👇
      .orderBy('completedAt', 'desc') // ⚠️ 필드 이름: 'completedAt'
      .get();

    // 날짜별로 데이터 집계 (차트 표시는 로컬 시간 기준 MM/DD로)
    const dailyStats: { [key: string]: { words: number; time: number } } = {};
    for (let i = 0; i < 7; i++) {
      // 로컬 시간 기준으로 날짜 계산 (표시용)
      const dLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dateString = `${dLocal.getMonth() + 1}/${dLocal.getDate()}`; // 'MM/DD' 형식
      dailyStats[dateString] = { words: 0, time: 0 };
    }

    weeklyLogsSnapshot.forEach(doc => {
      const log = doc.data();
      const logDate = new Date(log.completedAt);
      // 로컬 시간 기준으로 날짜 문자열 생성 (표시용)
      const dateString = `${logDate.getMonth() + 1}/${logDate.getDate()}`;

      if (dailyStats[dateString]) {
        // ⚠️ 필드 이름: correctWords, incorrectWords 배열 길이 합산, duration (초 단위)
        const correctCount = log.correctWords?.length || 0;
        const incorrectCount = log.incorrectWords?.length || 0;
        dailyStats[dateString].words += (correctCount + incorrectCount);
        dailyStats[dateString].time += Math.round((log.duration || 0) / 60); // 분 단위로 변환
      }
    });

    // 배열로 변환 (날짜 순서대로 - 최근 7일)
    for (let i = 6; i >= 0; i--) {
      // 로컬 시간 기준으로 날짜 계산 (표시용)
      const dLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dateString = `${dLocal.getMonth() + 1}/${dLocal.getDate()}`;
      weeklyData.push({ date: dateString, ...dailyStats[dateString] });
    }

    console.log('Weekly data calculated:', weeklyData);

    // --- Firebase 데이터 조회 (끝) ---


    // 3. 데이터 가공 및 응답 반환
    const statsData = {
      wordsLearned: wordsLearnedToday,
      studyTime: totalStudyTimeToday, // 분 단위
      streak: streak,
      weeklyData: weeklyData, // 그래프용 주간 데이터
    };

    console.log('Successfully fetched learning stats:', statsData);
    return NextResponse.json(statsData);

  } catch (error: any) { // ⚠️ 'any' 타입 사용 (혹은 더 구체적인 타입 정의)
    // ⚠️ 상세 에러 로깅 추가
    console.error('Error fetching learning stats:', error);

    // ⚠️ 클라이언트에 구체적인 에러 메시지 반환
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // ⚠️ 에러 응답 본문에 'message' 필드를 포함하도록 수정
    return NextResponse.json({ message: `Failed to fetch learning stats: ${errorMessage}` }, { status: 500 });
  }
}

