"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check, X } from "lucide-react"

// Word 인터페이스에서 example과 pronunciation을 제거합니다
interface Word {
  id: number
  word: string
  meaning: string
}

interface WritingModeProps {
  words: Word[]
  onComplete: (results: { correct: number; total: number; timeSpent: number }) => void
  onBack: () => void
}

export function WritingMode({ words, onComplete, onBack }: WritingModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime] = useState(Date.now())

  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100

  // 단어 길이만큼 밑줄을 생성하고, 밑줄 사이에 공백을 추가합니다
  const createBlanks = (word: string) => {
    return Array(word.length).fill("_").join(" ")
  }

  const blankedWord = createBlanks(currentWord.word)

  const checkAnswer = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === currentWord.word.toLowerCase()
    setShowResult(true)
    if (isCorrect) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer("")
      setShowResult(false)
    } else {
      // Complete the writing test
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      onComplete({ correct: score, total: words.length, timeSpent })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showResult && userAnswer.trim()) {
      checkAnswer()
    }
  }

  const isCorrect = userAnswer.toLowerCase().trim() === currentWord.word.toLowerCase()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft size={18} />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">쓰기 테스트</h1>
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} / {words.length}
              </p>
            </div>
            {/* ▼▼▼ [수정됨] 힌트 보기 버튼을 제거합니다 ▼▼▼ */}
          </div>

          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Question */}
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">{currentWord.meaning}</h2>
            <div className="mb-4">
              <p className="text-lg text-muted-foreground mb-2">빈칸을 채워 단어를 완성하세요</p>
              {/* ▼▼▼ [수정됨] 힌트 로직을 제거하고 항상 빈칸만 보이도록 수정합니다 ▼▼▼ */}
              <div className="text-3xl font-mono font-bold text-foreground tracking-tight">
                {blankedWord}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Input */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">답안 입력</label>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="영어 단어를 입력하세요"
                  className="h-12 text-lg text-center"
                  disabled={showResult}
                />
              </div>

              {!showResult ? (
                <Button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  className="w-full h-12 bg-primary hover:bg-primary/90"
                >
                  확인
                </Button>
              ) : (
                <Button onClick={handleNext} className="w-full h-12 bg-primary hover:bg-primary/90">
                  {currentIndex < words.length - 1 ? "다음 문제" : "결과 보기"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ▼▼▼ [수정됨] 힌트 카드 UI를 제거합니다 ▼▼▼ */}

        {/* ▼▼▼ [수정됨] 점수 표시 UI를 제거합니다 ▼▼▼ */}
      </div>

      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                {isCorrect ? (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check size={32} className="text-green-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <X size={32} className="text-red-600" />
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className={`text-xl font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                    {isCorrect ? "정답입니다!" : "틀렸습니다"}
                  </h3>

                  <div className="space-y-3 text-left">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">문제</p>
                      <p className="font-medium">{currentWord.meaning}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">정답</p>
                      <p className="font-medium text-green-600">{currentWord.word}</p>
                    </div>
                    {!isCorrect && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">입력한 답</p>
                        <p className="font-medium text-red-600">{userAnswer}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={handleNext} className="w-full h-12 bg-primary hover:bg-primary/90 mt-4">
                  {currentIndex < words.length - 1 ? "다음 문제" : "결과 보기"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

