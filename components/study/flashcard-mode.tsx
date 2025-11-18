"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Word {
  id: string;
  word: string;
  meaning: string;
}

interface FlashcardModeProps {
  words: Word[]
  onComplete: (results: {
    correct: number;
    total: number;
    timeSpent: number;
    correctWords: string[];
    incorrectWords: string[];
  }) => void
  onBack: () => void
}

export function FlashcardMode({ words, onComplete, onBack }: FlashcardModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [startTime] = useState(Date.now())
  const [results, setResults] = useState<{ [key: string]: "correct" | "incorrect" }>({})

  const currentWord = words[currentIndex]
  const progress = words.length > 0 ? (Object.keys(results).length / words.length) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = (isCorrect: boolean) => {
    const newResults = { ...results, [currentWord.id]: isCorrect ? "correct" : "incorrect" as "correct" | "incorrect" };
    setResults(newResults);

    if (Object.keys(newResults).length === words.length) {
      const correctCount = Object.values(newResults).filter(r => r === "correct").length;
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const correctWords = Object.keys(newResults).filter(id => newResults[id] === 'correct');
      const incorrectWords = Object.keys(newResults).filter(id => newResults[id] === 'incorrect');

      onComplete({ correct: correctCount, total: words.length, timeSpent, correctWords, incorrectWords });
    } else {
      const nextIndex = words.findIndex((word, index) => index > currentIndex && !newResults[word.id]);
      if (nextIndex !== -1) {
        setCurrentIndex(nextIndex);
      } else {
        const firstUnansweredIndex = words.findIndex(word => !newResults[word.id]);
        setCurrentIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
      }
      setIsFlipped(false);
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
    // [수정 1] 'min-h-screen' 제거, 'flex flex-col' 추가
    <div className={cn("flex flex-col bg-background", "page-transition-enter")}>
      {/* [수정 2] 'div' -> 'header'로 변경, 'sticky' 속성 및 클래스 적용 */}
      <header className="sticky top-0 z-40 w-full bg-background border-b">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2"><ArrowLeft size={18} /></Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">플래시카드</h1>
              <p className="text-sm text-muted-foreground">{Object.keys(results).length} / {words.length}</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>
      {/* [수정 3] 'flex-1' 유지, 하단 여백(pb) 추가 */}
      <div className="flex-1 flex flex-col px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="w-full max-w-sm">
            <Card className="h-80 cursor-pointer transition-all duration-300 hover:shadow-lg" onClick={handleFlip} style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
              <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                {!isFlipped ? (
                  <div className="w-full">
                    <h2 className="text-3xl font-bold text-foreground mb-4">{currentWord.word}</h2>
                    <p className="text-sm text-muted-foreground">카드를 탭하여 뜻을 확인하세요</p>
                  </div>
                ) : (
                  <div className="w-full" style={{ transform: "rotateY(180deg)" }}>
                    <h2 className="text-2xl font-bold text-primary mb-4">{currentWord.meaning}</h2>
                    <p className="text-sm text-muted-foreground">알고 있었나요?</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="space-y-4">
          {isFlipped && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleAnswer(false)} className="flex-1 h-12 text-destructive border-destructive hover:bg-destructive/10 bg-transparent"><X size={18} className="mr-2" /> 모르겠어요</Button>
              <Button onClick={() => handleAnswer(true)} className="flex-1 h-12 bg-primary hover:bg-primary/90"><Check size={18} className="mr-2" /> 알고 있어요</Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handlePrevious} disabled={currentIndex === 0} className="p-2"><ChevronLeft size={20} /></Button>
            <div className="flex items-center gap-2">
              {words.map((word, index) => (
                <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? "bg-primary" : results[word.id] === "correct" ? "bg-green-500" : results[word.id] === "incorrect" ? "bg-red-500" : "bg-muted"}`} />
              ))}
            </div>
            <Button variant="ghost" onClick={handleNext} disabled={currentIndex === words.length - 1} className="p-2"><ChevronRight size={20} /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}