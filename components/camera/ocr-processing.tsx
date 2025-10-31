"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input" // Input 컴포넌트를 사용하기 위해 import
import { Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

interface DetectedWord {
  text: string;
  original: string;
  confidence?: number; // Tesseract의 confidence. Gemini는 없으므로 optional
  meaning?: string;
  selected: boolean;
  partOfSpeech?: string; // [추가] Gemini가 반환할 품사
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
        // --- 1. OCR API 호출 (기존과 동일) ---
        // Tesseract.js가 전체 텍스트를 추출합니다.
        const ocrResponse = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData }),
        });

        if (!ocrResponse.ok) {
          throw new Error('1. 텍스트 인식(OCR)에 실패했습니다.');
        }

        const ocrData = await ocrResponse.json();
        setFullText(ocrData.fullText); // 전체 텍스트 UI 업데이트

        if (!ocrData.fullText || ocrData.fullText.trim().length === 0) {
           setError("이미지에서 텍스트를 찾을 수 없습니다.");
           setDetectedWords([]);
           setIsProcessing(false);
           return;
        }

        // --- 2. [신규] Gemini 분석 API 호출 ---
        // OCR로 얻은 fullText를 Gemini API로 보냅니다.
        const analysisResponse = await fetch('/api/gemini-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: ocrData.fullText }),
        });

        if (!analysisResponse.ok) {
          throw new Error('2. AI 단어 분석(Gemini)에 실패했습니다.');
        }

        const analysisData = await analysisResponse.json(); // [{ text, original, partOfSpeech, meaning }]

        // --- 3. [변경] Gemini 응답으로 상태 업데이트 ---
        // Tesseract의 단어 목록(ocrData.words) 대신 Gemini의 목록을 사용합니다.
        const formattedWords = analysisData.map((word: any) => ({
          text: word.text || word.original, // text 필드가 없을 경우 original 사용
          original: word.original,
          meaning: word.meaning || "", // 뜻이 없으면 빈 문자열
          partOfSpeech: word.partOfSpeech || "", // 품사가 없으면 빈 문자열
          selected: false, // 기본값
        }));

        setDetectedWords(formattedWords);

      } catch (err: any) {
        setError(err.message || "텍스트 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
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
    // 'original' (원형) 대신 'text' (실제 텍스트) 기준으로 Set 생성
    const detectedWordTextSet = new Set(detectedWords.map(w => w.text.toLowerCase())); // [수정]
    const parts = fullText.split(/(\s+)/);

    return parts.map((part, index) => {
      const cleanedPart = part.replace(/[^a-zA-Z]/g, '').toLowerCase();
      // 수정된 Set으로 검사
      if (detectedWordTextSet.has(cleanedPart)) { // [수정]
        return (
          <span key={index} className="bg-primary text-primary-foreground rounded-sm px-0.5">
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
      <div className="border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2 self-center">
              <ArrowLeft size={20} className="text-muted-foreground" />
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
                <div className="w-full h-32 overflow-y-auto rounded-lg bg-background p-4 text-sm whitespace-pre-wrap leading-relaxed">
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
                            <div className="flex items-center">
                              {/* 1. 'text' (원본) 대신 'original' (원형)을 기본으로 표시 */}
                              <h3 className="text-lg font-semibold text-foreground">{word.original}</h3>

                              {/* 2. 품사 표시 */}
                              {word.partOfSpeech && (
                                <span className="text-sm text-muted-foreground ml-2 italic">{word.partOfSpeech}</span>
                              )}

                              {/* 3. 원형과 원본 텍스트가 다를 경우, 괄호로 원본 표시 */}
                              {word.original.toLowerCase() !== word.text.toLowerCase() && (
                                <span className="text-sm text-muted-foreground ml-2">({word.text})</span>
                              )}
                            </div>
                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer" onClick={() => toggleWordSelection(index)}>
                                {word.selected && <CheckCircle size={24} className="text-primary bg-background rounded-full" />}
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
                            className="text-base border-0 focus-visible:ring-1 focus-visible:ring-ring"
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
