"use client";

import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation"; // 부모 컴포넌트에서 제어하므로 삭제
import { fetchStudySessions } from "@/lib/api"; // API 함수 임포트
// import { StudySession } from "@/lib/types"; // StudySession 타입을 여기서 직접 정의하거나, lib/types에서 가져옵니다.
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Skeleton 임포트 추가

// lib/types에 정의가 없다면, 여기에 임시 정의
interface StudySession {
  id: string;
  wordbookName: string;
  completedAt: string;
  correctCount: number;
  incorrectCount: number;
  durationInSeconds: number;
  // study-screen.tsx의 StudySession과 맞추기 위해 추가 (없어도 되면 삭제)
  mode: string;
  score: number;
  duration: number;
}

// 1. 부모(study-screen)로부터 받을 props 정의
interface StudyHistoryScreenProps {
  onBack: () => void;
  onSessionSelect: (session: StudySession) => void;
}

// 2. props (onBack, onSessionSelect) 받기
const StudyHistoryScreen = ({ onBack, onSessionSelect }: StudyHistoryScreenProps) => {
  // const router = useRouter(); // 삭제
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSessions = async () => {
      try {
        setLoading(true);
        const data = await fetchStudySessions();
        setSessions(data);
        setError(null);
      } catch (err) {
        console.error("학습 세션 목록 조회 실패:", err);
        setError("학습 기록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    getSessions();
  }, []);

  const getAccuracy = (correct: number, incorrect: number) => {
    const total = correct + incorrect;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}분 ${s}초`;
  };

  const handleSessionClick = (session: StudySession) => {
    // router.push(...) 대신, 부모에게 선택된 세션을 알림
    onSessionSelect(session);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (error) {
      return <div className="text-center p-8 text-destructive">{error}</div>;
    }

    if (sessions.length === 0) {
      return (
        <div className="text-center p-8 bg-card rounded-lg">
          <History className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            학습 기록이 없습니다
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            학습을 완료하면 여기에 기록이 표시됩니다.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card 
            key={session.id} 
            className="bg-card cursor-pointer hover:bg-muted"
            // 3. handleSessionClick에 session 객체 전달
            onClick={() => handleSessionClick(session)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  {session.wordbookName || "학습 세션"}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(session.completedAt).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="outline">
                    정확도: {getAccuracy(session.correctCount, session.incorrectCount)}%
                  </Badge>
                  <Badge variant="outline">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" /> {session.correctCount}
                  </Badge>
                  <Badge variant="outline">
                    <XCircle className="w-3 h-3 mr-1 text-red-500" /> {session.incorrectCount}
                  </Badge>
                   <Badge variant="outline">
                    시간: {formatDuration(session.durationInSeconds)}
                  </Badge>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-background">
      <header className="flex items-center mb-4">
        {/* 4. 부모로부터 받은 onBack 함수 사용 */}
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold ml-2 text-foreground">전체 학습 기록</h1>
      </header>
      {renderContent()}
    </div>
  );
};

export default StudyHistoryScreen;