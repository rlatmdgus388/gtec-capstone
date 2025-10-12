"use client"

import { useState } from "react"
import { CameraCapture } from "./camera-capture"
import { OCRProcessing } from "./ocr-processing"
import { AddToWordbookDialog } from "./add-to-wordbook-dialog"

interface DetectedWord {
  text: string; confidence: number; meaning?: string; selected: boolean;
}

interface PhotoWordCaptureProps {
  imageData: string | null;
  onClose: () => void
  onWordsAdded: (words: any[], wordbookId: number) => void
}

export function PhotoWordCapture({ imageData, onClose, onWordsAdded }: PhotoWordCaptureProps) {
  const [step, setStep] = useState<"capture" | "processing" | "wordbook">(
    imageData ? "processing" : "capture"
  );

  const [capturedImage, setCapturedImage] = useState<string | null>(imageData);
  const [detectedWords, setDetectedWords] = useState<DetectedWord[]>([]);

  const handleCapture = (newImageData: string) => {
    setCapturedImage(newImageData);
    setStep("processing");
  };

  const handleWordsDetected = (words: DetectedWord[]) => {
    setDetectedWords(words);
    setStep("wordbook");
  };

  const handleWordsAddedToWordbook = (wordbookId: number) => {
    onWordsAdded(detectedWords, wordbookId);
    onClose();
  };

  const handleBack = () => {
    if (step === "processing") {
      imageData ? onClose() : setStep("capture");
    } else if (step === "wordbook") {
      setStep("processing");
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
    case "wordbook":
      return <AddToWordbookDialog words={detectedWords} onAddToWordbook={handleWordsAddedToWordbook} onBack={handleBack} />;
    default:
      return null;
  }
}
