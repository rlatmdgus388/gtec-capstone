"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
// ▼▼▼ [수정됨] Volume2 아이콘을 import에서 제거합니다 ▼▼▼
import { ArrowLeft, Play, Pause, SkipForward, SkipBack } from "lucide-react"
import { cn } from "@/lib/utils"

// ▼▼▼ [수정됨] Word 인터페이스에서 example과 pronunciation을 제거합니다 ▼▼▼
interface Word {
  id: number
  word: string
  meaning: string
}

interface AutoplayModeProps {
  words: Word[]
  onComplete: () => void
  onBack: () => void
}

export function AutoplayMode({ words, onComplete, onBack }: AutoplayModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showMeaning, setShowMeaning] = useState(false)
  const [intervalDuration, setIntervalDuration] = useState(3000) // 3 seconds

  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      if (!showMeaning) {
        // Show meaning
        setShowMeaning(true)
      } else {
        // Move to next word
        if (currentIndex < words.length - 1) {
          setCurrentIndex(currentIndex + 1)
          setShowMeaning(false)
        } else {
          // Completed all words
          setIsPlaying(false)
          onComplete()
        }
      }
    }, intervalDuration)

    return () => clearInterval(interval)
  }, [isPlaying, showMeaning, currentIndex, words.length, intervalDuration, onComplete])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowMeaning(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowMeaning(false)
    }
  }

  const handleSpeedChange = (speed: number) => {
    setIntervalDuration(speed * 1000)
  }

  return (
    // [수정 1] 'min-h-screen' 제거, 'flex flex-col' 추가
    <div className={cn("flex flex-col bg-background", "page-transition-enter")}>
      {/* [수정 2] 'div' -> 'header'로 변경, 'sticky' 속성 및 클래스 적용 */}
      <header className="sticky top-0 z-40 w-full bg-background border-b">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft size={18} />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">자동 재생</h1>
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} / {words.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[2, 3, 5].map((speed) => (
                <Button
                  key={speed}
                  variant={intervalDuration === speed * 1000 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSpeedChange(speed)}
                  className="text-xs"
                >
                  {speed}초
                </Button>
              ))}
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* [수정 3] 'flex-1' 유지, 하단 여백(pb) 추가 */}
      <div className="flex-1 flex flex-col px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {/* Word Display */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <Card className="w-full max-w-md h-96 shadow-lg">
            <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
              {/* ▼▼▼ [수정됨] 발음 관련 UI를 제거합니다 ▼▼▼ */}
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-foreground mb-4">{currentWord.word}</h2>
              </div>

              {showMeaning && (
                // ▼▼▼ [수정됨] 예문 관련 UI를 제거합니다 ▼▼▼
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-2xl font-bold text-primary">{currentWord.meaning}</h3>
                </div>
              )}

              {!showMeaning && (
                <div className="text-sm text-muted-foreground">
                  {isPlaying ? "뜻이 곧 나타납니다..." : "일시정지됨"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-3 bg-transparent"
            >
              <SkipBack size={20} />
            </Button>

            <Button onClick={handlePlayPause} className="p-4 bg-primary hover:bg-primary/90">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </Button>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === words.length - 1}
              className="p-3 bg-transparent"
            >
              <SkipForward size={20} />
            </Button>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-1">
            {words.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? "bg-primary" : index < currentIndex ? "bg-primary/50" : "bg-muted"
                  }`}
              />
            ))}
          </div>

          {/* Status */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isPlaying ? "자동 재생 중" : "일시정지"} • 속도: {intervalDuration / 1000}초
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}