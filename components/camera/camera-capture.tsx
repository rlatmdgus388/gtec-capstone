"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, X, RotateCcw, Zap, Check } from "lucide-react"

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageData)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }, [capturedImage, onCapture])

  // Start camera when component mounts
  useState(() => {
    startCamera()
    return () => stopCamera()
  })

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4 pt-8">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X size={20} />
          </Button>
          <div className="text-center">
            <h1 className="text-white font-medium">단어 촬영</h1>
            <p className="text-white/80 text-sm">단어가 포함된 텍스트를 촬영하세요</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full flex items-center justify-center">
        {!capturedImage ? (
          <>
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-white">
                <Camera size={64} className="mb-4 opacity-50" />
                <p className="text-lg mb-2">카메라 준비 중...</p>
                <p className="text-sm opacity-80">잠시만 기다려주세요</p>
              </div>
            )}

            {/* Capture Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Focus Frame */}
              <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
              </div>

              {/* Instructions */}
              <div className="absolute bottom-32 left-4 right-4">
                <Card className="bg-black/50 border-white/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Zap size={16} className="text-primary" />
                      <span>텍스트가 프레임 안에 들어오도록 조정하세요</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent">
        <div className="p-6 pb-8">
          {!capturedImage ? (
            <div className="flex items-center justify-center">
              <Button
                size="lg"
                onClick={capturePhoto}
                disabled={!cameraActive || isCapturing}
                className="w-20 h-20 rounded-full bg-white hover:bg-white/90 text-black p-0"
              >
                <Camera size={32} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={retakePhoto}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RotateCcw size={20} className="mr-2" />
                다시 촬영
              </Button>
              <Button size="lg" onClick={confirmCapture} className="bg-primary hover:bg-primary/90">
                <Check size={20} className="mr-2" />
                사용하기
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
