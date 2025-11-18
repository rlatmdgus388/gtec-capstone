"use client"

// ✅ [제거] useState, useEffect, useMemo
import { useState } from "react" // ✅ [수정] useState는 drawerContent용으로 유지
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Brain, PenTool, Play } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
// ✅ [제거] fetchWithAuth
import { StudyPeriodSummaryCard } from "./study-period-summary-card"
import { AggregatedStudyDetailScreen } from "./aggregated-study-detail-screen"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer"

interface StudySession {
  id: string
  wordbookName: string
  mode: string
  score: number
  duration: number
  completedAt: string
  wordbookId: string
  correctWords?: string[]
  incorrectWords?: string[]
}

interface WordResult {
  id: string
  word: string
  meaning: string
}

// ✅ [추가] 부모로부터 받을 Stats 타입
interface PeriodStats {
  correctCount: number
  incorrectCount: number
  sessions: StudySession[]
}
interface StudyStats {
  today: PeriodStats
  "7days": PeriodStats
}

// ✅ [수정] Props 인터페이스 변경
interface StudyHistoryScreenProps {
  onBack: () => void
  onStartReview: (mode: string, words: WordResult[], writingType?: "word" | "meaning") => void
  // ✅ [추가] 부모로부터 받을 상태들
  sessions: StudySession[] // AggregatedStudyDetailScreen으로 전달하기 위해 필요
  isLoading: boolean
  stats: StudyStats
  allIncorrectWords: WordResult[]
}

type Period = "today" | "7days"

export function StudyHistoryScreen({
  onBack,
  onStartReview,
  // ✅ [추가] Props 받기
  sessions,
  isLoading,
  stats,
  allIncorrectWords,
}: StudyHistoryScreenProps) {
  const [view, setView] = useState<"main" | "detail">("main")
  const [selectedPeriod, setSelectedPeriod] = useState<{ period: Period; title: string } | null>(null)

  // ✅ [제거] sessions, isLoading, allIncorrectWords useState 제거
  // const [sessions, setSessions] = useState<StudySession[]>([])
  // const [isLoading, setIsLoading] = useState(true)
  // const [allIncorrectWords, setAllIncorrectWords] = useState<WordResult[]>([])

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerContent, setDrawerContent] = useState<"modes" | "writingOptions">("modes")

  const studyModes = [
    { id: "flashcard", name: "플래시카드", icon: BookOpen },
    { id: "autoplay", name: "자동재생", icon: Play },
    { id: "writing", name: "받아쓰기", icon: PenTool },
    { id: "quiz", name: "객관식 퀴즈", icon: Brain },
  ]

  // ✅ [제거] fetchAllSessions useEffect 제거
  // useEffect(() => { ... }, [])

  // ✅ [제거] stats useMemo 제거 (부모가 계산해서 'stats' prop으로 줌)
  // const stats = useMemo(() => { ... }, [sessions, allIncorrectWords.length])

  const handlePeriodClick = (period: Period, title: string) => {
    setSelectedPeriod({ period, title })
    setView("detail")
  }

  const handleStartDirectReview = (mode: string, writingType?: "word" | "meaning") => {
    onStartReview(mode, allIncorrectWords, writingType)
    setIsDrawerOpen(false)
  }

  if (view === "detail" && selectedPeriod) {
    return (
      <AggregatedStudyDetailScreen
        periodTitle={selectedPeriod.title}
        // ✅ [수정] 'stats'에서 세션을 가져옴
        sessions={stats[selectedPeriod.period].sessions}
        onBack={() => setView("main")}
        onStartReview={onStartReview}
      />
    )
  }

  return (
    // [수정 1] 'h-full' 제거
    <div className="flex flex-col bg-background">
      {/* [수정 2] 'div' -> 'header'로 변경, 클래스 수정 */}
      <header className="sticky top-0 z-40 w-full bg-background border-b">
        {/* [수정 3] 헤더 내부에 'px-4 py-3' 래퍼 추가 */}
        <div className="px-4 py-3">
          <div className="relative flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft size={18} className="text-muted-foreground" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground">학습 기록</h1>
              <p className="text-muted-foreground text-sm">매일 00시(KST)를 기준으로 갱신됩니다.</p>
            </div>
          </div>
          {/* ✅ [수정] KST 기준임을 명시 */}
        </div>
      </header>

      {/* [수정 4] 'overflow-y-auto' 제거, 'pb-36' -> 하단 여백 수정 */}
      <div className="flex-1 p-4 space-y-4 pb-[calc(10rem+env(safe-area-inset-bottom))]">
        {/* ✅ [수정] 'isLoading' prop 사용 */}
        {isLoading ? (
          <>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </>
        ) : (
          <>
            {/* ✅ [수정] 'stats' prop 사용 */}
            <StudyPeriodSummaryCard
              title="오늘 학습한 단어"
              correctCount={stats.today.correctCount}
              incorrectCount={stats.today.incorrectCount}
              totalWords={stats.today.correctCount + stats.today.incorrectCount}
              onClick={() => handlePeriodClick("today", "오늘의 학습 결과")}
            />
            <StudyPeriodSummaryCard
              title="7일 동안 학습한 단어"
              correctCount={stats["7days"].correctCount}
              incorrectCount={stats["7days"].incorrectCount}
              totalWords={stats["7days"].correctCount + stats["7days"].incorrectCount}
              onClick={() => handlePeriodClick("7days", "최근 7일 학습 결과")}
            />
          </>
        )}
      </div>

      {/* [수정 5] 'bottom-18' -> 'bottom-[5rem]', 'z-10' -> 'z-30' 수정 */}
      <div className="fixed bottom-[5rem] left-1/2 -translate-x-1/2 w-full max-w-md z-30 p-4 bg-background border-t border-border">
        <Drawer
          open={isDrawerOpen}
          onOpenChange={(isOpen) => {
            setIsDrawerOpen(isOpen)
            if (!isOpen) setDrawerContent("modes")
          }}
        >
          <DrawerTrigger asChild>
            <Button
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium"
              onClick={() => setIsDrawerOpen(true)}
              // ✅ [수정] 'allIncorrectWords' prop 사용
              disabled={allIncorrectWords.length === 0}
            >
              {/* ✅ [수정] 'allIncorrectWords' prop 사용 */}
              전체 오답 복습하기 ({allIncorrectWords.length}개)
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            {/* ... (Drawer 내용은 그대로 유지) ... */}
            <div className="mx-auto w-full max-w-sm">
              {drawerContent === "modes" && (
                <div className="p-2">
                  {studyModes.map((mode) => {
                    if (mode.id === "writing") {
                      return (
                        <Button
                          key={mode.id}
                          variant="ghost"
                          className="w-full justify-start p-2 h-12 text-sm"
                          onClick={() => setDrawerContent("writingOptions")}
                        >
                          <mode.icon className="mr-2 h-4 w-4" />
                          {mode.name}
                        </Button>
                      )
                    }
                    return (
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-2 h-12 text-sm"
                        onClick={() => handleStartDirectReview(mode.id)}
                        key={mode.id}
                      >
                        <mode.icon className="mr-2 h-4 w-4" />
                        {mode.name}
                      </Button>
                    )
                  })}
                </div>
              )}
              {drawerContent === "writingOptions" && (
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-12 text-sm"
                    onClick={() => handleStartDirectReview("writing", "word")}
                  >
                    뜻 보고 단어 쓰기
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-12 text-sm"
                    onClick={() => handleStartDirectReview("writing", "meaning")}
                  >
                    단어 보고 뜻 쓰기
                  </Button>
                </div>
              )}
              <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                  <Button variant="outline">취소</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}