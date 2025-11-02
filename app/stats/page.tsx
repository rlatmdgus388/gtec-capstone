"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, LineChart, TrendingUp, History, BookOpen, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, LabelList } from 'recharts';
import { fetchLearningStats } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Firebase auth 관련 모듈 임포트
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from "@/lib/utils";
import { BottomNav } from '@/components/navigation/bottom-nav';

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

const chartConfig = {
  words: {
    label: '단어 (개)',
    theme: {
      light: 'oklch(0.145 0 0)',
      dark: '#dedede',
    },
  },
  time: {
    label: '시간 (분)',
    theme: {
      light: 'oklch(0.6 0.118 184.704)',
      dark: 'oklch(0.696 0.17 162.48)',
    },
  },
} satisfies ChartConfig;

const StatsPage = () => {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");

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


  const chartData = stats?.weeklyData.map(day => ({
    name: day.date,
    '단어 (개)': day.words,
    '시간 (분)': day.time,
  }));

  const handleTabChange = (tab: string) => {
    // '/stats' 페이지는 AuthManager 외부에 있으므로
    // 다른 탭으로 이동 시 '/' (AuthManager가 있는) 페이지로 이동합니다.
    router.push('/');
  };

  const handleBack = () => {
    // 뒤로가기 시 브라우저의 history를 사용합니다.
    // (참고: 더 부드러운 퇴장 애니메이션을 원한다면 
    //  isExiting 상태와 setTimeout을 사용할 수 있으나,
    //  다른 페이지들이 진입 애니메이션만 사용한다면 이 방식이 일관됩니다.)
    router.back();
  };


  if (loading) {
    return (
      <>
        {/* ▼▼▼ [수정됨] 애니메이션 클래스를 'page-transition-enter' (오른쪽에서 진입)로 변경 ▼▼▼ */}
        <div className={cn("max-w-lg mx-auto bg-background pb-20", "page-transition-enter")}>
          {/* 스켈레톤 헤더 */}
          <div className="bg-card border-b border-border">
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
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
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    )
  }

  if (!stats) {
    return (
      <>
        {/* ▼▼▼ [수정됨] 애니메이션 클래스 'page-transition-enter' 추가 ▼▼▼ */}
        <div className={cn("max-w-lg mx-auto bg-background pb-20", "page-transition-enter")}>
          {/* 오류 시 헤더 */}
          <div className="bg-card border-b border-border">
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
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
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    )
  }

  const renderLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (!value || value === 0) {
      return null;
    }
    return (
      <text
        x={x + width / 2}
        y={y}
        dy={-4}
        fill="var(--color-words)"
        fontSize={12}
        textAnchor="middle"
      >
        {value}
      </text>
    );
  };

  return (
    <>
      {/* ▼▼▼ [수정됨] 애니메이션 클래스 'page-transition-enter' 추가 ▼▼▼ */}
      <div className={cn("max-w-lg mx-auto bg-background pb-20", "page-transition-enter")}>

        {/* 헤더 */}
        <div className="bg-card border-b border-border">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
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
            <CardContent className="h-80">
              {stats.weeklyData && stats.weeklyData.length > 0 ? (
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--foreground)" }}
                        stroke="var(--foreground)"
                        interval={0}
                      />
                      <YAxis
                        yAxisId="left"
                        dataKey="단어 (개)"
                        type="number"
                        allowDecimals={false}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        stroke="var(--color-words)"
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
                        stroke="var(--color-time)"
                        width={40}
                      />
                      <Tooltip content={<ChartTooltipContent hideIndicator />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar yAxisId="left" dataKey="단어 (개)" fill="var(--color-words)" radius={[4, 4, 0, 0]}>
                        <LabelList
                          dataKey="단어 (개)"
                          position="top"
                          content={renderLabel}
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
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );
};

export default StatsPage;