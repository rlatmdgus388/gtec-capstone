"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
// ▼▼▼ [수정됨] RotateCcw 아이콘을 import 목록에서 제거합니다 ▼▼▼
import { ArrowLeft, Check, X, ChevronLeft, ChevronRight } from "lucide-react"

// Word 인터페이스에서 example과 pronunciation을 제거합니다
interface Word {
  id: number
  word: string
  meaning: string
}

interface FlashcardModeProps {
  words: Word[]
  onComplete: (results: { correct: number; total: number; timeSpent: number }) => void
  onBack: () => void
}

export function FlashcardMode({ words, onComplete, onBack }: FlashcardModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [startTime] = useState(Date.now())
  const [results, setResults] = useState<{ [key: number]: "correct" | "incorrect" | null }>({})

  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = (isCorrect: boolean) => {
    setResults((prev) => ({ ...prev, [currentWord.id]: isCorrect ? "correct" : "incorrect" }))

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      // Complete the session
      const correct = Object.values({ ...results, [currentWord.id]: isCorrect ? "correct" : "incorrect" }).filter(
        (r) => r === "correct",
      ).length
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      onComplete({ correct, total: words.length, timeSpent })
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
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
              <h1 className="text-xl font-bold text-foreground">플래시카드</h1>
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} / {words.length}
              </p>
            </div>
            {/* ▼▼▼ [수정됨] 리플레이 버튼을 제거합니다 ▼▼▼ */}
          </div>

          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="px-4 py-6 flex-1 flex flex-col">
        {/* Flashcard */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="w-full max-w-sm">
            <Card
              className="h-80 cursor-pointer transition-all duration-300 hover:shadow-lg"
              onClick={handleFlip}
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                {!isFlipped ? (
                  // ▼▼▼ [수정됨] 카드 앞면: 발음 관련 UI를 제거합니다 ▼▼▼
                  <div className="w-full">
                    <h2 className="text-3xl font-bold text-foreground mb-4">{currentWord.word}</h2>
                    <p className="text-sm text-muted-foreground">카드를 탭하여 뜻을 확인하세요</p>
                  </div>
                ) : (
                  // ▼▼▼ [수정됨] 카드 뒷면: 예문 관련 UI를 제거합니다 ▼▼▼
                  <div className="w-full" style={{ transform: "rotateY(180deg)" }}>
                    <h2 className="text-2xl font-bold text-primary mb-4">{currentWord.meaning}</h2>
                    <p className="text-sm text-muted-foreground">알고 있었나요?</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation and Answer Buttons */}
        <div className="space-y-4">
          {isFlipped && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleAnswer(false)}
                className="flex-1 h-12 text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
              >
                <X size={18} className="mr-2" />
                모르겠어요
              </Button>
              <Button onClick={() => handleAnswer(true)} className="flex-1 h-12 bg-primary hover:bg-primary/90">
                <Check size={18} className="mr-2" />
                알고 있어요
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handlePrevious} disabled={currentIndex === 0} className="p-2">
              <ChevronLeft size={20} />
            </Button>

            <div className="flex items-center gap-2">
              {words.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex
                      ? "bg-primary"
                      : results[words[index].id] === "correct"
                        ? "bg-green-500"
                        : results[words[index].id] === "incorrect"
                          ? "bg-red-500"
                          : "bg-muted"
                    }`}
                />
              ))}
            </div>

            <Button variant="ghost" onClick={handleNext} disabled={currentIndex === words.length - 1} className="p-2">
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
<<<<<<< HEAD

=======
>>>>>>> db7745a (다크모드, 프로필 설정)
