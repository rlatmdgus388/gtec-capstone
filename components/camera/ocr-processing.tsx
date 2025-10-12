"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Zap, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"

interface DetectedWord {
  text: string
  confidence: number
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
  const [fullText, setFullText] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processImage = async () => {
      setIsProcessing(true)
      setError(null)
      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData }),
        });

        if (!response.ok) {
          throw new Error('텍스트 인식에 실패했습니다.');
        }

        const responseData = await response.json();

        const formattedWords = responseData.words.map((word: any) => ({
          ...word,
          meaning: '',
          selected: false,
        }));

        setFullText(responseData.fullText);
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
  
  const renderHighlightedText = () => {
    if (!fullText) return null;
    const detectedWordSet = new Set(detectedWords.map(w => w.text.toLowerCase()));
    const parts = fullText.split(/(\s+)/);

    return parts.map((part, index) => {
      const cleanedPart = part.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (detectedWordSet.has(cleanedPart)) {
        return (
          <span key={index} className="bg-orange-200 rounded-sm px-0.5">
            {part}
          </span>
        );
      }
      return part;
    });
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2 self-center">
              <ArrowLeft size={20} className="text-gray-700" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">텍스트 인식</h1>
              <p className="text-sm text-muted-foreground">AI가 이미지에서 단어를 찾고 있습니다</p>
            </div>
          </div>
          
          {/* Captured Image Preview or Highlighted Text */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {isProcessing ? (
                <img
                  src={imageData || "/placeholder.svg"}
                  alt="Captured"
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-32 overflow-y-auto rounded-lg bg-white p-4 text-sm whitespace-pre-wrap leading-relaxed">
                  {renderHighlightedText()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 space-y-6 mt-4">
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
              <Button
                onClick={handleConfirm}
                disabled={detectedWords.filter((w) => w.selected).length === 0}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                확인
              </Button>
            </div>

            {/* Detected Words */}
            <div className="space-y-3 pb-20">
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
          </>
        )}
      </div>
    </div>
  )
}