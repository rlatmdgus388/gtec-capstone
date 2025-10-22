"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp } from "lucide-react" // 필요한 아이콘 확인
import { PhotoWordCapture } from "@/components/camera/photo-word-capture"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "../ui/skeleton"
import { useRouter } from 'next/navigation' // Next.js 라우터 훅 추가
import { Button } from "@/components/ui/button" // Button 컴포넌트 import 추가
import { Progress } from "@/components/ui/progress" // Progress 컴포넌트 import 추가

interface HomeScreenProps {
  onWordbookSelect: (wordbook: any) => void
  activeTab: string
  // onNavigate 프롭은 useRouter로 대체
}

interface Wordbook {
  id: number
  name: string
  wordCount: number
  progress: number
  lastStudied?: string
  createdAt: string
}

// 학습 통계 데이터 타입 정의 (실제 API 응답에 맞춰 수정 필요)
interface TodayStats {
    wordsLearned: number;
    studyTime: number; // 분 단위
    streak: number;
}

export function HomeScreen({ onWordbookSelect, activeTab }: HomeScreenProps) {
  const router = useRouter(); // 라우터 훅 사용
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [recentWordbooks, setRecentWordbooks] = useState<Wordbook[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // todayStats 상태 - 초기값 설정 및 실제 데이터 받을 준비
  const [todayStats, setTodayStats] = useState<TodayStats>({
    wordsLearned: 0,
    studyTime: 0,
    streak: 0,
  })

  // 단어장 데이터 가져오기
  const fetchRecentWordbooks = useCallback(async () => {
    try {
      const allWordbooks: Wordbook[] = await fetchWithAuth("/api/wordbooks")
      if (allWordbooks && allWordbooks.length > 0) {
        const sorted = [...allWordbooks].sort((a, b) => {
            const dateA = a.lastStudied || a.createdAt;
            const dateB = b.lastStudied || b.createdAt;
            const timeA = dateA ? new Date(dateA).getTime() : 0;
            const timeB = dateB ? new Date(dateB).getTime() : 0;
            return timeB - timeA;
        });
        setRecentWordbooks(sorted.slice(0, 3));
      } else {
        setRecentWordbooks([]);
      }
    } catch (error) {
      console.error("Failed to fetch wordbooks:", error)
      setRecentWordbooks([]);
    }
  }, []);

  // 오늘의 학습 현황 데이터 가져오기 (실제 API 경로로 수정 필요)
  const fetchTodayStats = useCallback(async () => {
    try {
      // '/api/learning-stats' API를 호출하여 데이터 가져오기 (API 구현 필요)
       const statsData = await fetchWithAuth("/api/learning-stats");
       if (statsData) {
           setTodayStats({
               wordsLearned: statsData.wordsLearned || 0,
               studyTime: statsData.studyTime || 0,
               streak: statsData.streak || 0
           });
       }
    } catch (error) {
        console.error("Failed to fetch today stats:", error);
        // 기본값 유지 또는 에러 처리
        // 예: toast({ title: "오류", description: "학습 현황을 불러오지 못했습니다.", variant: "destructive" });
    }
  }, []); // 의존성 배열 비워둠 (컴포넌트 마운트 시 한 번만 실행되도록)


  // 데이터 로딩 useEffect
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchRecentWordbooks(),
            fetchTodayStats()
        ]);
        setIsLoading(false);
    };
    loadData();
  }, [fetchRecentWordbooks, fetchTodayStats]); // 의존성 배열에 추가


  // --- 이벤트 핸들러 ---
  const handleWordbookClick = (wordbook: Wordbook) => {
    onWordbookSelect(wordbook);
  };

  // 오늘의 학습 현황 카드 클릭 시 /stats 페이지로 이동하는 핸들러
  const handleStatsCardClick = () => {
    router.push('/stats'); // '/stats' 경로로 페이지 이동
  };

  // --- 렌더링 ---
  if (showPhotoCapture) {
    // PhotoWordCapture 컴포넌트 렌더링
    // return <PhotoWordCapture onClose={() => setShowPhotoCapture(false)} ... />;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-20">
      <div className="p-4 space-y-6">
        {/* 환영 메시지 (이전 디자인 유지) */}
        <div className="px-2">
            <h1 className="text-2xl font-bold text-gray-800">안녕하세요! 👋</h1>
            <p className="text-gray-500">오늘도 즐겁게 단어를 학습해 보세요.</p>
        </div>

        {/* Today's Learning Status Card - 클릭 가능하게 변경 */}
        <div onClick={handleStatsCardClick} className="cursor-pointer">
          <Card className="border shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
                <TrendingUp size={20} className="text-primary" />
                오늘의 학습 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <Skeleton className="h-12 w-full rounded-md" />
                  <Skeleton className="h-12 w-full rounded-md" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{todayStats.wordsLearned}</p>
                    <p className="text-xs text-muted-foreground">학습 단어</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{todayStats.studyTime}<span className="text-sm">분</span></p>
                    <p className="text-xs text-muted-foreground">학습 시간</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{todayStats.streak}<span className="text-sm">일</span></p>
                    <p className="text-xs text-muted-foreground">연속 학습</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Wordbooks Section (기존 코드 유지) */}
        <div>
          <div className="flex justify-between items-center mb-3 px-2">
            <h2 className="text-lg font-semibold text-foreground">최근 단어장</h2>
            {/* '모두 보기' 버튼 (필요시 활성화) */}
            {/* <Button variant="link" size="sm" onClick={() => router.push('/vocabulary')} className="text-primary">모두 보기</Button> */}
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : recentWordbooks.length === 0 ? (
             <Card className="border border-border rounded-xl">
                 <CardContent className="p-6 text-center text-muted-foreground">
                   <p className="mb-4">아직 단어장이 없어요.</p>
                   {/* 단어장 탭으로 이동하는 버튼 (구현 방식에 따라 onNavigate 또는 router 사용) */}
                   {/* <Button size="sm" onClick={() => router.push('/vocabulary')}>단어장 만들러 가기</Button> */}
                 </CardContent>
               </Card>
          ) : (
            <div className="space-y-3">
              {recentWordbooks.map((wordbook) => (
                <Card
                  key={wordbook.id}
                  className="bg-card border border-border hover:shadow-md transition-all cursor-pointer rounded-xl"
                  onClick={() => handleWordbookClick(wordbook)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground text-base mb-1">{wordbook.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {wordbook.wordCount}개 단어
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-primary mb-1">{wordbook.progress}%</div>
                        {/* Progress 컴포넌트 사용 */}
                        <Progress value={wordbook.progress} className="w-16 h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}