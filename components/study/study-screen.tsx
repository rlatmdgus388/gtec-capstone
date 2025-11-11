"use client"

import { useState, useEffect, useCallback, useMemo } from "react" // ✅ [추가] useMemo
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Clock } from "lucide-react"
import { FlashcardMode } from "./flashcard-mode"
import { QuizMode } from "./quiz-mode"
import { WritingMode } from "./writing-mode"
import { AutoplayMode } from "./autoplay-mode"
import { StudyResults } from "./study-results"
import { StudyHistoryScreen } from "./study-history-screen"
import { StudySessionDetailScreen } from "./study-session-detail"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { StudyOptionsScreen } from "./study-options-screen"

// Word 인터페이스 수정 (mastered 옵셔널 추가)
interface Word {
  id: string
  word: string
  meaning: string
  example?: string
  pronunciation?: string
  mastered?: boolean
}

// ✅ [수정] StudyHistoryScreen과 타입을 맞추기 위해 필드 추가
interface StudySession {
  id: string
  wordbookId: string // ✅ [추가]
  wordbookName: string
  mode: string
  score: number
  duration: number // 초 단위
  completedAt: string
  correctWords?: string[] // ✅ [추가]
  incorrectWords?: string[] // ✅ [추가]
}

// ✅ [추가] StudyHistoryScreen에서 가져옴
interface WordResult {
  id: string
  word: string
  meaning: string
}

// ✅ [추가] StudyHistoryScreen에서 가져옴
interface PeriodStats {
  correctCount: number
  incorrectCount: number
  sessions: StudySession[]
}
interface StudyStats {
  today: PeriodStats
  "7days": PeriodStats
}

interface StudyScreenProps {
  selectedWordbookId?: string | null
  refreshKey: number
}

export function StudyScreen({ selectedWordbookId, refreshKey }: StudyScreenProps) {
  const [selectedModeInfo, setSelectedModeInfo] = useState<{ id: string; name: string } | null>(null)
  const [writingModeType, setWritingModeType] = useState<"word" | "meaning">("word")

  const [studyWords, setStudyWords] = useState<Word[]>([])
  const [studyContext, setStudyContext] = useState<{ wordbookId: string; wordbookName: string } | null>(null)

  const [studyResults, setStudyResults] = useState<any>(null)
  const [isHistoryVisible, setIsHistoryVisible] = useState(false)
  const [reviewWords, setReviewWords] = useState<any[] | null>(null)
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null)

  // ✅ [수정] 'recentSessions' -> 'allSessions'로 변경 (모든 세션 관리)
  const [allSessions, setAllSessions] = useState<StudySession[]>([])
  // ✅ [수정] 'isLoading.sessions' -> 'isLoadingSessions'로 변경
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)

  // ✅ [추가] 'allIncorrectWords' 상태를 부모로 이동
  const [allIncorrectWords, setAllIncorrectWords] = useState<WordResult[]>([])

  // ✅ [수정] 'fetchRecentSessions' -> 'fetchAllSessions'로 변경
  const fetchAllSessions = useCallback(async () => {
    setIsLoadingSessions(true)
    try {
      const data: StudySession[] = await fetchWithAuth("/api/study-sessions")
      // ✅ [추가] StudyHistoryScreen과 동일한 데이터 처리
      const processedSessions = (data || []).map((s) => ({
        ...s,
        correctWords: s.correctWords || [],
        incorrectWords: s.incorrectWords || [],
      }))
      setAllSessions(processedSessions)
    } catch (error) {
      console.error("전체 학습 기록 로딩 실패:", error)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [])

  useEffect(() => {
    fetchAllSessions()
  }, [fetchAllSessions])

  // ✅ [추가] KST 기준으로 통계를 계산하는 useMemo를 StudyHistoryScreen에서 가져옴
  const stats: StudyStats = useMemo(() => {
    // KST (UTC+9) 오프셋
    const KST_OFFSET = 9 * 60 * 60 * 1000
    const now = new Date()
    const kstNow = new Date(now.getTime() + KST_OFFSET)

    // KST 기준 "오늘"의 시작 (UTC 시간)
    const todayStartKst = new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()))

    // KST 기준 "7일 전"의 시작 (오늘 포함 7일)
    const sevenDaysAgoStartKst = new Date(todayStartKst.getTime() - 6 * 24 * 60 * 60 * 1000)

    const periodStats: StudyStats = {
      today: { correctCount: 0, incorrectCount: 0, sessions: [] as StudySession[] },
      "7days": { correctCount: 0, incorrectCount: 0, sessions: [] as StudySession[] },
    }

    const incorrectWordIdMap = new Map<string, { wordbookId: string; wordId: string }>()

    for (const session of allSessions) {
      // DB에서 온 completedAt은 UTC ISO 문자열이므로 new Date()로 파싱하면 UTC 시간 객체가 됨
      const completedAt = new Date(session.completedAt)
      const correct = session.correctWords?.length || 0
      const incorrect = session.incorrectWords?.length || 0

      session.incorrectWords?.forEach((wordId) => {
        // wordbookId가 null이나 undefined가 아닌지 확인
        if (session.wordbookId) {
          incorrectWordIdMap.set(`${session.wordbookId}-${wordId}`, { wordbookId: session.wordbookId, wordId })
        }
      })

      // KST 오늘 시작 시간 (UTC)과 비교
      if (completedAt >= todayStartKst) {
        periodStats.today.correctCount += correct
        periodStats.today.incorrectCount += incorrect
        periodStats.today.sessions.push(session)
      }
      // KST 7일 전 시작 시간 (UTC)과 비교
      if (completedAt >= sevenDaysAgoStartKst) {
        periodStats["7days"].correctCount += correct
        periodStats["7days"].incorrectCount += incorrect
        periodStats["7days"].sessions.push(session)
      }
    }

    // `allSessions`가 변경될 때마다(새로고침될 때마다) 전체 오답 목록도 다시 계산
    if (incorrectWordIdMap.size > 0) {
      fetchWithAuth("/api/word", { method: "POST", body: JSON.stringify(Array.from(incorrectWordIdMap.values())) })
        .then((words) => setAllIncorrectWords(words || []))
        .catch((err) => console.error("전체 오답 단어 로딩 실패:", err))
    } else {
      setAllIncorrectWords([]) // 세션이 없거나 오답이 없으면 비움
    }

    return periodStats
  }, [allSessions]) // 'allSessions'가 변경될 때마다 통계가 다시 계산됨

  // ... (refreshKey useEffect는 그대로 유지) ...
  useEffect(() => {
    if (refreshKey > 0) {
      setSelectedModeInfo(null)
      setStudyWords([])
      setStudyContext(null)
      setStudyResults(null)
      setIsHistoryVisible(false)
      setReviewWords(null)
      setSelectedSession(null)
      // ✅ [추가] 메인 화면으로 리셋 시 기록도 새로고침
      fetchAllSessions()
    }
  }, [refreshKey, fetchAllSessions])

  const studyModes = [
    // ... (studyModes 내용은 그대로) ...
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

  // ... (handleModeSelect, handleStartStudy는 그대로 유지) ...
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

  // ✅ [수정] handleStudyComplete에서 'fetchAllSessions' 호출
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
      // ✅ [추가] 리뷰 세션 완료 시에도 기록 새로고침 (혹시 모를 대비)
      fetchAllSessions()
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
        // ✅ [수정] 'fetchRecentSessions' -> 'fetchAllSessions'
        fetchAllSessions() // 👈 실시간 반영 핵심
      } catch (error) {
        console.error("학습 기록 저장 실패:", error)
      }
    }
  }

  // ✅ [수정] handleAutoplayComplete에서 'fetchAllSessions' 호출
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
      // ✅ [추가] 리뷰 세션 완료 시에도 기록 새로고침
      fetchAllSessions()
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
        // ✅ [수정] 'fetchRecentSessions' -> 'fetchAllSessions'
        fetchAllSessions() // 👈 실시간 반영 핵심
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

  // ✅ [수정] handleHomeFromResults에서 'fetchAllSessions' 호출 (이미 되어있음)
  const handleHomeFromResults = () => {
    const wasReviewing = studyResults?.isReview
    setStudyResults(null)
    if (wasReviewing) {
      setIsHistoryVisible(true)
    } else {
      setStudyWords([])
      setStudyContext(null)
    }
    // ✅ [수정] 'fetchRecentSessions' -> 'fetchAllSessions'
    fetchAllSessions() // 👈 실시간 반영 핵심
    window.scrollTo(0, 0)
  }

  // ... (handleBackFromStudy, formatRelativeTime, handleStartReview, wordsForSession는 그대로) ...
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
    // 'WordResult' 타입을 'Word' 타입으로 변환 (mastered가 없으므로)
    const reviewWordsAsWordType = wordsToReview.map(wr => ({
      id: wr.id,
      word: wr.word,
      meaning: wr.meaning
      // mastered는 어차피 리뷰 대상이므로 중요하지 않음
    }));
    
    setReviewWords(reviewWordsAsWordType)
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

  // 5. ✅ [수정] 전체 학습 기록 화면 (props 내려주기)
  if (isHistoryVisible) {
    return (
      <StudyHistoryScreen
        onBack={() => setIsHistoryVisible(false)}
        onStartReview={handleStartReview}
        // ✅ [추가] 부모가 관리하는 상태를 내려줍니다.
        sessions={allSessions}
        isLoading={isLoadingSessions}
        stats={stats}
        allIncorrectWords={allIncorrectWords}
      />
    )
  }

  // 6. 메인 학습 화면 (기본)
  return (
    <div className="h-full flex flex-col bg-background">
      {/* ... (헤더 부분은 그대로) ... */}
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

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 pt-4 space-y-6">
          {/* ... (학습 모드 부분은 그대로) ... */}
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
              {/* ✅ [수정] 'isLoading.sessions' -> 'isLoadingSessions' */}
              {isLoadingSessions ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : // ✅ [수정] 'recentSessions' -> 'allSessions'
              allSessions.length === 0 ? (
                <Card className="border border-border rounded-xl bg-card">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    최근 학습 기록이 없습니다.
                  </CardContent>
                </Card>
              ) : (
                // ✅ [수정] 'recentSessions' -> 'allSessions'
                allSessions.slice(0, 5).map((session) => (
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