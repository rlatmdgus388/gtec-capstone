// components/study/aggregated-study-detail-screen.tsx

"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer";
import { ArrowLeft, BookOpen, Play, PenTool, Brain, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

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
            <TabsContent value="correct" className="mt-4">
                <div className="space-y-2">
                {correctWords.map((item) => (
                    <Card key={item.id}><CardContent className="p-3">
                    <div className="font-semibold text-foreground">{item.word}</div>
                    <div className="text-sm text-muted-foreground mt-1">{item.meaning}</div>
                    </CardContent></Card>
                ))}
                </div>
            </TabsContent>
            <TabsContent value="incorrect" className="mt-4">
                <div className="space-y-2">
                {incorrectWords.map((item) => (
                    <Card key={item.id}><CardContent className="p-3">
                    <div className="font-semibold text-foreground">{item.word}</div>
                    <div className="text-sm text-muted-foreground mt-1">{item.meaning}</div>
                    </CardContent></Card>
                ))}
                </div>
            </TabsContent>
            </Tabs>
        )}
      </div>

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