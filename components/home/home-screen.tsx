"use client"


import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp } from "lucide-react"
import { PhotoWordCapture } from "@/components/camera/photo-word-capture"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "../ui/skeleton"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"


import { HomeStudyStatus } from "@/components/home/home-study-status"

interface HomeScreenProps {
  onWordbookSelect: (wordbook: any) => void
  activeTab: string
}

interface Wordbook {
  id: number
  name: string
  wordCount: number
  progress: number
  lastStudied?: string
  createdAt: string
}

interface TodayStats {
  wordsLearned: number;
  studyTime: number;
  streak: number;
}

export function HomeScreen({ onWordbookSelect, activeTab }: HomeScreenProps) {
  const router = useRouter();
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [recentWordbooks, setRecentWordbooks] = useState<Wordbook[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showStatsScreen, setShowStatsScreen] = useState(false);

  const [todayStats, setTodayStats] = useState<TodayStats>({
    wordsLearned: 0,
    studyTime: 0,
    streak: 0,
  })

  // (데이터 로딩 함수들은 기존과 동일)
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

  const fetchTodayStats = useCallback(async () => {
    try {
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
    }
  }, []);

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
  }, [fetchRecentWordbooks, fetchTodayStats]);


  // --- 이벤트 핸들러 ---
  const handleWordbookClick = (wordbook: Wordbook) => {
    onWordbookSelect(wordbook);
  };

  // [!!!] 6. '학습 현황' 카드 클릭 핸들러 수정
  const handleStatsCardClick = () => {
    setShowStatsScreen(true); // 내부 상태를 변경
  };

  // --- 렌더링 ---
  if (showPhotoCapture) {
    // ... (PhotoWordCapture 로직)
  }

  if (showStatsScreen) {
    return (
      <HomeStudyStatus
        onBack={() => setShowStatsScreen(false)}
      />
    );
  }

  // (기본) 홈 메인 화면
  return (
    <div className="flex-1 overflow-y-auto bg-background pb-20">
      <div className="p-4 space-y-6">
        {/* 환영 메시지 */}
        <div className="px-2">
          <h1 className="text-2xl font-bold text-foreground">안녕하세요! 👋</h1>
          <p className="text-muted-foreground">오늘도 즐겁게 단어를 학습해 보세요.</p>
        </div>

        {/* Today's Learning Status Card */}
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

        {/* Recent Wordbooks Section */}
        <div>
          <div className="flex justify-between items-center mb-3 px-2">
            <h2 className="text-lg font-semibold text-foreground">최근 단어장</h2>
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