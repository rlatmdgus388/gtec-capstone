// components/study/aggregated-study-detail-screen.tsx

"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer";
import { ArrowLeft, BookOpen, Play, PenTool, Brain, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { cn } from "@/lib/utils"; // [!!!] cn 유틸리티 import 추가

interface StudySession {
    id: string;
    wordbookId: string;
    correctWords?: string[];
    incorrectWords?: string[];
}

interface WordResult {
  id: string;
  word: string;
  meaning: string;
  mastered: boolean; // [!!!] 'mastered' 필드 추가
}

interface AggregatedStudyDetailScreenProps {
  periodTitle: string;
  sessions: StudySession[];
  onBack: () => void;
  onStartReview: (mode: string, words: WordResult[], writingType?: 'word' | 'meaning') => void;
}

export function AggregatedStudyDetailScreen({ periodTitle, sessions, onBack, onStartReview }: AggregatedStudyDetailScreenProps) {
  const [correctWords, setCorrectWords] = useState<WordResult[]>([]);
  const [incorrectWords, setIncorrectWords] = useState<WordResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerContent, setDrawerContent] = useState<'modes' | 'writingOptions'>('modes');
  
  const studyModes = [
    { id: "flashcard", name: "플래시카드", icon: BookOpen },
    { id: "autoplay", name: "자동재생", icon: Play },
    { id: "writing", name: "받아쓰기", icon: PenTool },
    { id: "quiz", name: "객관식 퀴즈", icon: Brain },
  ];

  useEffect(() => {
    const fetchWordDetails = async () => {
      if (sessions.length === 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      const correctWordIdMap = new Map<string, { wordbookId: string, wordId: string }>();
      const incorrectWordIdMap = new Map<string, { wordbookId: string, wordId: string }>();

      sessions.forEach(session => {
        session.correctWords?.forEach(wordId => {
          correctWordIdMap.set(`${session.wordbookId}-${wordId}`, { wordbookId: session.wordbookId, wordId });
        });
        session.incorrectWords?.forEach(wordId => {
          incorrectWordIdMap.set(`${session.wordbookId}-${wordId}`, { wordbookId: session.wordbookId, wordId });
        });
      });

      try {
        // [!!!] /api/word 엔드포인트가 'mastered' 값을 포함하여 반환한다고 가정
        const [correct, incorrect] = await Promise.all([
          correctWordIdMap.size > 0 ? fetchWithAuth('/api/word', { method: 'POST', body: JSON.stringify(Array.from(correctWordIdMap.values())) }) : Promise.resolve([]),
          incorrectWordIdMap.size > 0 ? fetchWithAuth('/api/word', { method: 'POST', body: JSON.stringify(Array.from(incorrectWordIdMap.values())) }) : Promise.resolve([]),
        ]);
        setCorrectWords(correct || []);
        setIncorrectWords(incorrect || []);
      } catch (error) {
        console.error("단어 상세 정보 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordDetails();
  }, [sessions]);


  const handleReview = (mode: string, writingType?: 'word' | 'meaning') => {
    if (incorrectWords.length > 0) {
      onStartReview(mode, incorrectWords, writingType);
    } else {
      alert("오답 단어가 없어 복습을 시작할 수 없습니다.");
    }
  };

  // [!!!] 단어 카드를 렌더링하는 헬퍼 함수 (중복 제거)
  const renderWordCard = (item: WordResult) => (
    <Card key={item.id}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          {/* 단어/뜻 */}
          <div className="flex-1">
            <div className="font-semibold text-foreground">{item.word}</div>
            <div className="text-sm text-muted-foreground mt-1">{item.meaning}</div>
          </div>
          {/* 암기 상태 배지 (클릭 불가, 표시 전용) */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs font-semibold rounded-full px-3 py-1 h-auto ml-2 flex-shrink-0",
              item.mastered
                ? "text-green-700 bg-green-100"
                : "text-muted-foreground bg-muted",
              "pointer-events-none" // 클릭 이벤트 방지
            )}
          >
            {item.mastered ? "암기 완료" : "암기 미완료"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white dark:bg-zinc-900">
      <div className="px-4 py-6 border-b border-border sticky top-0 bg-background/80 dark:bg-zinc-900/80 backdrop-blur-sm z-10">
        <div className="relative flex items-center justify-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="absolute left-0 p-2">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{periodTitle}</h1>
        </div>
      </div>
      <div className="p-4">
        {isLoading ? (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        ) : (
            <Tabs defaultValue="incorrect" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="correct">정답 ({correctWords.length})</TabsTrigger>
                <TabsTrigger value="incorrect">오답 ({incorrectWords.length})</TabsTrigger>
            </TabsList>

            {/* [!!!] 정답 탭 수정 */}
            <TabsContent value="correct" className="mt-4">
                <div className="space-y-2">
                  {correctWords.map(renderWordCard)}
                </div>
            </TabsContent>

            {/* [!!!] 오답 탭 수정 */}
            <TabsContent value="incorrect" className="mt-4">
                <div className="space-y-2">
                  {incorrectWords.map(renderWordCard)}
                </div>
            </TabsContent>
            </Tabs>
        )}
      </div>

      {/* 복습 버튼 & Drawer (이하 동일) */}
      <div className="p-4 mt-4">
         <Drawer onOpenChange={(isOpen) => !isOpen && setDrawerContent('modes')}>
            <DrawerTrigger asChild>
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium" disabled={incorrectWords.length === 0 || isLoading}>
                    오답 단어 복습하기
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                {drawerContent === 'modes' && (
                    <div className="p-2">
                        {studyModes.map(mode => {
                            if (mode.id === 'writing') {
                                return (
                                    <Button key={mode.id} variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => setDrawerContent('writingOptions')}>
                                        <mode.icon className="mr-2 h-4 w-4" />
                                        {mode.name}
                                    </Button>
                                );
                            }
                            return (
                                <DrawerClose asChild key={mode.id}>
                                    <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleReview(mode.id)}>
                                        <mode.icon className="mr-2 h-4 w-4" />
                                        {mode.name}
                                    </Button>
                                </DrawerClose>
                            );
                        })}
                    </div>
                )}
                {drawerContent === 'writingOptions' && (
                    <div className="p-2">
                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleReview('writing', 'word')}>
                                뜻 보고 단어 쓰기
                            </Button>
                        </DrawerClose>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleReview('writing', 'meaning')}>
                                단어 보고 뜻 쓰기
                            </Button>
                        </DrawerClose>
                    </div>
                )}
                    <DrawerFooter className="pt-2">
                        <DrawerClose asChild><Button variant="outline">취소</Button></DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
         </Drawer>
      </div>
    </div>
  );
}