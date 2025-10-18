"use client"

import { useState, useEffect, useCallback } from "react"
<<<<<<< HEAD
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp, Clock, Star, Home } from "lucide-react"
=======
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp, Home } from "lucide-react"
>>>>>>> db7745a (다크모드, 프로필 설정)
import { PhotoWordCapture } from "@/components/camera/photo-word-capture"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "../ui/skeleton"

interface HomeScreenProps {
<<<<<<< HEAD
  onWordbookSelect: (wordbook: any) => void;
  activeTab: string;
}

interface Wordbook {
  id: number;
  name: string;
  wordCount: number;
  progress: number;
  lastStudied?: string;
  createdAt: string;
}


export function HomeScreen({ onWordbookSelect, activeTab }: HomeScreenProps) {
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [recentWordbooks, setRecentWordbooks] = useState<Wordbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
=======
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

export function HomeScreen({ onWordbookSelect, activeTab }: HomeScreenProps) {
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [recentWordbooks, setRecentWordbooks] = useState<Wordbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
>>>>>>> db7745a (다크모드, 프로필 설정)

  const [todayStats] = useState({
    wordsLearned: 12,
    studyTime: 25,
    streak: 7,
  })

  const fetchRecentWordbooks = useCallback(async () => {
<<<<<<< HEAD
    setIsLoading(true);
    try {
      const allWordbooks = await fetchWithAuth('/api/wordbooks');
      if (allWordbooks && allWordbooks.length > 0) {
        // 클라이언트 사이드에서 lastStudied 기준으로 정렬합니다.
        const sorted = allWordbooks.sort((a: any, b: any) => {
          const dateA = new Date(a.lastStudied || a.createdAt).getTime();
          const dateB = new Date(b.lastStudied || b.createdAt).getTime();
          return dateB - dateA;
        });
        setRecentWordbooks(sorted.slice(0, 3));
      } else {
        setRecentWordbooks([]);
      }
    } catch (error) {
      console.error("최근 단어장 로딩 실패:", error);
      setRecentWordbooks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'home') {
      fetchRecentWordbooks();
    }
  }, [activeTab, fetchRecentWordbooks]);

=======
    setIsLoading(true)
    try {
      const allWordbooks = await fetchWithAuth("/api/wordbooks")
      if (allWordbooks && allWordbooks.length > 0) {
        // 클라이언트 사이드에서 lastStudied 기준으로 정렬합니다.
        const sorted = allWordbooks.sort((a: any, b: any) => {
          const dateA = new Date(a.lastStudied || a.createdAt).getTime()
          const dateB = new Date(b.lastStudied || b.createdAt).getTime()
          return dateB - dateA
        })
        setRecentWordbooks(sorted.slice(0, 3))
      } else {
        setRecentWordbooks([])
      }
    } catch (error) {
      console.error("최근 단어장 로딩 실패:", error)
      setRecentWordbooks([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "home") {
      fetchRecentWordbooks()
    }
  }, [activeTab, fetchRecentWordbooks])
>>>>>>> db7745a (다크모드, 프로필 설정)

  const handleWordsAdded = (words: any[], wordbookId: number) => {
    console.log("Words added:", words, "to wordbook:", wordbookId)
  }

  const handleWordbookClick = (wordbook: any) => {
<<<<<<< HEAD
    onWordbookSelect(wordbook);
  }

  if (showPhotoCapture) {
    return <PhotoWordCapture imageData={null} onClose={() => setShowPhotoCapture(false)} onWordsAdded={handleWordsAdded} />
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-xl flex items-center justify-center">
              <Home size={24} className="text-[#FF7A00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">안녕하세요!</h1>
              <p className="text-sm text-gray-600">오늘의 단어, 시작해볼까요?</p>
            </div>
          </div>
          <Badge className="bg-[#FF7A00] text-white border-0 px-3 py-1 text-sm font-medium">
=======
    onWordbookSelect(wordbook)
  }

  if (showPhotoCapture) {
    return (
      <PhotoWordCapture imageData={null} onClose={() => setShowPhotoCapture(false)} onWordsAdded={handleWordsAdded} />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-background">
      <div className="bg-card border-b border-border px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Home size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">안녕하세요!</h1>
              <p className="text-sm text-muted-foreground">오늘의 단어, 시작해볼까요?</p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground border-0 px-3 py-1 text-sm font-medium">
>>>>>>> db7745a (다크모드, 프로필 설정)
            {todayStats.streak}일 연속
          </Badge>
        </div>
      </div>

      <div className="px-6 py-4 space-y-6">
<<<<<<< HEAD
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardHeader className="pb-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-black">
              <TrendingUp size={20} className="text-[#FF7A00]" />
=======
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardHeader className="pb-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
              <TrendingUp size={20} className="text-primary" />
>>>>>>> db7745a (다크모드, 프로필 설정)
              오늘의 학습 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
<<<<<<< HEAD
                <div className="text-2xl font-bold text-[#FF7A00] mb-1">{todayStats.wordsLearned}</div>
                <div className="text-xs text-gray-600 font-medium">학습한 단어</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FF7A00] mb-1">{todayStats.studyTime}</div>
                <div className="text-xs text-gray-600 font-medium">분 학습</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FF7A00] mb-1">{todayStats.streak}</div>
                <div className="text-xs text-gray-600 font-medium">일 연속</div>
=======
                <div className="text-2xl font-bold text-primary mb-1">{todayStats.wordsLearned}</div>
                <div className="text-xs text-muted-foreground font-medium">학습한 단어</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{todayStats.studyTime}</div>
                <div className="text-xs text-muted-foreground font-medium">분 학습</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{todayStats.streak}</div>
                <div className="text-xs text-muted-foreground font-medium">일 연속</div>
>>>>>>> db7745a (다크모드, 프로필 설정)
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center mb-4">
<<<<<<< HEAD
            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
              <BookOpen size={20} className="text-[#FF7A00]" />
=======
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <BookOpen size={20} className="text-primary" />
>>>>>>> db7745a (다크모드, 프로필 설정)
              최근 단어장
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : recentWordbooks.length === 0 ? (
<<<<<<< HEAD
            <Card className="text-center py-12 border-dashed border-gray-300 rounded-xl">
              <CardContent>
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">단어장이 없습니다</h3>
                <p className="text-sm text-gray-500">
                  '단어장' 탭에서 첫 단어장을 추가해보세요!
                </p>
=======
            <Card className="text-center py-12 border-dashed border-border rounded-xl">
              <CardContent>
                <BookOpen size={48} className="mx-auto text-muted mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">단어장이 없습니다</h3>
                <p className="text-sm text-muted-foreground">'단어장' 탭에서 첫 단어장을 추가해보세요!</p>
>>>>>>> db7745a (다크모드, 프로필 설정)
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentWordbooks.map((wordbook) => (
                <Card
                  key={wordbook.id}
<<<<<<< HEAD
                  className="bg-white border border-gray-200 hover:shadow-md transition-all cursor-pointer rounded-xl"
=======
                  className="bg-card border border-border hover:shadow-md transition-all cursor-pointer rounded-xl"
>>>>>>> db7745a (다크모드, 프로필 설정)
                  onClick={() => handleWordbookClick(wordbook)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
<<<<<<< HEAD
                        <h3 className="font-semibold text-black text-base mb-1">{wordbook.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
=======
                        <h3 className="font-semibold text-card-foreground text-base mb-1">{wordbook.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
>>>>>>> db7745a (다크모드, 프로필 설정)
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {wordbook.wordCount}개 단어
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
<<<<<<< HEAD
                        <div className="text-base font-bold text-[#FF7A00] mb-1">{wordbook.progress}%</div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-[#FF7A00] rounded-full transition-all"
=======
                        <div className="text-base font-bold text-primary mb-1">{wordbook.progress}%</div>
                        <div className="w-16 h-2 bg-muted rounded-full">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
>>>>>>> db7745a (다크모드, 프로필 설정)
                            style={{ width: `${wordbook.progress}%` }}
                          />
                        </div>
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
<<<<<<< HEAD
}
=======
}
>>>>>>> db7745a (다크모드, 프로필 설정)
