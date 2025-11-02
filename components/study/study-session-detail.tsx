// components/study/study-session-detail.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer";
import { ArrowLeft, BookOpen, Play, PenTool, Brain, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { cn } from "@/lib/utils";

interface StudySession {
  id: string;
  wordbookName: string;
  mode: string;
  score: number;
  duration: number;
  completedAt: string;
}

interface WordResult {
  id: string;
  word: string;
  meaning: string;
  mastered: boolean;
}

interface StudySessionDetailScreenProps {
  session: StudySession;
  onBack: () => void;
  onStartReview: (mode: string, words: WordResult[], writingType?: "word" | "meaning") => void;
}

export function StudySessionDetailScreen({ session, onBack, onStartReview }: StudySessionDetailScreenProps) {
  const [correctWords, setCorrectWords] = useState<WordResult[]>([]);
  const [incorrectWords, setIncorrectWords] = useState<WordResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerContent, setDrawerContent] = useState<"modes" | "writingOptions">("modes");

  const studyModes = [
    { id: "flashcard", name: "플래시카드", icon: BookOpen },
    { id: "autoplay", name: "자동재생", icon: Play },
    { id: "writing", name: "받아쓰기", icon: PenTool },
    { id: "quiz", name: "객관식 퀴즈", icon: Brain },
  ];

  const fetchSessionDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchWithAuth(`/api/study-sessions/${session.id}`);
      setCorrectWords(data.correctWords || []);
      setIncorrectWords(data.incorrectWords || []);
    } catch (error) {
      console.error("학습 상세 기록 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session.id]);

  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  const handleReview = (mode: string, writingType?: "word" | "meaning") => {
    if (incorrectWords.length > 0) {
      onStartReview(mode, incorrectWords, writingType);
    } else {
      alert("오답 단어가 없어 복습을 시작할 수 없습니다.");
    }
  };

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
                ? "text-green-700 bg-green-100"
                : "text-muted-foreground bg-muted",
              "pointer-events-none"
            )}
          >
            {item.mastered ? "암기 완료" : "암기 미완료"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    // ▼▼▼ [수정됨] overflow-y-auto 제거 ▼▼▼
    <div className="flex-1 bg-background text-foreground">
      <div className="px-4 py-6 border-b border-border sticky top-0 bg-card z-10">
        <div className="relative flex items-center justify-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="absolute left-0 p-2">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">학습 결과 상세</h1>
        </div>
      </div>

      {/* ▼▼▼ [수정됨] 하단 패딩 pb-32 -> pb-36으로 변경 ▼▼▼ */}
      <div className="p-4 pb-38">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="incorrect" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-popover border-border rounded-md">
              <TabsTrigger value="correct">정답 ({correctWords.length})</TabsTrigger>
              <TabsTrigger value="incorrect">오답 ({incorrectWords.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="correct" className="mt-4">
              <div className="space-y-2">
                {correctWords.map(renderWordCard)}
              </div>
            </TabsContent>

            <TabsContent value="incorrect" className="mt-4">
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

          </Tabs>
        )}
      </div>
      {/* ▲▲▲ 스크롤 영역 끝 ▲▲▲ */}


      {/* ▼▼▼ [수정됨] 하단 고정 버튼 (fixed, bottom-16)은 그대로 유지 ▼▼▼ */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md z-10 p-4 bg-background border-t border-border">
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
                        <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleReview(mode.id)}>
                          <mode.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{mode.name}</span>
                        </Button>
                      </DrawerClose>
                    )
                  )}
                </div>
              )}

              {drawerContent === "writingOptions" && (
                <div className="p-2">
                  <DrawerClose asChild>
                    <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleReview("writing", "word")}>
                      뜻 보고 단어 쓰기
                    </Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleReview("writing", "meaning")}>
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
      {/* ▲▲▲ [수정됨] 하단 고정 완료 ▲▲▲ */}
    </div>
  );
}


