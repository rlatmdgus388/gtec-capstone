"use client"

import { useState } from "react"
import { CameraCapture } from "./camera-capture"
import { OCRProcessing } from "./ocr-processing"
// AddToWordbookDialog는 더 이상 사용하지 않으므로 import에서 제거합니다.

interface DetectedWord {
  text: string; confidence: number; meaning?: string; selected: boolean;
}

interface PhotoWordCaptureProps {
  imageData: string | null;
  onClose: () => void
  onWordsAdded: (words: DetectedWord[]) => void // Props 변경: 단어 목록만 전달
}

export function PhotoWordCapture({ imageData, onClose, onWordsAdded }: PhotoWordCaptureProps) {
  const [step, setStep] = useState<"capture" | "processing">(
    imageData ? "processing" : "capture"
  );

  const [capturedImage, setCapturedImage] = useState<string | null>(imageData);

  const handleCapture = (newImageData: string) => {
    setCapturedImage(newImageData);
    setStep("processing");
  };

  // 단어 인식이 완료되면 onWordsAdded를 호출하고 컴포넌트를 닫습니다.
  const handleWordsDetected = (words: DetectedWord[]) => {
    onWordsAdded(words);
    onClose();
  };

  const handleBack = () => {
    if (step === "processing") {
      imageData ? onClose() : setStep("capture");
    }
  };

  switch (step) {
    case "capture":
      return <CameraCapture onCapture={handleCapture} onClose={onClose} />;
    case "processing":
      if (!capturedImage) {
        // imageData가 없는 비정상적인 경우, 캡쳐 단계로 돌려보냄
        setStep("capture");
        return null;
      }
      return <OCRProcessing imageData={capturedImage} onWordsSelected={handleWordsDetected} onBack={handleBack} />;
    default:
      return null;
  }
}
