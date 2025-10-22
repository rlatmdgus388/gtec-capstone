// app/stats/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // recharts 라이브러리 사용
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// API 응답 데이터 타입 정의 (API 실제 응답에 맞게)
interface LearningStatsData {
  wordsLearned: number;
  studyTime: number;
  streak: number;
  weeklyData?: { date: string; words: number; time: number }[];
}

// recharts에 맞는 데이터 타입 정의
interface ChartData {
    name: string; // X축 레이블 (날짜)
    '학습 단어': number;
    '학습 시간(분)': number;
}

export default function StatsPage() {
  const [statsData, setStatsData] = useState<LearningStatsData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data: LearningStatsData = await fetchWithAuth('/api/learning-stats');
        setStatsData(data);

        // API 데이터를 recharts 형식으로 변환
        const formattedChartData = data.weeklyData?.map(day => ({
            name: day.date,
            '학습 단어': day.words,
            '학습 시간(분)': day.time,
        })) || [];
        setChartData(formattedChartData);

      } catch (error) {
        console.error("Failed to load stats:", error);
        // 에러 처리 (예: toast 메시지)
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []); // 빈 배열로 마운트 시 한 번만 실행

  return (
    <div className="p-4 space-y-6 pb-20"> {/* 하단 여백 추가 */}
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold text-gray-800">나의 학습 통계</h1>
      </div>

      {isLoading ? (
        // 로딩 스켈레톤
        <div className="space-y-6">
            <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
            <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      ) : statsData ? (
        // 데이터 로딩 완료 시 UI
        <>
          {/* 요약 카드 */}
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                 <div>
                    <p className="text-2xl font-bold text-primary">{statsData.wordsLearned}</p>
                    <p className="text-xs text-muted-foreground">오늘 학습 단어</p>
                 </div>
                 <div>
                    <p className="text-2xl font-bold text-primary">{statsData.studyTime}<span className="text-sm">분</span></p>
                    <p className="text-xs text-muted-foreground">오늘 학습 시간</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold text-primary">{statsData.streak}<span className="text-sm">일</span></p>
                    <p className="text-xs text-muted-foreground">연속 학습</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 막대 그래프 카드 */}
          <Card className="rounded-xl border shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">주간 학습량</CardTitle>
            </CardHeader>
            <CardContent className="h-64"> {/* 차트 높이 지정 */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}> {/* 여백 조정 */}
                  <CartesianGrid strokeDasharray="3 3" vertical={false} /> {/* 세로선 제거 */}
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} stroke="#8884d8" width={40}/>
                  <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} stroke="#82ca9d" width={40}/>
                  <Tooltip contentStyle={{ fontSize: '12px', padding: '5px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="학습 단어" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="학습 시간(분)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        // 데이터 로딩 실패 시
        <Card className="rounded-xl border">
            <CardContent className="p-6 text-center text-muted-foreground">
                학습 데이터를 불러오는데 실패했습니다.
            </CardContent>
        </Card>
      )}
    </div>
  );
}