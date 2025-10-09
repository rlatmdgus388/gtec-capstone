"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Brain, PenTool, Play, Zap } from "lucide-react"

interface StudyMainScreenProps {
  onBack: () => void
  selectedWordbook: {
    id: number
    name: string
    wordCount: number
    progress: number
  }
  onStartStudy: (mode: string) => void
}

export function StudyMainScreen({ onBack, selectedWordbook, onStartStudy }: StudyMainScreenProps) {
  const studyModes = [
    {
      id: "flashcard",
      name: "플래시카드",
      description: "카드를 넘기며 단어 학습",
      icon: BookOpen,
      color: "bg-blue-500",
      difficulty: "쉬움",
    },
    {
      id: "quiz",
      name: "퀴즈",
      description: "객관식 문제로 실력 테스트",
      icon: Brain,
      color: "bg-green-500",
      difficulty: "보통",
    },
    {
      id: "writing",
      name: "쓰기",
      description: "직접 단어를 입력하여 학습",
      icon: PenTool,
      color: "bg-purple-500",
      difficulty: "어려움",
    },
    {
      id: "autoplay",
      name: "자동재생",
      description: "자동으로 단어와 뜻 재생",
      icon: Play,
      color: "bg-orange-500",
      difficulty: "쉬움",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft size={18} className="text-gray-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">학습</h1>
            <p className="text-sm text-gray-600">{selectedWordbook.name}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">학습 진도</span>
            <span className="text-sm font-semibold text-[#FF7A00]">{selectedWordbook.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-[#FF7A00] rounded-full transition-all"
              style={{ width: `${selectedWordbook.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedWordbook.wordCount}개 단어 중{" "}
            {Math.round((selectedWordbook.wordCount * selectedWordbook.progress) / 100)}개 완료
          </p>
        </div>
      </div>

      {/* Study Modes */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">학습 방법을 선택하세요</h2>

        <div className="grid grid-cols-2 gap-4">
          {studyModes.map((mode) => {
            const IconComponent = mode.icon
            return (
              <Card
                key={mode.id}
                className="border-0 shadow-sm bg-white rounded-2xl cursor-pointer hover:shadow-md transition-all"
                onClick={() => onStartStudy(mode.id)}
              >
                <CardContent className="p-5 text-center">
                  <div className={`w-12 h-12 ${mode.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{mode.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{mode.description}</p>
                  <Badge
                    variant="secondary"
                    className={`text-xs border-0 rounded-full ${mode.difficulty === "쉬움"
                      ? "bg-green-100 text-green-700"
                      : mode.difficulty === "보통"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {mode.difficulty}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Start */}
        <div className="mt-8">
          <Button
            onClick={() => onStartStudy("flashcard")}
            className="w-full h-12 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-xl font-medium"
          >
            <Zap size={18} className="mr-2" />
            빠른 학습 시작
          </Button>
        </div>
      </div>
    </div>
  )
}
