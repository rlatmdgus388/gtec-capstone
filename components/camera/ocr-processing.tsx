"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Zap, CheckCircle, AlertCircle, Eye, Plus } from "lucide-react"

interface DetectedWord {
  text: string
  meaning?: string
  selected: boolean
}

interface OCRProcessingProps {
  imageData: string
  onWordsSelected: (words: DetectedWord[]) => void
  onBack: () => void
}

export function OCRProcessing({ imageData, onWordsSelected, onBack }: OCRProcessingProps) {
  const [isProcessing, setIsProcessing] = useState(true)
  const [detectedWords, setDetectedWords] = useState<DetectedWord[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processImage = async () => {
      setIsProcessing(true)
      setError(null)

      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageData }),
        });

        if (!response.ok) {
          throw new Error('텍스트 인식에 실패했습니다.');
        }

        const detectedData = await response.json();

        const formattedWords = detectedData.map((word: any) => ({
          text: word.text,
          meaning: '',
          selected: true, // 신뢰도 구분이 없으므로 모든 단어를 기본 선택
        }));

        setDetectedWords(formattedWords);

      } catch (err: any) {
        setError(err.message || "텍스트 인식 중 오류가 발생했습니다. 다시 시도해주세요.");
      } finally {
        setIsProcessing(false);
      }
    };

    processImage()
  }, [imageData])

  const toggleWordSelection = (index: number) => {
    setDetectedWords((prev) => prev.map((word, i) => (i === index ? { ...word, selected: !word.selected } : word)))
  }

  const handleConfirm = () => {
    const selectedWords = detectedWords.filter((word) => word.selected)
    onWordsSelected(selectedWords)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Zap size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">텍스트 인식</h1>
              <p className="text-sm text-muted-foreground">AI가 이미지에서 단어를 찾고 있습니다</p>
            </div>
          </div>

          {/* Captured Image Preview */}
          <Card className="mb-4">
            <CardContent className="p-3">
              <img
                src={imageData || "/placeholder.svg"}
                alt="Captured"
                className="w-full h-32 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {isProcessing ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">텍스트 분석 중...</h3>
              <p className="text-sm text-muted-foreground">AI가 이미지에서 단어를 인식하고 있습니다</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle size={48} className="mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">인식 실패</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={onBack} variant="outline">
                다시 촬영하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">인식된 단어</h2>
                <p className="text-sm text-muted-foreground">
                  {detectedWords.length}개 단어 발견 • {detectedWords.filter((w) => w.selected).length}개 선택됨
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Eye size={16} className="mr-2" />
                미리보기
              </Button>
            </div>

            {/* Detected Words */}
            <div className="space-y-3">
              {detectedWords.map((word, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all ${
                    word.selected ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
                  }`}
                  onClick={() => toggleWordSelection(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{word.text}</h3>
                          {word.selected && <CheckCircle size={16} className="text-primary" />}
                        </div>
                        {word.meaning && <p className="text-base text-muted-foreground">{word.meaning}</p>}
                      </div>
                      <div className="ml-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            word.selected ? "bg-primary border-primary" : "border-muted-foreground"
                          }`}
                        >
                          {word.selected && <CheckCircle size={16} className="text-primary-foreground" />}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pb-6">
              <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                다시 촬영
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={detectedWords.filter((w) => w.selected).length === 0}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Plus size={16} className="mr-2" />
                {detectedWords.filter((w) => w.selected).length}개 단어 추가
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}