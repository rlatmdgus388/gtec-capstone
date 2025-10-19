"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Clock, BookOpen, Play, PenTool, Brain, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWithAuth } from "@/lib/api"
import { StudySessionDetailScreen } from "./study-session-detail"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface StudySession {
    id: string;
    wordbookName: string;
    mode: string;
    score: number;
    duration: number;
    completedAt: string;
    wordbookId: string;
    incorrectWords?: string[];
}

interface WordResult {
  id: string;
  word: string;
  meaning: string;
}

interface StudyHistoryScreenProps {
  onBack: () => void;
  onStartReview: (mode: string, words: WordResult[], writingType?: 'word' | 'meaning') => void;
}

export function StudyHistoryScreen({ onBack, onStartReview }: StudyHistoryScreenProps) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [allIncorrectWords, setAllIncorrectWords] = useState<WordResult[]>([]);
  const [drawerContent, setDrawerContent] = useState<'modes' | 'writingOptions'>('modes');
  
  const studyModes = [
    { id: "flashcard", name: "플래시카드", icon: BookOpen },
    { id: "autoplay", name: "자동재생", icon: Play },
    { id: "writing", name: "받아쓰기", icon: PenTool },
    { id: "quiz", name: "객관식 퀴즈", icon: Brain },
  ];

  const fetchAllSessionsAndWords = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionsData: StudySession[] = await fetchWithAuth('/api/study-sessions');
      setSessions(sessionsData || []);

      if (sessionsData && sessionsData.length > 0) {
        const wordIdsToFetch: { wordbookId: string, wordId: string }[] = [];
        const uniqueWordIds = new Set<string>();

        sessionsData.forEach((session) => {
          if (session.wordbookId && session.incorrectWords && session.incorrectWords.length > 0) {
            session.incorrectWords.forEach((wordId: string) => {
              const uniqueId = `${session.wordbookId}-${wordId}`;
              if (!uniqueWordIds.has(uniqueId)) {
                uniqueWordIds.add(uniqueId);
                wordIdsToFetch.push({ wordbookId: session.wordbookId, wordId: wordId });
              }
            });
          }
        });

        if (wordIdsToFetch.length > 0) {
          const incorrectWordsData = await fetchWithAuth('/api/word', {
            method: 'POST',
            body: JSON.stringify(wordIdsToFetch),
          });
          setAllIncorrectWords(incorrectWordsData || []);
        } else {
          setAllIncorrectWords([]);
        }
      } else {
        setAllIncorrectWords([]);
      }
    } catch (error) {
      console.error("전체 학습 기록 또는 오답 단어 로딩 실패:", error);
      setAllIncorrectWords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSessionsAndWords();
  }, [fetchAllSessionsAndWords]);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "방금 전";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "어제";
    return `${diffInDays}일 전`;
  }

  const handleTotalReview = (mode: string, writingType?: 'word' | 'meaning') => {
    if (allIncorrectWords.length > 0) {
        onStartReview(mode, allIncorrectWords, writingType);
    } else {
        alert("복습할 오답 단어가 없습니다.");
    }
  };
  
  if (selectedSession) {
    return <StudySessionDetailScreen session={selectedSession} onBack={() => setSelectedSession(null)} onStartReview={onStartReview} />;
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      <div className="px-4 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="relative flex items-center justify-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="absolute left-0 p-2"><ArrowLeft size={18} className="text-gray-600" /></Button>
          <h1 className="text-xl font-bold text-gray-900">학습 기록</h1>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : sessions.length === 0 ? (
          <Card className="border border-gray-200 rounded-xl"><CardContent className="p-6 text-center text-gray-500">학습 기록이 없습니다.</CardContent></Card>
        ) : (
            sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 shadow-sm bg-white rounded-xl" onClick={() => setSelectedSession(session)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-black mb-0.5 text-base">{session.wordbookName}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{session.mode}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {session.duration < 60 ? `${session.duration}초` : `${Math.floor(session.duration / 60)}분`}
                        </span>
                        <span>{formatRelativeTime(session.completedAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#FF7A00]">{session.score}%</div>
                      <div className="text-[16px] text-gray-500">점수</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
      
      <div className="p-4 mt-4">
         <Drawer onOpenChange={(isOpen) => !isOpen && setDrawerContent('modes')}>
            <DrawerTrigger asChild>
                <Button className="w-full h-12 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-xl font-medium" disabled={allIncorrectWords.length === 0 || isLoading}>
                    전체 오답 복습하기
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
                                        <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleTotalReview(mode.id)}>
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
                                <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleTotalReview('writing', 'word')}>
                                    뜻 보고 단어 쓰기
                                </Button>
                            </DrawerClose>
                            <DrawerClose asChild>
                                <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleTotalReview('writing', 'meaning')}>
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
  )
}