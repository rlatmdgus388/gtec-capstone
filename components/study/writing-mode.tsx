"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check, X, Eye, EyeOff } from "lucide-react"

interface Word {
  id: number
  word: string
  meaning: string
  example?: string
  pronunciation?: string
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
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime] = useState(Date.now())

  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100

  // Create blanks in the word (show first and last letter, hide middle)
  const createBlanks = (word: string) => {
    if (word.length <= 2) return "_".repeat(word.length)
    return word[0] + "_".repeat(word.length - 2) + word[word.length - 1]
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
      setShowHint(false)
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
            <Button variant="ghost" size="sm" onClick={() => setShowHint(!showHint)} className="p-2">
              {showHint ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>

          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Question */}
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">{currentWord.meaning}</h2>
            {currentWord.example && (
              <div className="border-l-2 border-primary/20 pl-4 mb-4">
                <p className="text-sm text-muted-foreground italic">{currentWord.example}</p>
              </div>
            )}
            <div className="mb-4">
              <p className="text-lg text-muted-foreground mb-2">빈칸을 채워 단어를 완성하세요</p>
              <div className="text-3xl font-mono font-bold text-foreground tracking-wider">
                {showHint ? currentWord.word : blankedWord}
              </div>
            </div>
            {currentWord.pronunciation && <p className="text-sm text-muted-foreground">{currentWord.pronunciation}</p>}
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

        {/* Hint */}
        {showHint && !showResult && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">힌트</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">단어 길이: {currentWord.word.length}글자</p>
            </CardContent>
          </Card>
        )}

        {/* Score Display */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            현재 점수: {score} / {currentIndex + (showResult ? 1 : 0)}
          </p>
        </div>
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
