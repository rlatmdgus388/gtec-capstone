"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input" // Input 컴포넌트를 사용하기 위해 import
import { Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

interface DetectedWord {
  text: string;
  original: string;
  confidence: number;
  meaning?: string;
  selected: boolean;
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
      setIsProcessing(true);
      setError(null);
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

    processImage();
  }, [imageData]);

  const toggleWordSelection = (index: number) => {
    setDetectedWords((prev) => prev.map((word, i) => (i === index ? { ...word, selected: !word.selected } : word)))
  }

  // ▼▼▼ [추가된 부분] ▼▼▼
  // 뜻(meaning)을 수정하는 함수
  const handleMeaningChange = (index: number, newMeaning: string) => {
    setDetectedWords((prev) => 
        prev.map((word, i) => (i === index ? { ...word, meaning: newMeaning } : word))
    );
  }
  // ▲▲▲ [추가된 부분] ▲▲▲

  const handleConfirm = () => {
    const selectedWords = detectedWords.filter((word) => word.selected)
    onWordsSelected(selectedWords)
  }
  
  const renderHighlightedText = () => {
    if (!fullText) return null;
    const detectedOriginalWordSet = new Set(detectedWords.map(w => w.original.toLowerCase()));
    const parts = fullText.split(/(\s+)/);

    return parts.map((part, index) => {
      const cleanedPart = part.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (detectedOriginalWordSet.has(cleanedPart)) {
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
    <div className="flex flex-col h-dvh bg-background">
      {/* Header, 텍스트 인식 결과 등 상단 UI는 기존과 동일 */}
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
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {isProcessing ? (
                <img src={imageData} alt="Captured" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-32 overflow-y-auto rounded-lg bg-white p-4 text-sm whitespace-pre-wrap leading-relaxed">
                  {renderHighlightedText()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 space-y-6 mt-4">
          {isProcessing ? (
            <Card><CardContent className="p-8 text-center"><Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" /><h3 className="text-lg font-medium text-foreground mb-2">텍스트 분석 중...</h3><p className="text-sm text-muted-foreground">AI가 이미지에서 단어를 인식하고 있습니다</p></CardContent></Card>
          ) : error ? (
            <Card><CardContent className="p-8 text-center"><AlertCircle size={48} className="mx-auto text-destructive mb-4" /><h3 className="text-lg font-medium text-foreground mb-2">인식 실패</h3><p className="text-sm text-muted-foreground mb-4">{error}</p><Button onClick={onBack} variant="outline">다시 촬영하기</Button></CardContent></Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">인식된 단어</h2>
                  <p className="text-sm text-muted-foreground">
                    {detectedWords.length}개 단어 발견 • {detectedWords.filter((w) => w.selected).length}개 선택됨
                  </p>
                </div>
                <Button onClick={handleConfirm} disabled={detectedWords.filter((w) => w.selected).length === 0} size="sm" className="bg-primary hover:bg-primary/90">확인</Button>
              </div>

              <div className="space-y-3 pb-20">
                {detectedWords.map((word, index) => (
                  <Card key={index} className={`transition-all ${ word.selected ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md" }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{word.text}</h3>
                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer" onClick={() => toggleWordSelection(index)}>
                                {word.selected && <CheckCircle size={24} className="text-primary bg-white rounded-full" />}
                            </div>
                          </div>
                          {/* ▼▼▼ [수정된 부분] ▼▼▼ */}
                          {/* 뜻을 보여주는 p 태그를 Input 컴포넌트로 변경 */}
                          <Input
                            placeholder="뜻을 입력하세요"
                            value={word.meaning}
                            onChange={(e) => handleMeaningChange(index, e.target.value)}
                            // 입력창 클릭 시 단어 선택이 토글되지 않도록 이벤트 전파 중단
                            onClick={(e) => e.stopPropagation()}
                            className="text-base text-gray-700 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
                          />
                          {/* ▲▲▲ [수정된 부분] ▲▲▲ */}
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
    </div>
  )
}
