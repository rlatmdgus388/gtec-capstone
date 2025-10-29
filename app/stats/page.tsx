"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, LineChart, TrendingUp, History, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { fetchLearningStats } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

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

  const chartConfig = {
    words: {
      label: '단어 (개)',
      color: 'hsl(var(--chart-1))',
    },
    time: {
      label: '시간 (분)',
      color: 'hsl(var(--chart-2))',
    },
  };

  const WeeklyChart = ({ data }: { data: WeeklyData[] }) => (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ComposedChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(-5)} // 'YYYY/MM/DD' -> 'MM/DD'
        />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="words" name="단어 (개)" fill="var(--color-words)" yAxisId="left" barSize={20} />
        <Line type="monotone" dataKey="time" name="시간 (분)" stroke="var(--color-time)" yAxisId="right" />
      </ComposedChart>
    </ChartContainer>
  );

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6 pb-20 bg-background">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6 pb-20 bg-background text-center">
        <p className="text-muted-foreground">학습 통계 데이터를 불러오는 데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-20 bg-background">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>오늘의 학습 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">학습 단어</p>
              <p className="text-2xl font-bold">{stats.wordsLearned}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">학습 시간</p>
              <p className="text-2xl font-bold">{stats.studyTime}분</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">연속 학습</p>
              <p className="text-2xl font-bold">{stats.streak}일</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>주간 학습 리포트</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.weeklyData && stats.weeklyData.length > 0 ? (
            <WeeklyChart data={stats.weeklyData} />
          ) : (
            <p className="text-sm text-center text-muted-foreground mt-4">
              주간 학습 데이터가 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      <Card 
        className="bg-card cursor-pointer hover:bg-muted"
        onClick={() => router.push('/study/history')}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>학습 기록 보기</span>
            <History className="w-5 h-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            지난 학습 세션들의 상세 기록을 확인합니다.
          </p>
        </CardContent>
      </Card>

      <Card 
        className="bg-card cursor-pointer hover:bg-muted"
        onClick={() => router.push('/study/aggregated-detail')}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>누적 학습 단어</span>
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            지금까지 학습한 모든 단어의 목록과 정답률을 봅니다.
          </p>
        </CardContent>
      </Card>

    </div>
  );
};

export default StatsPage;