"use client";

import React, { useEffect, useState } from 'react';
// [수정] Home 아이콘 import 추가
import { BarChart, LineChart, TrendingUp, History, BookOpen, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { fetchLearningStats } from '@/lib/api'; // fetchLearningStats 경로는 lib/api.ts에 있다고 가정합니다.
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // [수정] Button 컴포넌트 import 추가

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

// 차트 설정
const chartConfig = {
  words: {
    label: '단어 (개)',
    color: 'hsl(var(--chart-1))',
  },
  time: {
    label: '시간 (분)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const StatsPage = () => {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const data = await fetchLearningStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch learning stats:", error);
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, []);

  // recharts에 맞게 데이터 변환
  const chartData = stats?.weeklyData.map(day => ({
    name: day.date,
    '단어 (개)': day.words,
    '시간 (분)': day.time,
  }));


  if (loading) {
    return (
      <div className="p-4 space-y-4 pb-20">
        {/* 요청 3: 홈 버튼 (유지) */}
        <div className="flex items-center justify-between h-10">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="-ml-2">
            <Home className="w-5 h-5" />
          </Button>
          <div className="w-8"></div>
        </div>
        {/* 스켈레톤 UI */}
        <Skeleton className="h-32 w-full" />
        {/* [수정] 스켈레톤 높이도 동일하게 늘림 */}
        <Skeleton className="h-[36rem] w-full" />
      </div>
    )
  }

  if (!stats) {
    return (
         <div className="p-4 space-y-4 pb-20">
            {/* 요청 3: 홈 버튼 (유지) */}
            <div className="flex items-center justify-between h-10">
              <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="-ml-2">
                <Home className="w-5 h-5" />
              </Button>
              <div className="w-8"></div>
            </div>
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    학습 데이터를 불러오는데 실패했습니다.
                </CardContent>
            </Card>
         </div>
    )
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* 요청 3: 공백 및 홈 버튼 (유지) */}
      <div className="flex items-center justify-between h-10">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="-ml-2">
          <Home className="w-5 h-5" />
        </Button>
        <div className="w-8"></div>
      </div>

      {/* 오늘의 학습 현황 탭 (유지) */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            오늘의 학습 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.wordsLearned}</p>
              <p className="text-xs text-muted-foreground">학습 단어</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.studyTime}<span className="text-sm">분</span></p>
              <p className="text-xs text-muted-foreground">학습 시간</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.streak}<span className="text-sm">일</span></p>
              <p className="text-xs text-muted-foreground">연속 학습</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* [수정] 요청 2: 주간 학습 리포트 세로 크기 변경 */}
      <Card className="bg-card w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            주간 학습 리포트
          </CardTitle>
        </CardHeader>
        {/* CardContent의 높이를 h-[36rem] (576px)로 크게 늘림 */}
        <CardContent className="h-[36rem]">
          {stats.weeklyData && stats.weeklyData.length > 0 ? (
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" dataKey="단어 (개)" type="number" allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} stroke={chartConfig.words.color} width={40} />
                      <YAxis yAxisId="right" dataKey="시간 (분)" type="number" allowDecimals={false} orientation="right" fontSize={12} tickLine={false} axisLine={false} stroke={chartConfig.time.color} width={40} />
                      <Tooltip content={<ChartTooltipContent hideIndicator />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar yAxisId="left" dataKey="단어 (개)" fill={chartConfig.words.color} radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" dataKey="시간 (분)" stroke={chartConfig.time.color} type="monotone" dot={false} strokeWidth={2} />
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

      {/* [수정] 요청 1: '학습 기록 보기' 비활성화 (주석 처리 유지) */}
      {/*
      <Card 
        className="bg-card cursor-pointer hover:bg-muted"
        onClick={() => router.push('/study/history')}
      > ... </Card>
      */}

      {/* [수정] 요청 1: '누적 학습 단어' 비활성화 (주석 처리 유지) */}
      {/*
      <Card 
        className="bg-card cursor-pointer hover:bg-muted"
        onClick={() => router.push('/study/aggregated-detail')}
      > ... </Card>
      */}

    </div>
  );
};

export default StatsPage;