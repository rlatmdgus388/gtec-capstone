"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer"
import { ArrowLeft, BookOpen, Play, PenTool, Brain, Loader2 } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { cn } from "@/lib/utils"

interface StudySession {
  id: string
  wordbookId: string
  correctWords?: string[]
  incorrectWords?: string[]
}

// [!!!] 1. WordResult 인터페이스는 그대로 유지합니다.
interface WordResult {
  id: string
  wordbookId: string // [!!!] 이 필드를 프론트에서 채울 것입니다.
  word: string
  meaning: string
  mastered: boolean
}

interface AggregatedStudyDetailScreenProps {
  periodTitle: string
  sessions: StudySession[]
  onBack: () => void
  onStartReview: (mode: string, words: WordResult[], writingType?: "word" | "meaning") => void
}

// 프로젝트 하단 탭바 높이 및 안전 영역 상수를 사용합니다.
const PROJECT_TAB_BAR_HEIGHT = '4rem';

export function AggregatedStudyDetailScreen({
  periodTitle,
  sessions,
  onBack,
  onStartReview,
}: AggregatedStudyDetailScreenProps) {
  const [correctWords, setCorrectWords] = useState<WordResult[]>([])
  const [incorrectWords, setIncorrectWords] = useState<WordResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 🔥 [추가] 탭 상태 추적 (기본값: 오답 탭)
  const [activeTab, setActiveTab] = useState("incorrect");

  const [drawerContent, setDrawerContent] = useState<"modes" | "writingOptions">("modes")

  const studyModes = [
    { id: "flashcard", name: "플래시카드", icon: BookOpen },
    { id: "autoplay", name: "자동재생", icon: Play },
    { id: "writing", name: "받아쓰기", icon: PenTool },
    { id: "quiz", name: "객관식 퀴즈", icon: Brain },
  ]

  // 🔥 [수정] 단어 상세 정보를 불러오는 로직을 useCallback으로 감싸 재사용 가능하게 변경
  const fetchWordDetails = useCallback(async () => {
    if (sessions.length === 0) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)

    const correctWordMap = new Map<string, string>()
    const incorrectWordMap = new Map<string, string>()
    const correctApiPayload: { wordbookId: string; wordId: string }[] = []
    const incorrectApiPayload: { wordbookId: string; wordId: string }[] = []

    sessions.forEach((session) => {
      session.correctWords?.forEach((wordId) => {
        if (!correctWordMap.has(wordId)) {
          correctWordMap.set(wordId, session.wordbookId)
          correctApiPayload.push({ wordbookId: session.wordbookId, wordId })
        }
      })
      session.incorrectWords?.forEach((wordId) => {
        if (!incorrectWordMap.has(wordId)) {
          incorrectWordMap.set(wordId, session.wordbookId)
          incorrectApiPayload.push({ wordbookId: session.wordbookId, wordId })
        }
      })
    })

    try {
      const [correct, incorrect] = await Promise.all([
        correctApiPayload.length > 0
          ? fetchWithAuth("/api/word", { method: "POST", body: JSON.stringify(correctApiPayload) })
          : Promise.resolve([]),
        incorrectApiPayload.length > 0
          ? fetchWithAuth("/api/word", { method: "POST", body: JSON.stringify(incorrectApiPayload) })
          : Promise.resolve([]),
      ])

      const correctWithWordbookId = (correct || []).map((word: Omit<WordResult, 'wordbookId'>) => ({
        ...word,
        wordbookId: correctWordMap.get(word.id) || '',
      }));

      const incorrectWithWordbookId = (incorrect || []).map((word: Omit<WordResult, 'wordbookId'>) => ({
        ...word,
        wordbookId: incorrectWordMap.get(word.id) || '',
      }));

      setCorrectWords(correctWithWordbookId)
      setIncorrectWords(incorrectWithWordbookId)

    } catch (error) {
      console.error("단어 상세 정보 로딩 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [sessions])

  // [!!!] 2. useEffect 로직 (useCallback 함수 호출)
  useEffect(() => {
    fetchWordDetails()
  }, [fetchWordDetails])

  const handleReview = (mode: string, writingType?: "word" | "meaning") => {
    if (incorrectWords.length > 0) {
      onStartReview(mode, incorrectWords, writingType)
    } else {
      alert("오답 단어가 없어 복습을 시작할 수 없습니다.")
    }
  }

  // [!!!] 3. 암기 상태 토글 함수 (개별 단어)
  const handleToggleMastered = async (wordbookId: string, wordId: string, currentMasteredStatus: boolean) => {
    if (!wordbookId) {
      console.error("wordbookId가 없어 API를 호출할 수 없습니다.");
      alert("데이터에 wordbookId가 누락되어 상태를 변경할 수 없습니다.");
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

  // 🔥 [추가] 4. 정답 단어 일괄 암기 완료 처리 함수
  const handleMarkAllCorrectAsMastered = async () => {
    if (correctWords.length === 0 || isLoading) return;

    setIsLoading(true);
    let successCount = 0;

    // 아직 완료되지 않은 정답 단어만 처리 대상으로 선택
    const wordsToMark = correctWords.filter(word => !word.mastered);

    // 1. Optimistic UI Update (화면에서 모두 '암기 완료'로 표시)
    setCorrectWords(prev => prev.map(word => ({ ...word, mastered: true })));

    // 2. API Call (Parallel processing)
    try {
      const updatePromises = wordsToMark.map(word =>
        // word.wordbookId는 이미 fetchWordDetails에서 채워져 있습니다.
        fetchWithAuth(`/api/wordbooks/${word.wordbookId}/words/${word.id}`, {
          method: 'PUT',
          body: JSON.stringify({ mastered: true }),
        }).then(() => { successCount++; })
          .catch(err => {
            console.error(`Failed to mark word ${word.word}:`, err);
          })
      );
      await Promise.all(updatePromises);

      // 3. Final feedback
      alert(`${successCount}개의 단어를 암기 완료 처리했습니다.`);

    } catch (error) {
      console.error("일괄 암기 완료 처리 실패:", error);
      alert("일괄 처리 중 심각한 오류가 발생했습니다. 데이터를 새로고침합니다.");
      fetchWordDetails(); // 에러 발생 시 데이터 동기화를 위해 전체 새로고침
    } finally {
      setIsLoading(false);
    }
  };


  // [!!!] 5. 렌더링 함수 (스타일 업데이트)
  const renderWordCard = (item: WordResult) => (
    <Card key={item.id} className="bg-card border-border">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-semibold text-foreground">{item.word}</div>
            <div className="text-sm text-muted-foreground mt-1">{item.meaning}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs font-semibold rounded-full px-3 py-1 h-auto ml-2 flex-shrink-0",
              item.mastered
                ? "text-green-700 bg-green-100 hover:bg-green-200"
                : "text-muted-foreground bg-muted hover:bg-muted-foreground/20",
            )}
            onClick={() => handleToggleMastered(item.wordbookId, item.id, item.mastered)}
          >
            {item.mastered ? "암기 완료" : "암기 미완료"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const isCorrectTabActive = activeTab === "correct";
  const wordsToMasterCount = correctWords.filter(w => !w.mastered).length;
  const reviewButtonDisabled = incorrectWords.length === 0 || isLoading;
  const masteredButtonDisabled = wordsToMasterCount === 0 || isLoading;


  return (
    // 🔥 [수정] activeTab과 onValueChange를 바인딩
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col bg-background text-foreground min-h-screen"
    >
      <div className="flex flex-col">
        <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
          <div className="px-4 pt-4 pb-4">
            <div className="relative flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                <ArrowLeft size={18} className="text-muted-foreground" />
              </Button>
              <h1 className="text-xl font-bold text-foreground">{periodTitle}</h1>
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

        <div className="flex-1 p-4 pb-[calc(10rem+env(safe-area-inset-bottom))]">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : (
            <>
              {/* 정답 탭 */}
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

              {/* 오답 탭 */}
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

      {/* 🔥 [수정] 하단 버튼 조건부 렌더링 */}
      <div
        className="fixed left-0 right-0 mx-auto w-full max-w-md z-30 p-4 rounded-xl"
        style={{
          bottom: `calc(${PROJECT_TAB_BAR_HEIGHT} + 0.5rem + env(safe-area-inset-bottom))`,
        }}
      >
        {isCorrectTabActive ? (
          // 탭이 '정답'일 때: 암기 완료 버튼 표시 (Green 스타일 적용)
          <Button
            className="w-full h-12 rounded-xl font-medium transition-all
                       text-green-700 bg-green-100 hover:bg-green-200"
            disabled={masteredButtonDisabled}
            onClick={handleMarkAllCorrectAsMastered}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                처리 중...
              </>
            ) : (
              `정답 단어 암기 완료 (${wordsToMasterCount}개)`
            )}
          </Button>
        ) : (
          // 탭이 '오답'일 때: 복습하기 Drawer 표시 (Primary 스타일 유지)
          <Drawer onOpenChange={(isOpen) => !isOpen && setDrawerContent("modes")}>
            <DrawerTrigger asChild>
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium"
                disabled={reviewButtonDisabled}
              >
                오답 단어 복습하기
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                {drawerContent === "modes" && (
                  <div className="p-2">
                    <h3 className="text-lg font-semibold text-center py-2 border-b border-border text-foreground">복습 모드 선택</h3>
                    {studyModes.map((mode) => {
                      if (mode.id === "writing") {
                        return (
                          <Button
                            key={mode.id}
                            variant="ghost"
                            className="w-full justify-start p-2 h-12 text-sm"
                            onClick={() => setDrawerContent("writingOptions")}
                          >
                            <mode.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{mode.name}</span>
                          </Button>
                        )
                      }
                      return (
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
                      )
                    })}
                  </div>
                )}
                {drawerContent === "writingOptions" && (
                  <div className="p-2">
                    <h3 className="text-lg font-semibold text-center py-2 border-b border-border text-foreground">받아쓰기 옵션</h3>
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
        )}
      </div>
    </Tabs>
  )
}

// text-green-700 bg-green-100 hover:bg-green-200