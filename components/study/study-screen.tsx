"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image" // Image 컴포넌트를 사용하기 위해 import
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// Drawer 관련 import 제거
import { GraduationCap, Clock } from "lucide-react" // Play, BookOpen, PenTool, Brain 제거
import { FlashcardMode } from "./flashcard-mode"
import { QuizMode } from "./quiz-mode"
import { WritingMode } from "./writing-mode"
import { AutoplayMode } from "./autoplay-mode"
import { StudyResults } from "./study-results"
import { StudyHistoryScreen } from "./study-history-screen"
import { StudySessionDetailScreen } from "./study-session-detail"
import { fetchWithAuth } from "@/lib/api"
// ✅ [수정] Skeleton 임포트 경로 변경
import { Skeleton } from "@/components/ui/skeleton"
// ✅ [수정] Loader2 임포트 제거 (미사용)
import { StudyOptionsScreen } from "./study-options-screen" // StudyOptionsScreen 임포트

// Word 인터페이스 수정 (mastered 옵셔널 추가)
interface Word {
  id: string
  word: string
  meaning: string
  example?: string
  pronunciation?: string
  mastered?: boolean // 옵션 화면 또는 리뷰 화면에서 오는 단어 타입 맞추기
}

// 학습 기록 표시에 필요하므로 유지
interface StudySession {
  id: string
  wordbookName: string
  mode: string
  score: number
  duration: number // 초 단위
  completedAt: string
}

// 학습 기록 상세에서 리뷰시 사용되므로 유지
interface WordResult {
  id: string // 타입을 string으로 통일
  word: string
  meaning: string
}

interface StudyScreenProps {
  selectedWordbookId?: string | null // 이 prop은 이제 사용되지 않지만, 유지
  refreshKey: number // ✅ [추가]
}

export function StudyScreen({ selectedWordbookId, refreshKey }: StudyScreenProps) {
  // ✅ [수정]
  const [selectedModeInfo, setSelectedModeInfo] = useState<{ id: string; name: string } | null>(null) // selectedMode -> selectedModeInfo
  const [writingModeType, setWritingModeType] = useState<"word" | "meaning">("word")

  // 새 학습 세션을 위한 state 추가
  const [studyWords, setStudyWords] = useState<Word[]>([])
  const [studyContext, setStudyContext] = useState<{ wordbookId: string; wordbookName: string } | null>(null)

  const [studyResults, setStudyResults] = useState<any>(null)
  const [isHistoryVisible, setIsHistoryVisible] = useState(false)
  const [reviewWords, setReviewWords] = useState<any[] | null>(null)
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null)

  const [recentSessions, setRecentSessions] = useState<StudySession[]>([])
  const [isLoading, setIsLoading] = useState({ sessions: true }) // wordbooks, words 로딩 제거

  const fetchRecentSessions = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, sessions: true }))
    try {
      const data = await fetchWithAuth("/api/study-sessions")
      setRecentSessions(data || [])
    } catch (error) {
      console.error("최근 학습 기록 로딩 실패:", error)
    } finally {
      setIsLoading((prev) => ({ ...prev, sessions: false }))
    }
  }, [])

  useEffect(() => {
    fetchRecentSessions()
  }, [fetchRecentSessions])

  // ✅ [추가] refreshKey가 변경되면 모든 내부 화면을 끄고 메인으로 리셋
  useEffect(() => {
    if (refreshKey > 0) {
      // 초기 렌더링(0)시 실행 방지
      setSelectedModeInfo(null)
      setStudyWords([])
      setStudyContext(null)
      setStudyResults(null)
      setIsHistoryVisible(false)
      setReviewWords(null)
      setSelectedSession(null)
    }
  }, [refreshKey])

  const studyModes = [
    {
      id: "flashcard",
      name: "플래시카드",
      description: "카드를 넘기며 단어 학습",
      src: "/icons/flash.svg",
    },
    {
      id: "autoplay",
      name: "자동재생",
      description: "자동으로 단어와 뜻 재생",
      src: "/icons/auto.svg",
    },
    {
      id: "writing",
      name: "받아쓰기",
      description: "직접 단어를 입력하여 학습",
      src: "/icons/write.svg",
    },
    {
      id: "quiz",
      name: "객관식 퀴즈",
      description: "객관식 문제로 실력 테스트",
      src: "/icons/quiz.svg",
    },
  ]

  const handleModeSelect = (mode: { id: string; name: string }) => {
    setSelectedModeInfo(mode)
  }

  const handleStartStudy = (options: {
    words: Word[]
    modeId: string
    wordbookId: string
    wordbookName: string
    writingType?: "word" | "meaning"
  }) => {
    setStudyWords(options.words)
    setStudyContext({ wordbookId: options.wordbookId, wordbookName: options.wordbookName })
    setSelectedModeInfo({ id: options.modeId, name: studyModes.find((m) => m.id === options.modeId)!.name })
    if (options.modeId === "writing" && options.writingType) {
      setWritingModeType(options.writingType)
    }
    setReviewWords(null)
  }

  const handleStudyComplete = async (results: {
    correct: number
    total: number
    timeSpent: number
    correctWords?: string[]
    incorrectWords?: string[]
  }) => {
    const isReviewSession = !!reviewWords
    if (isReviewSession) {
      setStudyResults({ ...results, mode: selectedModeInfo?.id, isReview: true, reviewWords: reviewWords })
      setSelectedModeInfo(null)
      setReviewWords(null)
      return
    }

    const currentWordbook = studyContext
    const modeName = selectedModeInfo?.name || "학습"

    setStudyResults({ ...results, mode: selectedModeInfo?.id, isReview: false })
    setSelectedModeInfo(null)
    setStudyWords([])
    setStudyContext(null)

    if (currentWordbook && results.total > 0) {
      try {
        await fetchWithAuth("/api/study-sessions", {
          method: "POST",
          body: JSON.stringify({
            wordbookId: currentWordbook.wordbookId,
            wordbookName: currentWordbook.wordbookName,
            mode: modeName,
            score: Math.round((results.correct / results.total) * 100),
            duration: results.timeSpent,
            correctWords: results.correctWords || [],
            incorrectWords: results.incorrectWords || [],
          }),
        })
        fetchRecentSessions()
      } catch (error) {
        console.error("학습 기록 저장 실패:", error)
      }
    }
  }

  const handleAutoplayComplete = async () => {
    const wordsToUse = reviewWords || studyWords
    const timeSpent = wordsToUse.length * 3
    const isReviewSession = !!reviewWords

    if (isReviewSession) {
      setStudyResults({
        correct: wordsToUse.length,
        total: wordsToUse.length,
        timeSpent,
        mode: "autoplay",
        isReview: true,
        reviewWords: reviewWords,
      })
      setSelectedModeInfo(null)
      setReviewWords(null)
      return
    }

    const currentWordbook = studyContext
    const modeName = "자동재생"

    setStudyResults({ correct: wordsToUse.length, total: wordsToUse.length, timeSpent, mode: "autoplay", isReview: false })
    setSelectedModeInfo(null)
    setStudyWords([])
    setStudyContext(null)

    if (currentWordbook) {
      try {
        await fetchWithAuth("/api/study-sessions", {
          method: "POST",
          body: JSON.stringify({
            wordbookId: currentWordbook.wordbookId,
            wordbookName: currentWordbook.wordbookName,
            mode: modeName,
            score: 100,
            duration: timeSpent,
            correctWords: wordsToUse.map((w) => w.id),
            incorrectWords: [],
          }),
        })
        fetchRecentSessions()
      } catch (error) {
        console.error("학습 기록 저장 실패:", error)
      }
    }
  }

  const handleRestart = () => {
    const results = studyResults
    setStudyResults(null)
    if (results.isReview) {
      setReviewWords(results.reviewWords)
    }
    setSelectedModeInfo({ id: results.mode, name: studyModes.find((m) => m.id === results.mode)!.name })
  }

  const handleHomeFromResults = () => {
    const wasReviewing = studyResults?.isReview
    setStudyResults(null)
    if (wasReviewing) {
      setIsHistoryVisible(true)
    } else {
      setStudyWords([])
      setStudyContext(null)
    }
    fetchRecentSessions()
    window.scrollTo(0, 0)
  }

  const handleBackFromStudy = () => {
    setSelectedModeInfo(null)
    setReviewWords(null)
    setStudyWords([])
    setStudyContext(null)
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffInSeconds < 60) return "방금 전"
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}시간 전`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "어제"
    return `${diffInDays}일 전`
  }

  const handleStartReview = (mode: string, wordsToReview: WordResult[], writingType?: "word" | "meaning") => {
    if (mode === "writing" && writingType) {
      setWritingModeType(writingType)
    }
    setReviewWords(wordsToReview)
    setSelectedModeInfo({ id: mode, name: studyModes.find((m) => m.id === mode)!.name })
    setStudyWords([])
    setStudyContext(null)
  }

  const wordsForSession = reviewWords || studyWords

  // --- 뷰 렌더링 로직 ---

  // 1. 학습 옵션 화면
  if (selectedModeInfo && !reviewWords && studyWords.length === 0) {
    return (
      <StudyOptionsScreen
        modeId={selectedModeInfo.id}
        modeName={selectedModeInfo.name}
        onBack={() => setSelectedModeInfo(null)}
        onStartStudy={handleStartStudy}
      />
    )
  }

  // 2. 학습 진행 화면
  if (selectedModeInfo && wordsForSession && wordsForSession.length > 0) {
    switch (selectedModeInfo.id) {
      case "flashcard":
        return <FlashcardMode words={wordsForSession} onComplete={handleStudyComplete} onBack={handleBackFromStudy} />
      case "quiz":
        return <QuizMode words={wordsForSession} onComplete={handleStudyComplete} onBack={handleBackFromStudy} />
      case "writing":
        return (
          <WritingMode
            words={wordsForSession}
            onComplete={handleStudyComplete}
            onBack={handleBackFromStudy}
            type={writingModeType}
          />
        )
      case "autoplay":
        return <AutoplayMode words={wordsForSession} onComplete={handleAutoplayComplete} onBack={handleBackFromStudy} />
      default:
        handleBackFromStudy()
        return null
    }
  }

  // 3. 학습 결과 화면
  if (studyResults) {
    const modeName = studyModes.find((m) => m.id === studyResults.mode)?.name || "학습"
    return <StudyResults results={studyResults} mode={modeName} onRestart={handleRestart} onHome={handleHomeFromResults} />
  }

  // 4. 학습 기록 상세 화면
  if (selectedSession) {
    return <StudySessionDetailScreen session={selectedSession} onBack={() => setSelectedSession(null)} onStartReview={handleStartReview} />
  }

  // 5. 전체 학습 기록 화면
  if (isHistoryVisible) {
    return <StudyHistoryScreen onBack={() => setIsHistoryVisible(false)} onStartReview={handleStartReview} />
  }

  // 6. 메인 학습 화면 (기본)
  return (
    // ✅ [수정] 'h-full flex flex-col' 적용
    <div className="h-full flex flex-col bg-background">
      {/* ✅ [수정] 고정될 헤더 영역. 'shrink-0' 추가 */}
      <div className="bg-card border-b border-border shrink-0">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <GraduationCap size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">학습하기</h1>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ [수정] 스크롤 영역. 'flex-1 overflow-y-auto pb-20' 적용 */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 pt-4 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">학습 모드</h2>
            <div className="grid grid-cols-2 gap-3">
              {studyModes.map((mode) => (
                <button
                  key={mode.id}
                  className="h-40 bg-card border border-border rounded-xl hover:shadow-md transition-all duration-200 p-3 flex flex-col items-center justify-center text-center space-y-2 group"
                  onClick={() => handleModeSelect(mode)}
                >
                  <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Image
                      src={mode.src}
                      alt={`${mode.name} 아이콘`}
                      width={40}
                      height={40}
                      className="text-white"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-base">{mode.name}</h3>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">최근 학습 기록</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsHistoryVisible(true)}>
                더보기
              </Button>
            </div>
            <div className="space-y-2">
              {isLoading.sessions ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : recentSessions.length === 0 ? (
                <Card className="border border-border rounded-xl bg-card">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    최근 학습 기록이 없습니다.
                  </CardContent>
                </Card>
              ) : (
                recentSessions.slice(0, 5).map((session) => (
                  <Card
                    key={session.id}
                    className="hover:shadow-md transition-all duration-200 cursor-pointer border border-border shadow-sm bg-card rounded-xl"
                    onClick={() => setSelectedSession(session)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-0.5 text-base">{session.wordbookName}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{session.mode}</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {session.duration < 60 ? `${session.duration}초` : `${Math.floor(session.duration / 60)}분`}
                            </span>
                            <span>{formatRelativeTime(session.completedAt)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{session.score}%</div>
                          <div className="text-[16px] text-muted-foreground">점수</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}