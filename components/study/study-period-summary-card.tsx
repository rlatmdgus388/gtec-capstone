"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StudyPeriodSummaryCardProps {
  title: string
  totalWords: number
  correctCount: number
  incorrectCount: number
  onClick: () => void
}

export function StudyPeriodSummaryCard({
  title,
  totalWords,
  correctCount,
  incorrectCount,
  onClick,
}: StudyPeriodSummaryCardProps) {
  return (
    <Card
      className="bg-card border-border hover:shadow-md transition-shadow cursor-pointer rounded-3xl"
      onClick={onClick}
    >
      <CardContent className="px-5 py-3">
        <div className="flex flex-col gap-y-3">
          <p className="text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{totalWords}</p>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800">
              정답 {correctCount}
            </Badge>
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800">
              오답 {incorrectCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}