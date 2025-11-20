"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Brain, PenTool, Play, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
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

interface PeriodStats {
  correctCount: number
  incorrectCount: number
  sessions: StudySession[]
}
interface StudyStats {
  today: PeriodStats
  "7days": PeriodStats
}

// 프로젝트 하단 탭바의 높이를 4rem (64px)으로 가정합니다. (이전 컴포넌트와 통일)
const PROJECT_TAB_BAR_HEIGHT = '4rem';

interface StudyHistoryScreenProps {
  onBack: () => void
  onStartReview: (mode: string, words: WordResult[], writingType?: "word" | "meaning") => void
  sessions: StudySession[]
  isLoading: boolean
  stats: StudyStats
  allIncorrectWords: WordResult[]
}

type Period = "today" | "7days"

export function StudyHistoryScreen({
  onBack,
  onStartReview,
  sessions,
  isLoading,
  stats,
  allIncorrectWords,
}: StudyHistoryScreenProps) {
  const [view, setView] = useState<"main" | "detail">("main")
  const [selectedPeriod, setSelectedPeriod] = useState<{ period: Period; title: string } | null>(null)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerContent, setDrawerContent] = useState<"modes" | "writingOptions">("modes")

  const studyModes = [
    { id: "flashcard", name: "플래시카드", icon: BookOpen },
    { id: "autoplay", name: "자동재생", icon: Play },
    { id: "writing", name: "받아쓰기", icon: PenTool },
    { id: "quiz", name: "객관식 퀴즈", icon: Brain },
  ]

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
        sessions={stats[selectedPeriod.period].sessions}
        onBack={() => setView("main")}
        onStartReview={onStartReview}
      />
    )
  }

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
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
        </div>
      </header>

      {/* 2. Content Area (Scrollable) */}
      <div className="flex-1 p-4 space-y-4 pb-[calc(10rem+env(safe-area-inset-bottom))] overflow-y-auto">
        {isLoading ? (
          <>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </>
        ) : (
          <>
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

      {/* 3. Fixed Footer (오답 복습 버튼) - ✨ 배경 투명, StudyOptionsScreen과 통일 ✨ */}
      <div
        // 배경 투명, 그림자 없음, p-4 유지
        className="fixed left-0 right-0 mx-auto w-full max-w-md z-30 p-4 rounded-xl"
        style={{
          // 탭바 높이 (4rem) + 미세한 여백 (0.5rem) + Safe Area
          bottom: `calc(${PROJECT_TAB_BAR_HEIGHT} + 0.5rem + env(safe-area-inset-bottom))`,
        }}
      >
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
              disabled={allIncorrectWords.length === 0}
            >
              전체 오답 복습하기 ({allIncorrectWords.length}개)
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <h3 className="text-lg font-semibold text-center py-2 border-b border-border">복습 모드 선택</h3>
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