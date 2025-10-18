"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWithAuth } from "@/lib/api"
import { StudySessionDetailScreen } from "./study-session-detail"
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';


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

interface StudyHistoryScreenProps {
  onBack: () => void;
  onStartReview: (mode: string, words: { id: string, word: string, meaning: string }[], writingType?: 'word' | 'meaning') => void;
}

// 기간별 통계 데이터를 위한 인터페이스
interface PeriodStats {
  period: string;
  totalWords: number;
  correctCount: number;
  incorrectCount: number;
  correctWords: { wordbookId: string, wordId: string }[];
  incorrectWords: { wordbookId: string, wordId: string }[];
}

// 새로운 상세 페이지 props
interface DetailPageProps {
  title: string;
  correctWords: { wordbookId: string, wordId: string }[];
  incorrectWords: { wordbookId: string, wordId: string }[];
}


export function StudyHistoryScreen({ onBack, onStartReview }: StudyHistoryScreenProps) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailPageData, setDetailPageData] = useState<DetailPageProps | null>(null);

  const fetchAllSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionsData: StudySession[] = await fetchWithAuth('/api/study-sessions');
      setSessions(sessionsData || []);
    } catch (error) {
      console.error("전체 학습 기록 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSessions();
  }, [fetchAllSessions]);

  const getStatsForPeriod = (days: number): PeriodStats => {
    const now = new Date();
    const periodStart = new Date();
    periodStart.setDate(now.getDate() - (days - 1));
    periodStart.setHours(0, 0, 0, 0);

    const periodSessions = sessions.filter(s => new Date(s.completedAt) >= periodStart);
    
    // --- ▼▼▼ [수정됨] 중복 제거 로직 ▼▼▼ ---
    const correctWordSet = new Set<string>();
    const incorrectWordSet = new Set<string>();
    const correctWordObjects: { wordbookId: string, wordId: string }[] = [];
    const incorrectWordObjects: { wordbookId: string, wordId: string }[] = [];

    periodSessions.forEach(session => {
        session.correctWords?.forEach(wordId => {
            const uniqueId = `${session.wordbookId}-${wordId}`;
            if (!correctWordSet.has(uniqueId)) {
                correctWordSet.add(uniqueId);
                correctWordObjects.push({ wordbookId: session.wordbookId, wordId });
            }
        });
        session.incorrectWords?.forEach(wordId => {
            const uniqueId = `${session.wordbookId}-${wordId}`;
            // 맞춘 단어 목록에 있으면 오답으로 카운트하지 않음 (선택사항)
            // 만약 한 번이라도 틀렸으면 오답으로 카운트하고 싶다면 아래 if문 제거
            if (!correctWordSet.has(uniqueId) && !incorrectWordSet.has(uniqueId)) {
                incorrectWordSet.add(uniqueId);
                incorrectWordObjects.push({ wordbookId: session.wordbookId, wordId });
            }
        });
    });
    
    const correctCount = correctWordSet.size;
    const incorrectCount = incorrectWordSet.size;

    const period = days === 1 ? "오늘" : `지난 ${days}일`;
    // --- ▲▲▲ [수정됨] 중복 제거 로직 ▲▲▲ ---

    return {
        period,
        totalWords: correctCount + incorrectCount,
        correctCount,
        incorrectCount,
        correctWords: correctWordObjects,
        incorrectWords: incorrectWordObjects,
    };
  };


  const todayStats = getStatsForPeriod(1);
  const weekStats = getStatsForPeriod(7);
  const monthStats = getStatsForPeriod(30);

  const statsPeriods: PeriodStats[] = [todayStats, weekStats, monthStats];
  
  if (detailPageData) {
    const fakeSession = {
        id: 'period-detail',
        wordbookName: detailPageData.title,
        mode: '기간별 학습 결과',
        score: 0,
        duration: 0,
        completedAt: new Date().toISOString(),
        correctWords: detailPageData.correctWords,
        incorrectWords: detailPageData.incorrectWords,
    };

    return <StudySessionDetailScreen 
              session={fakeSession as any} 
              onBack={() => setDetailPageData(null)} 
              onStartReview={onStartReview} 
              isPeriodDetail={true}
            />;
  }


  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      <div className="px-4 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="relative flex items-center justify-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="absolute left-0 p-2"><ArrowLeft size={18} className="text-gray-600" /></Button>
          <h1 className="text-xl font-bold text-gray-900">학습 기록</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : sessions.length === 0 ? (
          <Card className="border border-gray-200 rounded-xl"><CardContent className="p-6 text-center text-gray-500">학습 기록이 없습니다.</CardContent></Card>
        ) : (
            statsPeriods.map((stats, index) => {
                const ratio = stats.totalWords > 0 ? Math.round((stats.correctCount / stats.totalWords) * 100) : 0;
                const pieData = [{ name: 'Correct', value: stats.correctCount }, { name: 'Incorrect', value: stats.incorrectCount }];
                const COLORS = ['#FF7A00', '#E5E7EB'];
                
                return (
                    <Card key={index} className="bg-card shadow-md rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => stats.totalWords > 0 && setDetailPageData({
                            title: `${stats.period} 학습한 단어`,
                            correctWords: stats.correctWords,
                            incorrectWords: stats.incorrectWords
                        })}
                    >
                        <CardContent className="p-5">
                            <h3 className="font-semibold text-gray-800 text-lg mb-2">{stats.period} 학습한 단어</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-4xl font-bold text-black mb-3">{stats.totalWords}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">정답 {stats.correctCount}</Badge>
                                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">오답 {stats.incorrectCount}</Badge>
                                    </div>
                                </div>
                                <div className="w-24 h-24">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={30}
                                                outerRadius={40}
                                                startAngle={90}
                                                endAngle={450}
                                                paddingAngle={stats.totalWords > 0 ? 2 : 0}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold fill-gray-800">
                                                {stats.totalWords > 0 ? `${ratio}%` : '-'}
                                            </text>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })
        )}
      </div>
    </div>
  )
}