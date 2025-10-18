"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check, X } from "lucide-react"

interface Word {
  id: string;
  word: string;
  meaning: string;
}

interface WritingModeProps {
  words: Word[]
  onComplete: (results: {
    correct: number;
    total: number;
    timeSpent: number;
    correctWords: string[];
    incorrectWords: string[];
  }) => void
  onBack: () => void
  type: 'word' | 'meaning'
}

export function WritingMode({ words, onComplete, onBack, type = 'word' }: WritingModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime] = useState(Date.now())
  const [correctWordIds, setCorrectWordIds] = useState<string[]>([]);
  const [incorrectWordIds, setIncorrectWordIds] = useState<string[]>([]);

  // --- ⬇️ 수정된 부분 ⬇️ ---
  if (!words || words.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-4">복습할 단어가 없습니다.</h2>
            <p className="text-muted-foreground mb-6">학습 기록에 오답이 없거나, 단어장이 비어있을 수 있습니다.</p>
            <Button onClick={onBack}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  // --- ⬆️ 수정된 부분 ⬆️ ---

  const currentWord = words[currentIndex];

  if (!currentWord) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card><CardContent className="p-6 text-center">
                <h2 className="text-xl font-bold text-foreground mb-4">단어를 불러오는 중 오류가 발생했습니다.</h2>
                <Button onClick={onBack}>돌아가기</Button>
            </CardContent></Card>
        </div>
    )
  }
  
  const progress = ((currentIndex + 1) / words.length) * 100
  const question = type === 'word' ? currentWord.meaning : currentWord.word;
  const answer = type === 'word' ? currentWord.word : currentWord.meaning;
  const isCorrectOnResult = showResult && userAnswer.toLowerCase().trim() === answer.toLowerCase()

  const createBlanks = (text: string) => {
    return Array(text.length).fill("_").join(" ")
  }
  const blankedWord = createBlanks(answer)

  const checkAnswer = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === answer.toLowerCase()
    setShowResult(true)
    if (isCorrect) {
      setScore(score + 1)
      setCorrectWordIds(prev => [...prev, currentWord.id]);
    } else {
      setIncorrectWordIds(prev => [...prev, currentWord.id]);
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer("")
      setShowResult(false)
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      onComplete({
          correct: score,
          total: words.length,
          timeSpent,
          correctWords: correctWordIds,
          incorrectWords: incorrectWordIds,
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showResult && userAnswer.trim()) {
      checkAnswer()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2"><ArrowLeft size={18} /></Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">쓰기 테스트</h1>
              <p className="text-sm text-muted-foreground">{currentIndex + 1} / {words.length}</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      <div className="px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">{question}</h2>
            <div className="mb-4">
              <p className="text-lg text-muted-foreground mb-2">빈칸을 채워 단어를 완성하세요</p>
              <div className="text-3xl font-mono font-bold text-foreground tracking-tight">{blankedWord}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">답안 입력</label>
                <Input value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} onKeyPress={handleKeyPress} placeholder={type === 'word' ? "영어 단어를 입력하세요" : "단어의 뜻을 입력하세요"} className="h-12 text-lg text-center" disabled={showResult} />
              </div>
              {!showResult ? (
                <Button onClick={checkAnswer} disabled={!userAnswer.trim()} className="w-full h-12 bg-primary hover:bg-primary/90">확인</Button>
              ) : (
                <Button onClick={handleNext} className="w-full h-12 bg-primary hover:bg-primary/90">{currentIndex < words.length - 1 ? "다음 문제" : "결과 보기"}</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                {isCorrectOnResult ? (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"><Check size={32} className="text-green-600" /></div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"><X size={32} className="text-red-600" /></div>
                )}
                <div className="space-y-2">
                  <h3 className={`text-xl font-bold ${isCorrectOnResult ? "text-green-600" : "text-red-600"}`}>{isCorrectOnResult ? "정답입니다!" : "틀렸습니다"}</h3>
                  <div className="space-y-3 text-left">
                    <div><p className="text-sm text-muted-foreground mb-1">문제</p><p className="font-medium">{question}</p></div>
                    <div><p className="text-sm text-muted-foreground mb-1">정답</p><p className="font-medium text-green-600">{answer}</p></div>
                    {!isCorrectOnResult && (
                      <div><p className="text-sm text-muted-foreground mb-1">입력한 답</p><p className="font-medium text-red-600">{userAnswer}</p></div>
                    )}
                  </div>
                </div>
                <Button onClick={handleNext} className="w-full h-12 bg-primary hover:bg-primary/90 mt-4">{currentIndex < words.length - 1 ? "다음 문제" : "결과 보기"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}