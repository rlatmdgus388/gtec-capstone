// components/study/study-history-screen.tsx

"use client"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Brain, PenTool, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWithAuth } from "@/lib/api";
import { StudyPeriodSummaryCard } from "./study-period-summary-card";
import { AggregatedStudyDetailScreen } from "./aggregated-study-detail-screen";
// ▼▼▼ [수정됨] DrawerTrigger 추가 ▼▼▼
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer";

// ... (인터페이스 정의는 이전과 동일) ...
interface StudySession {
    id: string;
    wordbookName: string;
    mode: string;
    score: number;
    duration: number;
    completedAt: string;
    wordbookId: string;
    correctWords?: string[];
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

type Period = 'today' | '7days' //| '30days';
;

export function StudyHistoryScreen({ onBack, onStartReview }: StudyHistoryScreenProps) {
  const [view, setView] = useState<'main' | 'detail'>('main');
  const [selectedPeriod, setSelectedPeriod] = useState<{ period: Period, title: string } | null>(null);

  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<'modes' | 'writingOptions'>('modes');
  const [allIncorrectWords, setAllIncorrectWords] = useState<WordResult[]>([]);

  const studyModes = [
    { id: "flashcard", name: "플래시카드", icon: BookOpen },
    { id: "autoplay", name: "자동재생", icon: Play },
    { id: "writing", name: "받아쓰기", icon: PenTool },
    { id: "quiz", name: "객관식 퀴즈", icon: Brain },
  ];

  useEffect(() => {
    const fetchAllSessions = async () => {
      setIsLoading(true);
      try {
        const sessionsData: StudySession[] = await fetchWithAuth('/api/study-sessions');
        const processedSessions = sessionsData.map(s => ({
          ...s,
          correctWords: s.correctWords || [],
          incorrectWords: s.incorrectWords || [],
        }));
        setSessions(processedSessions || []);
      } catch (error) {
        console.error("전체 학습 기록 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllSessions();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

    const periodStats = {
      today: { correctCount: 0, incorrectCount: 0, sessions: [] as StudySession[] },
      '7days': { correctCount: 0, incorrectCount: 0, sessions: [] as StudySession[] },
      //'30days': { correctCount: 0, incorrectCount: 0, sessions: [] as StudySession[] },
    };

    const incorrectWordIdMap = new Map<string, { wordbookId: string, wordId: string }>();

    for (const session of sessions) {
      const completedAt = new Date(session.completedAt);
      const correct = session.correctWords?.length || 0;
      const incorrect = session.incorrectWords?.length || 0;
      
      session.incorrectWords?.forEach(wordId => {
        incorrectWordIdMap.set(`${session.wordbookId}-${wordId}`, { wordbookId: session.wordbookId, wordId });
      });

      if (completedAt >= today) {
        periodStats.today.correctCount += correct;
        periodStats.today.incorrectCount += incorrect;
        periodStats.today.sessions.push(session);
      }
      if (completedAt >= sevenDaysAgo) {
        periodStats['7days'].correctCount += correct;
        periodStats['7days'].incorrectCount += incorrect;
        periodStats['7days'].sessions.push(session);
      }
      {/*if (completedAt >= thirtyDaysAgo) {
        periodStats['30days'].correctCount += correct;
        periodStats['30days'].incorrectCount += incorrect;
        periodStats['30days'].sessions.push(session);
      }*/}
    }

    if (incorrectWordIdMap.size > 0 && allIncorrectWords.length === 0) {
        fetchWithAuth('/api/word', { method: 'POST', body: JSON.stringify(Array.from(incorrectWordIdMap.values())) })
            .then(words => setAllIncorrectWords(words || []))
            .catch(err => console.error("전체 오답 단어 로딩 실패:", err));
    }


    return periodStats;
  }, [sessions, allIncorrectWords.length]);


  const handlePeriodClick = (period: Period, title: string) => {
    setSelectedPeriod({ period, title });
    setView('detail');
  }

  const handleStartDirectReview = (mode: string, writingType?: 'word' | 'meaning') => {
    onStartReview(mode, allIncorrectWords, writingType);
    setIsDrawerOpen(false);
  }

  if (view === 'detail' && selectedPeriod) {
    return (
      <AggregatedStudyDetailScreen
        periodTitle={selectedPeriod.title}
        sessions={stats[selectedPeriod.period].sessions}
        onBack={() => setView('main')}
        onStartReview={onStartReview}
      />
    )
  }

  return (
    // ▼▼▼ [수정됨] overflow-y-auto, pb-20, dark:bg-zinc-900 제거 ▼▼▼
    <div className="flex-1 bg-background">
      <div className="px-4 py-6 sticky top-0 bg-background/80 dark:bg-background/80 backdrop-blur-sm z-10">
        <div className="relative flex items-center justify-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="absolute left-0 p-2"><ArrowLeft size={18} className="text-muted-foreground" /></Button>
          <h1 className="text-xl font-bold text-foreground">학습 기록</h1>
        </div>
        <p className="text-center text-muted-foreground text-sm mt-2">매일 오전 12시를 기준으로 갱신됩니다.</p>
      </div>

      {/* ▼▼▼ [수정됨] 하단 패딩 pb-36 추가 (fixed 버튼 공간) ▼▼▼ */}
      <div className="p-4 space-y-4 pb-36">
        {isLoading ? (
          <>
            <Skeleton className="h-28 w-full rounded-2xl" />
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
              onClick={() => handlePeriodClick('today', '오늘의 학습 결과')}
            />
            <StudyPeriodSummaryCard
              title="7일 동안 학습한 단어"
              correctCount={stats['7days'].correctCount}
              incorrectCount={stats['7days'].incorrectCount}
              totalWords={stats['7days'].correctCount + stats['7days'].incorrectCount}
              onClick={() => handlePeriodClick('7days', '최근 7일 학습 결과')}
            />
           {/* <StudyPeriodSummaryCard
              title="30일 동안 학습한 단어"
              correctCount={stats['30days'].correctCount}
              incorrectCount={stats['30days'].incorrectCount}
              totalWords={stats['30days'].correctCount + stats['30days'].incorrectCount}
              onClick={() => handlePeriodClick('30days', '최근 30일 학습 결과')}
            /> }
            {/* ▼▼▼ [수정됨] 버튼을 이 div 밖으로 이동시킴 ▼▼▼ */}
          </>
        )}
      </div>
      
      {/* ▼▼▼ [수정됨] 하단 고정 버튼 래퍼 추가 (fixed, bottom-16) ▼▼▼ */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md z-10 p-4 bg-background border-t border-border">
        <Drawer open={isDrawerOpen} onOpenChange={(isOpen) => { setIsDrawerOpen(isOpen); if (!isOpen) setDrawerContent('modes'); }}>
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
                              <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleStartDirectReview(mode.id)} key={mode.id}>
                                  <mode.icon className="mr-2 h-4 w-4" />
                                  {mode.name}
                              </Button>
                          );
                      })}
                  </div>
              )}
              {drawerContent === 'writingOptions' && (
                  <div className="p-2">
                      <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleStartDirectReview('writing', 'word')}>
                          뜻 보고 단어 쓰기
                      </Button>
                      <Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleStartDirectReview('writing', 'meaning')}>
                          단어 보고 뜻 쓰기
                      </Button>
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


