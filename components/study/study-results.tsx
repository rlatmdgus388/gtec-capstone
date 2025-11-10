"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, Target, RotateCcw, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudyResultsProps {
  results: {
    correct: number
    total: number
    timeSpent: number
  }
  mode: string
  onRestart: () => void
  onHome: () => void
}

export function StudyResults({ results, mode, onRestart, onHome }: StudyResultsProps) {
  const percentage = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0
  const minutes = Math.floor(results.timeSpent / 60)
  const seconds = results.timeSpent % 60

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A", color: "bg-green-500", message: "완벽해요!" }
    if (percentage >= 80) return { grade: "B", color: "bg-blue-500", message: "잘했어요!" }
    if (percentage >= 70) return { grade: "C", color: "bg-yellow-500", message: "좋아요!" }
    if (percentage >= 60) return { grade: "D", color: "bg-orange-500", message: "조금 더 노력해요!" }
    return { grade: "F", color: "bg-red-500", message: "다시 도전해보세요!" }
  }

  const gradeInfo = getGrade(percentage)

  return (
    // ✅ [수정] 'min-h-screen' -> 'h-full overflow-y-auto pb-20'
    // 부모(AuthManager)의 높이를 100% 채우고, 이 div가 스크롤되도록 변경
    // 하단 버튼이 탭바에 가려지지 않도록 pb-20 추가
    <div className={cn("h-full overflow-y-auto bg-background pb-20", "page-transition-enter")}>
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="px-4 py-8 text-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={40} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">학습 완료!</h1>
          <p className="text-sm text-muted-foreground">{mode} 결과</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Grade */}
        <Card className="text-center">
          <CardContent className="p-8">
            <div className={`w-24 h-24 ${gradeInfo.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className="text-3xl font-bold text-white">{gradeInfo.grade}</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{percentage}%</h2>
            <p className="text-lg text-muted-foreground">{gradeInfo.message}</p>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target size={24} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">{results.correct}</div>
              <div className="text-xs text-muted-foreground">정답</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy size={24} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">{results.total}</div>
              <div className="text-xs text-muted-foreground">총 문제</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock size={24} className="text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : `${seconds}초`}
              </div>
              <div className="text-xs text-muted-foreground">소요시간</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">상세 결과</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">정답률</span>
              <Badge variant={percentage >= 80 ? "default" : "secondary"}>{percentage}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">틀린 문제</span>
              <span className="text-sm font-medium">{results.total - results.correct}개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">평균 시간</span>
              <span className="text-sm font-medium">
                {results.total > 0 ? Math.round(results.timeSpent / results.total) : 0}초/문제
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {/* ✅ [수정] 'pb-20' 제거 (최상위 div로 이동) */}
        <div className="space-y-3">
          <Button onClick={onHome} className="w-full h-12 bg-primary hover:bg-primary/90">
            확인
          </Button>
          <Button variant="outline" onClick={onRestart} className="w-full h-12 bg-transparent">
            <RotateCcw size={18} className="mr-2" />
            다시 학습하기
          </Button>
        </div>
      </div>
    </div>
  )
}