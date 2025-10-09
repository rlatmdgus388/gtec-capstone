"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react"

interface Word {
  id: number
  word: string
  meaning: string
  example?: string
  pronunciation?: string
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
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
      </div>

      <div className="px-4 py-6 flex-1 flex flex-col">
        {/* Word Display */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <Card className="w-full max-w-md h-96 shadow-lg">
            <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <h2 className="text-4xl font-bold text-foreground">{currentWord.word}</h2>
                  {currentWord.pronunciation && (
                    <Button variant="ghost" size="sm" className="p-2">
                      <Volume2 size={20} className="text-muted-foreground" />
                    </Button>
                  )}
                </div>
                {currentWord.pronunciation && (
                  <p className="text-sm text-muted-foreground mb-4">{currentWord.pronunciation}</p>
                )}
              </div>

              {showMeaning && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-2xl font-bold text-primary">{currentWord.meaning}</h3>
                  {currentWord.example && (
                    <div className="border-l-2 border-primary/20 pl-4">
                      <p className="text-sm text-muted-foreground italic">{currentWord.example}</p>
                    </div>
                  )}
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
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : index < currentIndex ? "bg-primary/50" : "bg-muted"
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
