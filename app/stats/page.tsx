"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, LineChart, TrendingUp, History, BookOpen, ArrowLeft } from 'lucide-react'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
// ▼▼▼ [수정됨] LabelList 임포트 추가 ▼▼▼
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, LabelList } from 'recharts';
import { fetchLearningStats } from '@/lib/api'; // 경로는 실제 위치에 맞게 수정 필요
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Firebase auth 관련 모듈 임포트
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from "@/lib/utils"

interface WeeklyData {
  date: string;
  words: number;
  time: number; // 분 단위
}

interface LearningStats {
  wordsLearned: number;
  studyTime: number; // 분 단위
  streak: number;
  weeklyData: WeeklyData[];
}

// ▼▼▼ [수정됨] chartConfig를 theme 속성을 사용하도록 변경 ▼▼▼
const chartConfig = {
  words: {
    label: '단어 (개)',
    theme: {
      light: 'oklch(0.145 0 0)', // globals.css의 :root --foreground
      dark: '#dedede',             // globals.css의 .dark --foreground
    },
  },
  time: {
    label: '시간 (분)',
    theme: {
      light: 'oklch(0.6 0.118 184.704)', // globals.css의 :root --chart-2
      dark: 'oklch(0.696 0.17 162.48)',   // globals.css의 .dark --chart-2
    },
  },
} satisfies ChartConfig;
// ▲▲▲ [수정됨] chartConfig를 theme 속성을 사용하도록 변경 ▲▲▲

const StatsPage = () => {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const data = await fetchLearningStats();
          setStats(data);
        } catch (error) {
          console.error("Failed to fetch learning stats:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.error("인증되지 않은 사용자입니다. 홈으로 리디렉션합니다.");
        setLoading(false);
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);


  // recharts에 맞게 데이터 변환
  const chartData = stats?.weeklyData.map(day => ({
    name: day.date,
    '단어 (개)': day.words,
    '시간 (분)': day.time,
  }));


  if (loading) {
    return (
      <div className={cn("max-w-lg mx-auto bg-background pb-20", "page-transition-enter-from-left")}>
        {/* 스켈레톤 헤더 (레이아웃 수정됨) */}
        <div className="bg-card border-b border-border">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md" /> 
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div>
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-6">
          <Skeleton className="h-32 w-full" />
          {/* 그래프 스켈레톤 높이 (h-96) */}
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
         <div className="max-w-lg mx-auto bg-background pb-20">
            {/* 오류 시 헤더 (레이아웃 수정됨) */}
            <div className="bg-card border-b border-border">
              <div className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">학습 현황</h1>
                    <p className="text-sm text-muted-foreground">주간 학습 리포트와 통계를 확인하세요.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-6">
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        학습 데이터를 불러오는데 실패했습니다.
                    </CardContent>
                </Card>
            </div>
         </div>
    )
  }

  // ▼▼▼ [수정됨] LabelList에서 사용할 formatter 함수 ▼▼▼
  const renderLabel = (props: any) => {
    const { x, y, width, value } = props;
    // 값이 0이거나 null/undefined이면 레이블을 렌더링하지 않음
    if (!value || value === 0) {
      return null;
    }
    return (
      <text 
        x={x + width / 2} 
        y={y} 
        dy={-4} // 막대 상단에서 약간 띄움
        fill="var(--color-words)" // CSS 변수 참조
        fontSize={12} 
        textAnchor="middle"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="max-w-lg mx-auto bg-background pb-20">
      
      {/* 헤더 (레이아웃 수정됨) */}
      <div className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">학습 현황</h1>
              <p className="text-sm text-muted-foreground">주간 학습 리포트와 통계를 확인하세요.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 오늘의 학습 현황 탭 (유지) */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              오늘의 학습 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{stats.wordsLearned}</p>
                <p className="text-xs text-muted-foreground">학습 단어</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{stats.studyTime}<span className="text-sm">분</span></p>
                <p className="text-xs text-muted-foreground">학습 시간</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{stats.streak}<span className="text-sm">일</span></p>
                <p className="text-xs text-muted-foreground">연속 학습</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주간 학습 리포트 (유지) */}
        <Card className="bg-card w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-primary" />
              주간 학습 리포트
            </CardTitle>
          </CardHeader>
          {/* [수정됨] 그래프 높이 h-80으로 변경 */}
          <CardContent className="h-80"> 
            {stats.weeklyData && stats.weeklyData.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    {/* ▼▼▼ [수정됨] LabelList를 위해 margin-top을 20으로 늘림 ▼▼▼ */}
                    <ComposedChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        {/* ▼▼▼ [수정됨] XAxis에 interval={0} 추가, tick fill 수정 ▼▼▼ */}
                        <XAxis 
                          dataKey="name" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fill: "var(--foreground)" }} 
                          stroke="var(--foreground)"
                          interval={0} // 모든 레이블 표시
                        />
                        <YAxis 
                          yAxisId="left" 
                          dataKey="단어 (개)" 
                          type="number" 
                          allowDecimals={false} 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          stroke="var(--color-words)" // CSS 변수 참조
                          width={40} 
                        />
                        <YAxis 
                          yAxisId="right" 
                          dataKey="시간 (분)" 
                          type="number" 
                          allowDecimals={false} 
                          orientation="right" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          stroke="var(--color-time)" // CSS 변수 참조
                          width={40} 
                        />
                        <Tooltip content={<ChartTooltipContent hideIndicator />} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar yAxisId="left" dataKey="단어 (개)" fill="var(--color-words)" radius={[4, 4, 0, 0]}>
                          {/* ▼▼▼ [수정됨] 그래프 위에 숫자 표시 ▼▼▼ */}
                          <LabelList 
                            dataKey="단어 (개)" 
                            position="top" 
                            content={renderLabel} // 0 제외 커스텀 렌더러 사용
                          />
                        </Bar>
                        <Line yAxisId="right" dataKey="시간 (분)" stroke="var(--color-time)" type="monotone" dot={false} strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-sm text-center text-muted-foreground mt-4">
                주간 학습 데이터가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;

