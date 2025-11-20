"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer"
import { ArrowLeft, BookOpen, Play, PenTool, Brain, Loader2 } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { cn } from "@/lib/utils"

// [!!!] 1. 'session' prop에 wordbookId가 있다고 가정합니다.
interface StudySession {
  id: string
  wordbookId: string // [!!!] 이 ID가 매우 중요합니다.
  wordbookName: string
  mode: string
  score: number
  duration: number
  completedAt: string
}

// [!!!] 2. WordResult에서 wordbookId 제거
interface WordResult {
  id: string
  word: string
  meaning: string
  mastered: boolean
}

interface StudySessionDetailScreenProps {
  session: StudySession // [!!!] 여기에 wordbookId가 포함되어야 함
  onBack: () => void
  onStartReview: (mode: string, words: WordResult[], writingType?: "word" | "meaning") => void
}

// 프로젝트 하단 탭바의 높이를 4rem (64px)으로 가정합니다. (StudyHistoryScreen과 통일)
const PROJECT_TAB_BAR_HEIGHT = '4rem';

export function StudySessionDetailScreen({ session, onBack, onStartReview }: StudySessionDetailScreenProps) {

  const [correctWords, setCorrectWords] = useState<WordResult[]>([])
  const [incorrectWords, setIncorrectWords] = useState<WordResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [drawerContent, setDrawerContent] = useState<"modes" | "writingOptions">("modes")

  const studyModes = [
    { id: "flashcard", name: "플래시카드", icon: BookOpen },
    { id: "autoplay", name: "자동재생", icon: Play },
    { id: "writing", name: "받아쓰기", icon: PenTool },
    { id: "quiz", name: "객관식 퀴즈", icon: Brain },
  ]

  const fetchSessionDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchWithAuth(`/api/study-sessions/${session.id}`)
      setCorrectWords(data.correctWords || [])
      setIncorrectWords(data.incorrectWords || [])
    } catch (error) {
      console.error("학습 상세 기록 로딩 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [session.id])

  useEffect(() => {
    fetchSessionDetails()
  }, [fetchSessionDetails])

  const handleReview = (mode: string, writingType?: "word" | "meaning") => {
    if (incorrectWords.length > 0) {
      onStartReview(mode, incorrectWords, writingType)
    } else {
      alert("오답 단어가 없어 복습을 시작할 수 없습니다.")
    }
  }

  // [!!!] 3. 암기 상태 토글 함수 수정
  const handleToggleMastered = async (wordId: string, currentMasteredStatus: boolean) => {

    const wordbookId = session.wordbookId;

    if (!wordbookId) {
      console.error("session.wordbookId가 없어 API를 호출할 수 없습니다.");
      alert("세션 정보에 wordbookId가 누락되어 상태를 변경할 수 없습니다.");
      return;
    }

    const newMasteredStatus = !currentMasteredStatus;

    const toggleMasteredInList = (list: WordResult[]) => {
      return list.map(word =>
        word.id === wordId ? { ...word, mastered: newMasteredStatus } : word
      );
    };

    setCorrectWords(prev => toggleMasteredInList(prev));
    setIncorrectWords(prev => toggleMasteredInList(prev));

    try {
      // [!!!] 실제 API 주소 사용
      await fetchWithAuth(`/api/wordbooks/${wordbookId}/words/${wordId}`, {
        method: 'PUT',
        body: JSON.stringify({
          mastered: newMasteredStatus,
        }),
      });

    } catch (error) {
      console.error("암기 상태 업데이트 실패:", error);
      alert("암기 상태 변경에 실패했습니다. 다시 시도해주세요.");

      const rollbackMasteredInList = (list: WordResult[]) => {
        return list.map(word =>
          word.id === wordId ? { ...word, mastered: currentMasteredStatus } : word
        );
      };
      setCorrectWords(prev => rollbackMasteredInList(prev));
      setIncorrectWords(prev => rollbackMasteredInList(prev));
    }
  };

  // [!!!] 4. 단어 카드 렌더링 함수 수정
  const renderWordCard = (item: WordResult) => (
    <Card key={item.id} className="bg-card border-border">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-semibold text-card-foreground">{item.word}</div>
            <div className="text-sm text-muted-foreground mt-1">{item.meaning}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs font-semibold rounded-full px-3 py-1 h-auto ml-2 flex-shrink-0",
              item.mastered
                ? "text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-800"
                : "text-muted-foreground bg-muted hover:bg-muted-foreground/20",
            )}
            onClick={() => handleToggleMastered(item.id, item.mastered)}
          >
            {item.mastered ? "암기 완료" : "암기 미완료"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="incorrect" className="flex flex-col bg-background min-h-screen text-foreground">
      {/* 1. Header & TabsList */}
      <div className="flex flex-col">
        <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                <ArrowLeft size={18} className="text-muted-foreground" />
              </Button>
              <h1 className="text-xl font-bold text-foreground">학습 결과 상세</h1>
            </div>
          </div>

          {!isLoading && (
            <div className="px-4 pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-popover border-border rounded-md">
                <TabsTrigger
                  value="correct"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  정답 ({correctWords.length})
                </TabsTrigger>
                <TabsTrigger
                  value="incorrect"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  오답 ({incorrectWords.length})
                </TabsTrigger>
              </TabsList>
            </div>
          )}
        </header>

        {/* 2. TabsContent Area (Scrollable) */}
        <div className="flex-1 p-4 pb-[calc(10rem+env(safe-area-inset-bottom))] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="correct" className="mt-0">
                <div className="space-y-2">
                  {correctWords.length === 0 ? (
                    <Card className="border-border bg-card">
                      <CardContent className="p-6 text-center text-muted-foreground">
                        정답 단어가 없습니다.
                      </CardContent>
                    </Card>
                  ) : (
                    correctWords.map(renderWordCard)
                  )}
                </div>
              </TabsContent>

              <TabsContent value="incorrect" className="mt-0">
                <div className="space-y-2">
                  {incorrectWords.length === 0 ? (
                    <Card className="border-border bg-card">
                      <CardContent className="p-6 text-center text-muted-foreground">
                        오답 단어가 없습니다.
                      </CardContent>
                    </Card>
                  ) : (
                    incorrectWords.map(renderWordCard)
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </div>
      </div>

      {/* 3. Fixed Footer (오답 복습 버튼) - 투명 스타일 및 Safe Area 적용 */}
      <div
        // 배경 투명, 그림자 없음, p-4 유지
        className="fixed left-0 right-0 mx-auto w-full max-w-md z-30 p-4 rounded-xl"
        style={{
          // 탭바 높이 (4rem) + 미세한 여백 (0.5rem) + Safe Area
          bottom: `calc(${PROJECT_TAB_BAR_HEIGHT} + 0.5rem + env(safe-area-inset-bottom))`,
        }}
      >
        <Drawer onOpenChange={(isOpen) => !isOpen && setDrawerContent("modes")}>
          <DrawerTrigger asChild>
            <Button
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium"
              disabled={incorrectWords.length === 0 || isLoading}
            >
              오답 단어 복습하기
            </Button>
          </DrawerTrigger>

          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <h3 className="text-lg font-semibold text-center py-2 border-b border-border">복습 모드 선택</h3>
              {drawerContent === "modes" && (
                <div className="p-2">
                  {studyModes.map((mode) =>
                    mode.id === "writing" ? (
                      <Button
                        key={mode.id}
                        variant="ghost"
                        className="w-full justify-start p-2 h-12 text-sm"
                        onClick={() => setDrawerContent("writingOptions")}
                      >
                        <mode.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{mode.name}</span>
                      </Button>
                    ) : (
                      <DrawerClose asChild key={mode.id}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-2 h-12 text-sm"
                          onClick={() => handleReview(mode.id)}
                        >
                          <mode.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{mode.name}</span>
                        </Button>
                      </DrawerClose>
                    ),
                  )}
                </div>
              )}

              {drawerContent === "writingOptions" && (
                <div className="p-2">
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-2 h-12 text-sm"
                      onClick={() => handleReview("writing", "word")}
                    >
                      뜻 보고 단어 쓰기
                    </Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-2 h-12 text-sm"
                      onClick={() => handleReview("writing", "meaning")}
                    >
                      단어 보고 뜻 쓰기
                    </Button>
                  </DrawerClose>
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
    </Tabs>
  )
}