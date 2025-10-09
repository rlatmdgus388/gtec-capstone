"use client"

import { useState } from "react"
import { CameraCapture } from "./camera-capture"
import { OCRProcessing } from "./ocr-processing"
import { AddToWordbookDialog } from "./add-to-wordbook-dialog"

interface DetectedWord {
  text: string; confidence: number; meaning?: string; selected: boolean;
}

// 부모로부터 imageData를 받도록 props 타입을 수정합니다.
interface PhotoWordCaptureProps {
  imageData: string | null;
  onClose: () => void
  onWordsAdded: (words: DetectedWord[], wordbookId: number) => void
}

export function PhotoWordCapture({ imageData, onClose, onWordsAdded }: PhotoWordCaptureProps) {
  // imageData 유무에 따라 초기 상태를 결정합니다.
  const [step, setStep] = useState<"capture" | "processing" | "wordbook">(
    imageData ? "processing" : "capture"
  );

  const [capturedImage, setCapturedImage] = useState<string | null>(imageData);
  const [detectedWords, setDetectedWords] = useState<DetectedWord[]>([]);

  // 카메라로 새로 찍었을 때 실행되는 함수
  const handleCapture = (newImageData: string) => {
    setCapturedImage(newImageData);
    setStep("processing");
  };

  const handleWordsDetected = (words: DetectedWord[]) => {
    setDetectedWords(words);
    setStep("wordbook");
  };

  const handleWordsAdded = (wordbookId: number) => {
    onWordsAdded(detectedWords, wordbookId);
    onClose();
  };

  const handleBack = () => {
    if (step === "processing") {
      // 갤러리에서 왔다면 바로 닫고, 카메라에서 왔다면 다시 찍는 화면으로 돌아갑니다.
      imageData ? onClose() : setStep("capture");
    } else if (step === "wordbook") {
      setStep("processing");
    }
  };

  switch (step) {
    case "capture":
      // imageData가 null일 때만(카메라 선택 시) 이 화면이 보입니다.
      return <CameraCapture onCapture={handleCapture} onClose={onClose} />;

    case "processing":
      // imageData가 있을 때(갤러리 선택 시) 이 화면부터 시작합니다.
      return <OCRProcessing imageData={capturedImage!} onWordsSelected={handleWordsDetected} onBack={handleBack} />;

    case "wordbook":
      return <AddToWordbookDialog words={detectedWords} onAddToWordbook={handleWordsAdded} onBack={handleBack} />;

    default:
      return null;
  }
}