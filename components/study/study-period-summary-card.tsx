// components/study/study-period-summary-card.tsx

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts"

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
  const accuracy = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0
  const chartData = [{ name: 'accuracy', value: accuracy }]

  return (
    <Card
      className="bg-card border-border hover:shadow-md transition-shadow cursor-pointer rounded-3xl"
      onClick={onClick}
    >
      <CardContent className="px-5 py-0 flex items-stretch justify-between">
        <div className="flex flex-col gap-y-5">
          <p className="text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{totalWords}</p>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              정답 {correctCount}
            </Badge>
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
              오답 {incorrectCount}
            </Badge>
          </div>
        </div>
        <div className="w-20 h-20 self-center">
          <RadialBarChart
            width={80}
            height={80}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="90%"
            barSize={8}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={10}
              className="fill-primary"
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-lg font-semibold"
            >
              {`${accuracy}%`}
            </text>
          </RadialBarChart>
        </div>
      </CardContent>
    </Card>
  )
}