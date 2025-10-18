"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer";
import { ArrowLeft, BookOpen, Play, PenTool, Brain, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface StudySession {
    id: string;
    wordbookName: string;
    mode: string;
    score: number;
    duration: number;
    completedAt: string;
    correctWords?: { wordbookId: string, wordId: string }[] | string[];
    incorrectWords?: { wordbookId: string, wordId: string }[] | string[];
}

interface WordResult {
  id: string; 
  word: string;
  meaning: string;
}

interface StudySessionDetailScreenProps {
  session: StudySession;
  onBack: () => void;
  onStartReview: (mode: string, words: WordResult[], writingType?: 'word' | 'meaning') => void;
  isPeriodDetail?: boolean;
}

export function StudySessionDetailScreen({ session, onBack, onStartReview, isPeriodDetail = false }: StudySessionDetailScreenProps) {
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

  const fetchSessionDetails = useCallback(async () => {
    setIsLoading(true);
    try {
        let correctWordDetails: WordResult[] = [];
        let incorrectWordDetails: WordResult[] = [];

        if (isPeriodDetail) {
            // 기간별 상세 페이지: API 호출 대신 props 데이터를 사용
            const correctIds = session.correctWords as { wordbookId: string, wordId: string }[];
            const incorrectIds = session.incorrectWords as { wordbookId: string, wordId: string }[];

            if (correctIds.length > 0) {
                correctWordDetails = await fetchWithAuth('/api/word', {
                    method: 'POST', body: JSON.stringify(correctIds),
                });
            }
            if (incorrectIds.length > 0) {
                incorrectWordDetails = await fetchWithAuth('/api/word', {
                    method: 'POST', body: JSON.stringify(incorrectIds),
                });
            }
        } else {
            // 기존 세션 상세 페이지: API 호출
            const data = await fetchWithAuth(`/api/study-sessions/${session.id}`);
            correctWordDetails = data.correctWords || [];
            incorrectWordDetails = data.incorrectWords || [];
        }

        setCorrectWords(correctWordDetails);
        setIncorrectWords(incorrectWordDetails);
    } catch (error) {
        console.error("학습 상세 기록 로딩 실패:", error);
    } finally {
        setIsLoading(false);
    }
  }, [session, isPeriodDetail]);

  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);


  const handleReview = (mode: string, writingType?: 'word' | 'meaning') => {
    if (incorrectWords.length > 0) {
      onStartReview(mode, incorrectWords, writingType);
    } else {
      alert("오답 단어가 없어 복습을 시작할 수 없습니다.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      <div className="px-4 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="relative flex items-center justify-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="absolute left-0 p-2">
            <ArrowLeft size={18} className="text-gray-600" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">{session.wordbookName}</h1>
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
                    <div className="font-semibold text-gray-900">{item.word}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.meaning}</div>
                    </CardContent></Card>
                ))}
                </div>
            </TabsContent>
            <TabsContent value="incorrect" className="mt-4">
                <div className="space-y-2">
                {incorrectWords.map((item) => (
                    <Card key={item.id}><CardContent className="p-3">
                    <div className="font-semibold text-gray-900">{item.word}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.meaning}</div>
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
                <Button className="w-full h-12 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-xl font-medium" disabled={incorrectWords.length === 0 || isLoading}>
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