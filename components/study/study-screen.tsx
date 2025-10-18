"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer"
import { GraduationCap, Play, Clock, BookOpen, PenTool, Brain } from "lucide-react"
import { FlashcardMode } from "./flashcard-mode"
import { QuizMode } from "./quiz-mode"
import { WritingMode } from "./writing-mode"
import { AutoplayMode } from "./autoplay-mode"
import { StudyResults } from "./study-results"
import { StudyHistoryScreen } from "./study-history-screen"
import { StudySessionDetailScreen } from "./study-session-detail"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "../ui/skeleton"
import { Loader2 } from "lucide-react"

interface Word {
  id: string
  word: string
  meaning: string
  example?: string
  pronunciation?: string
}

interface Wordbook {
  id: string
  name: string
  wordCount: number
}

interface StudySession {
  id: string
  wordbookName: string
  mode: string
  score: number
  duration: number // 초 단위
  completedAt: string
}

interface WordResult {
  id: string // 타입을 string으로 통일
  word: string
  meaning: string
}

interface StudyScreenProps {
  selectedWordbookId?: string | null
}

export function StudyScreen({ selectedWordbookId }: StudyScreenProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [writingModeType, setWritingModeType] = useState<"word" | "meaning">("word")
  const [selectedWordbook, setSelectedWordbook] = useState<string>("")
  const [studyResults, setStudyResults] = useState<any>(null)
  const [isHistoryVisible, setIsHistoryVisible] = useState(false)
  const [reviewWords, setReviewWords] = useState<any[] | null>(null)
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null)

  const [wordbooks, setWordbooks] = useState<Wordbook[]>([])
  const [words, setWords] = useState<Word[]>([])
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([])
  const [isLoading, setIsLoading] = useState({ wordbooks: true, words: false, sessions: true })

  const fetchWordbooks = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, wordbooks: true }))
    try {
      const data = await fetchWithAuth("/api/wordbooks")
      setWordbooks(data || [])
      if (selectedWordbookId) {
        setSelectedWordbook(selectedWordbookId)
      }
    } catch (error) {
      console.error("단어장 목록 로딩 실패:", error)
    } finally {
      setIsLoading((prev) => ({ ...prev, wordbooks: false }))
    }
  }, [selectedWordbookId])

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
    fetchWordbooks()
    fetchRecentSessions()
  }, [fetchWordbooks, fetchRecentSessions])

  useEffect(() => {
    const fetchWords = async () => {
      if (!selectedWordbook) {
        setWords([])
        return
      }
      setIsLoading((prev) => ({ ...prev, words: true }))
      try {
        const data = await fetchWithAuth(`/api/wordbooks/${selectedWordbook}`)
        setWords(data.words || [])
      } catch (error) {
        console.error("단어 목록 로딩 실패:", error)
        setWords([])
      } finally {
        setIsLoading((prev) => ({ ...prev, words: false }))
      }
    }
    fetchWords()
  }, [selectedWordbook])

  const studyModes = [
    {
      id: "flashcard",
      name: "플래시카드",
      description: "카드를 넘기며 단어 학습",
      icon: BookOpen,
      color: "bg-primary",
    },
    {
      id: "autoplay",
      name: "자동재생",
      description: "자동으로 단어와 뜻 재생",
      icon: Play,
      color: "bg-secondary",
    },
    {
      id: "writing",
      name: "받아쓰기",
      description: "직접 단어를 입력하여 학습",
      icon: PenTool,
      color: "bg-accent",
    },
    {
      id: "quiz",
      name: "객관식 퀴즈",
      description: "객관식 문제로 실력 테스트",
      icon: Brain,
      color: "bg-foreground",
    },
  ]

  const handleModeSelect = (modeId: string) => {
    if (!selectedWordbook) {
      alert("먼저 단어장을 선택해주세요.")
      return
    }
    if (words.length === 0 && !isLoading.words) {
      alert("학습할 단어가 없습니다. 단어를 추가해주세요.")
      return
    }
    setSelectedMode(modeId)
  }

  const handleStudyComplete = async (results: {
    correct: number
    total: number
    timeSpent: number
    correctWords?: string[]
    incorrectWords?: string[]
  }) => {
    if (reviewWords) {
      setStudyResults({ ...results, mode: selectedMode, isReview: true })
      setSelectedMode(null)
      return
    }

    const currentWordbook = wordbooks.find((wb) => wb.id === selectedWordbook)
    const modeName = studyModes.find((m) => m.id === selectedMode)?.name || "학습"

    setStudyResults({ ...results, mode: selectedMode })
    setSelectedMode(null)

    if (currentWordbook && results.total > 0) {
      try {
        await fetchWithAuth("/api/study-sessions", {
          method: "POST",
          body: JSON.stringify({
            wordbookId: currentWordbook.id,
            wordbookName: currentWordbook.name,
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
    const wordsToUse = reviewWords || words
    const timeSpent = wordsToUse.length * 3

    if (reviewWords) {
      setStudyResults({
        correct: wordsToUse.length,
        total: wordsToUse.length,
        timeSpent,
        mode: "autoplay",
        isReview: true,
      })
      setSelectedMode(null)
      return
    }

    const currentWordbook = wordbooks.find((wb) => wb.id === selectedWordbook)
    const modeName = "자동재생"

    setStudyResults({ correct: words.length, total: words.length, timeSpent, mode: "autoplay" })
    setSelectedMode(null)

    if (currentWordbook) {
      try {
        await fetchWithAuth("/api/study-sessions", {
          method: "POST",
          body: JSON.stringify({
            wordbookId: currentWordbook.id,
            wordbookName: currentWordbook.name,
            mode: modeName,
            score: 100,
            duration: timeSpent,
            correctWords: words.map((w) => w.id),
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
    setStudyResults(null)
    if (studyResults.isReview) {
      setReviewWords(reviewWords)
    }
    setSelectedMode(studyResults.mode)
  }

  const handleHome = () => {
    setStudyResults(null)
    setSelectedMode(null)
    setSelectedWordbook("")
    setReviewWords(null)
    setIsHistoryVisible(false)
    setSelectedSession(null)
    fetchRecentSessions()
    window.scrollTo(0, 0)
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

  const handleStartReview = (mode: string, wordsToReview: WordResult[]) => {
    setReviewWords(wordsToReview)
    setSelectedMode(mode)
    setIsHistoryVisible(false)
    setSelectedSession(null)
  }

  if (selectedSession) {
    return (
      <StudySessionDetailScreen
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
        onStartReview={handleStartReview}
      />
    )
  }

  if (isHistoryVisible) {
    return <StudyHistoryScreen onBack={() => setIsHistoryVisible(false)} onStartReview={handleStartReview} />
  }

  const wordsForSession = reviewWords || words

  if (selectedMode) {
    if (isLoading.words && !reviewWords) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      )
    }
    switch (selectedMode) {
      case "flashcard":
        return (
          <FlashcardMode
            words={wordsForSession}
            onComplete={handleStudyComplete}
            onBack={() => {
              setSelectedMode(null)
              setReviewWords(null)
            }}
          />
        )
      case "quiz":
        return (
          <QuizMode
            words={wordsForSession}
            onComplete={handleStudyComplete}
            onBack={() => {
              setSelectedMode(null)
              setReviewWords(null)
            }}
          />
        )
      case "writing":
        return (
          <WritingMode
            words={wordsForSession}
            onComplete={handleStudyComplete}
            onBack={() => {
              setSelectedMode(null)
              setReviewWords(null)
            }}
            type={writingModeType}
          />
        )
      case "autoplay":
        return (
          <AutoplayMode
            words={wordsForSession}
            onComplete={handleAutoplayComplete}
            onBack={() => {
              setSelectedMode(null)
              setReviewWords(null)
            }}
          />
        )
    }
  }

  if (studyResults) {
    const modeName = studyModes.find((m) => m.id === studyResults.mode)?.name || "학습"
    return <StudyResults results={studyResults} mode={modeName} onRestart={handleRestart} onHome={handleHome} />
  }

  const selectedWordbookName = wordbooks.find((wb) => wb.id === selectedWordbook)?.name || "학습할 단어장을 선택하세요"

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-background">
      <div className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <GraduationCap size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">학습하기</h1>
              <p className="text-sm text-muted-foreground">다양한 방법으로 단어를 학습하세요</p>
            </div>
          </div>

          <div className="space-y-2 mb-2">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <span className="text-base font-medium text-foreground">단어장 선택</span>
            </div>
            {isLoading.wordbooks ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-full justify-start text-left font-normal border-border bg-card rounded-lg"
                  >
                    <span className="truncate">{selectedWordbookName}</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerTitle className="sr-only">단어장 선택</DrawerTitle>
                  <div className="mx-auto w-full max-w-sm">
                    <div className="p-2">
                      {wordbooks.map((wordbook) => (
                        <DrawerClose asChild key={wordbook.id}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start p-2 h-12 text-sm"
                            onClick={() => setSelectedWordbook(wordbook.id)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{wordbook.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{wordbook.wordCount}개</span>
                            </div>
                          </Button>
                        </DrawerClose>
                      ))}
                    </div>
                    <DrawerFooter className="pt-2">
                      <DrawerClose asChild>
                        <Button variant="outline">취소</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-foreground">학습 모드</h2>
          <div className="grid grid-cols-2 gap-3">
            {studyModes.map((mode) => {
              const Icon = mode.icon
              if (mode.id === "writing") {
                return (
                  <Drawer key={mode.id}>
                    <DrawerTrigger asChild>
                      <button className="aspect-square bg-card border border-border rounded-xl hover:shadow-md transition-all duration-200 p-4 flex flex-col items-center justify-center text-center space-y-2 group">
                        <div
                          className={`w-14 h-14 ${mode.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                        >
                          <Icon size={34} className="text-white dark:text-background" />
                        </div>
                        <div>
                          <h3 className="font-medium text-card-foreground mb-0.5 text-base">{mode.name}</h3>
                          <p className="text-sm text-muted-foreground leading-tight">{mode.description}</p>
                        </div>
                      </button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerTitle className="sr-only">쓰기 모드 선택</DrawerTitle>
                      <div className="mx-auto w-full max-w-sm">
                        <div className="p-2">
                          <DrawerClose asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start p-2 h-12 text-sm"
                              onClick={() => {
                                setWritingModeType("word")
                                handleModeSelect("writing")
                              }}
                            >
                              뜻 보고 단어 쓰기
                            </Button>
                          </DrawerClose>
                          <DrawerClose asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start p-2 h-12 text-sm"
                              onClick={() => {
                                setWritingModeType("meaning")
                                handleModeSelect("writing")
                              }}
                            >
                              단어 보고 뜻 쓰기
                            </Button>
                          </DrawerClose>
                        </div>
                        <DrawerFooter className="pt-2">
                          <DrawerClose asChild>
                            <Button variant="outline">취소</Button>
                          </DrawerClose>
                        </DrawerFooter> {/* ⚠️ 1. 오타 수정: </DraweFooter> -> </DrawerFooter> */}
                      </div>
                    </DrawerContent> {/* ⚠️ 2. 오타 수정: </DraweContent> -> </DrawerContent> */}
                  </Drawer>
                )
              }
              return (
                <button
                  key={mode.id}
                  className="aspect-square bg-card border border-border rounded-xl hover:shadow-md transition-all duration-200 p-4 flex flex-col items-center justify-center text-center space-y-2 group"
                  onClick={() => handleModeSelect(mode.id)}
                >
                  <div
                    className={`w-14 h-14 ${mode.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon size={34} className="text-white dark:text-background" />
                  </div>
                  <div>
                    <h3 className="font-medium text-card-foreground mb-0.5 text-base">{mode.name}</h3>
                    <p className="text-sm text-muted-foreground leading-tight">{mode.description}</p>
                  </div>
                </button>
              )
            })}
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
              <Card className="border border-border rounded-xl">
                <CardContent className="p-6 text-center text-muted-foreground">최근 학습 기록이 없습니다.</CardContent>
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
                        <h3 className="font-medium text-card-foreground mb-0.5 text-base">{session.wordbookName}</h3>
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
  )
}