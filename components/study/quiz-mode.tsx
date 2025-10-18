"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Check, X } from "lucide-react"

// Word 인터페이스에서 example과 pronunciation을 제거합니다
interface Word {
  id: number
  word: string
  meaning: string
}

interface QuizModeProps {
  words: Word[]
  onComplete: (results: { correct: number; total: number; timeSpent: number }) => void
  onBack: () => void
}

export function QuizMode({ words, onComplete, onBack }: QuizModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime] = useState(Date.now())
  const [timeLeft, setTimeLeft] = useState(30) // 30 seconds per question

  const currentWord = words?.[currentIndex]
  const progress = words?.length ? ((currentIndex + 1) / words.length) * 100 : 0

  // Generate multiple choice options
  const generateOptions = (correctWord: Word, allWords: Word[]) => {
    const options = [correctWord]
    const otherWords = allWords.filter((w) => w.id !== correctWord.id)

    // Add 3 random wrong answers
    while (options.length < 4 && otherWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherWords.length)
      const randomWord = otherWords.splice(randomIndex, 1)[0]
      options.push(randomWord)
    }

    // Shuffle options
    return options.sort(() => Math.random() - 0.5)
  }

  const options = useMemo(() => {
    if (!currentWord || !words?.length) return []
    return generateOptions(currentWord, words)
  }, [currentWord, words])

  const correctAnswerIndex = useMemo(() => {
    if (!currentWord || !options.length) return -1
    return options.findIndex((option) => option.id === currentWord.id)
  }, [currentWord, options])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult && currentWord) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult && currentWord) {
      // Time's up, show result
      setShowResult(true)
    }
  }, [timeLeft, showResult, currentWord])

  if (!words || words.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-4">단어가 없습니다</h2>
            <p className="text-muted-foreground mb-4">퀴즈를 시작하려면 단어를 추가해주세요.</p>
            <Button onClick={onBack}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-4">오류가 발생했습니다</h2>
            <p className="text-muted-foreground mb-4">단어를 불러올 수 없습니다.</p>
            <Button onClick={onBack}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
    setShowResult(true)

    if (answerIndex === correctAnswerIndex) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(30)
    } else {
      // Complete the quiz
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      onComplete({ correct: score, total: words.length, timeSpent })
    }
  }

  const getButtonVariant = (index: number) => {
    if (!showResult) return "outline"
    if (index === correctAnswerIndex) return "default" // Correct answer
    if (index === selectedAnswer && index !== correctAnswerIndex) return "destructive" // Wrong selected answer
    return "outline"
  }

  const getButtonClassName = (index: number) => {
    if (!showResult) return "bg-transparent"
    if (index === correctAnswerIndex) return "bg-green-500 hover:bg-green-600 border-green-500"
    if (index === selectedAnswer && index !== correctAnswerIndex) return "bg-red-500 hover:bg-red-600 border-red-500"
    return "bg-transparent opacity-50"
  }

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
              <h1 className="text-xl font-bold text-foreground">객관식 퀴즈</h1>
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} / {words.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <Badge variant={timeLeft <= 10 ? "destructive" : "secondary"}>{timeLeft}초</Badge>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Question */}
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">{currentWord.word}</h2>
            {/* ▼▼▼ [수정됨] 발음과 예문 관련 UI를 제거합니다 ▼▼▼ */}
            <p className="text-lg text-muted-foreground">이 단어의 뜻은?</p>
          </CardContent>
        </Card>

        {/* Answer Options */}
        <div className="space-y-3">
          {options.map((option, index) => (
            <Button
              key={option.id}
              variant={getButtonVariant(index)}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
              className={`w-full h-14 text-left justify-start text-base ${getButtonClassName(index)}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option.meaning}</span>
                {showResult && index === correctAnswerIndex && <Check size={18} className="ml-auto" />}
                {showResult && index === selectedAnswer && index !== correctAnswerIndex && (
                  <X size={18} className="ml-auto" />
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* ▼▼▼ [수정됨] 점수 표시 UI를 제거합니다 ▼▼▼ */}
      </div>

      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                {selectedAnswer === correctAnswerIndex ? (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check size={32} className="text-green-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <X size={32} className="text-red-600" />
                  </div>
                )}

                <div className="space-y-2">
                  <h3
                    className={`text-xl font-bold ${selectedAnswer === correctAnswerIndex ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {selectedAnswer === correctAnswerIndex ? "정답입니다!" : "틀렸습니다"}
                  </h3>

                  <div className="space-y-3 text-left">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">문제</p>
                      <p className="font-medium">{currentWord.word}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">정답</p>
                      <p className="font-medium text-green-600">{options[correctAnswerIndex]?.meaning}</p>
                    </div>
                    {selectedAnswer !== null && selectedAnswer !== correctAnswerIndex && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">선택한 답</p>
                        <p className="font-medium text-red-600">{options[selectedAnswer]?.meaning}</p>
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
<<<<<<< HEAD

=======
>>>>>>> db7745a (다크모드, 프로필 설정)
