"use client"

import { useState, useEffect } from "react"
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
// (백엔드가 wordbookId를 주지 않아도, 프론트에서 채워줄 것입니다)
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

export function AggregatedStudyDetailScreen({
  periodTitle,
  sessions,
  onBack,
  onStartReview,
}: AggregatedStudyDetailScreenProps) {
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

  // [!!!] 2. useEffect 로직 (핵심 수정)
  useEffect(() => {
    const fetchWordDetails = async () => {
      if (sessions.length === 0) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)

      // [!!!] 맵 생성: <wordId, wordbookId>
      const correctWordMap = new Map<string, string>()
      const incorrectWordMap = new Map<string, string>()

      const correctApiPayload: { wordbookId: string; wordId: string }[] = []
      const incorrectApiPayload: { wordbookId: string; wordId: string }[] = []

      sessions.forEach((session) => {
        session.correctWords?.forEach((wordId) => {
          if (!correctWordMap.has(wordId)) { // 중복 단어 방지
            correctWordMap.set(wordId, session.wordbookId)
            correctApiPayload.push({ wordbookId: session.wordbookId, wordId })
          }
        })
        session.incorrectWords?.forEach((wordId) => {
          if (!incorrectWordMap.has(wordId)) { // 중복 단어 방지
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

        // [!!!] 3. 'wordbookId' 다시 합치기 (핵심)
        // 백엔드 응답(correct)에는 wordbookId가 없다고 가정합니다.
        const correctWithWordbookId = (correct || []).map((word: Omit<WordResult, 'wordbookId'>) => ({
          ...word,
          // 맵에서 word.id를 키로 wordbookId를 찾아 추가합니다.
          wordbookId: correctWordMap.get(word.id) || '',
        }));

        const incorrectWithWordbookId = (incorrect || []).map((word: Omit<WordResult, 'wordbookId'>) => ({
          ...word,
          // 맵에서 word.id를 키로 wordbookId를 찾아 추가합니다.
          wordbookId: incorrectWordMap.get(word.id) || '',
        }));

        // [!!!] 4. 'wordbookId'가 포함된 최종 데이터를 상태에 저장
        setCorrectWords(correctWithWordbookId)
        setIncorrectWords(incorrectWithWordbookId)

      } catch (error) {
        console.error("단어 상세 정보 로딩 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWordDetails()
  }, [sessions])

  const handleReview = (mode: string, writingType?: "word" | "meaning") => {
    if (incorrectWords.length > 0) {
      onStartReview(mode, incorrectWords, writingType)
    } else {
      alert("오답 단어가 없어 복습을 시작할 수 없습니다.")
    }
  }

  // [!!!] 5. 암기 상태 토글 함수 (이제 정상 작동)
  const handleToggleMastered = async (wordbookId: string, wordId: string, currentMasteredStatus: boolean) => {

    // [!!!] 6. 안전장치 (이제 이 alert가 뜨지 않아야 합니다)
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
      // [!!!] 7. "단어장"에서 찾은 실제 API 주소 사용
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


  // [!!!] 8. 렌더링 함수 (변경 없음)
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
            // 'item.wordbookId'는 useEffect에서 채워줬기 때문에 이제 값이 있습니다.
            onClick={() => handleToggleMastered(item.wordbookId, item.id, item.mastered)}
          >
            {item.mastered ? "암기 완료" : "암기 미완료"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="incorrect" className="h-full flex flex-col bg-background text-foreground">
      <div className="h-full flex flex-col">
        {/* 고정 헤더 */}
        <div className="shrink-0 bg-card border-b border-border z-10">
          <div className="px-4 pt-6 pb-4">
            <div className="relative flex items-center justify-center">
              <Button variant="ghost" size="sm" onClick={onBack} className="absolute left-0 p-2">
                <ArrowLeft size={18} className="text-muted-foreground" />
              </Button>
              <h1 className="text-xl font-bold text-foreground">{periodTitle}</h1>
            </div>
          </div>

          {!isLoading && (
            <div className="px-4 pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-popover border-border rounded-md">
                <TabsTrigger value="correct">정답 ({correctWords.length})</TabsTrigger>
                <TabsTrigger value="incorrect">오답 ({incorrectWords.length})</TabsTrigger>
              </TabsList>
            </div>
          )}
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-4 pb-36">
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

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-18 left-1/2 -translate-x-1/2 w-full max-w-md z-10 p-4 bg-background border-t border-border">
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