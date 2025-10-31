"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, ImageIcon, X } from "lucide-react"

interface ImageSelectionModalProps {
  open: boolean
  onClose: () => void
  onCameraSelect: () => void
  onGallerySelect: () => void
}

export function ImageSelectionModal({ open, onClose, onCameraSelect, onGallerySelect }: ImageSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        // 1. 팝업창 배경을 다른 카드들과 동일하게 bg-card로 변경
        className="w-[calc(100vw-3rem)] max-w-sm mx-auto rounded-2xl p-6 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="relative pb-4">
          {/* 2. 텍스트 색상을 text-foreground로 변경 */}
          <DialogTitle className="text-center text-lg font-semibold text-foreground pr-8">이미지 선택</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={onCameraSelect}
            // 3. 하드 코딩된 색상 클래스(bg-white, border-gray-200, hover:bg-gray-50, text-gray-700)를 제거
            //    -> variant="outline"이 테마에 맞게 색상을 자동 적용하도록 함
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl font-medium text-base"
            variant="outline"
          >
            <Camera size={20} />
            카메라로 촬영
          </Button>

          <Button
            onClick={onGallerySelect}
            // 4. 여기도 마찬가지로 하드 코딩된 색상 클래스 제거
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl font-medium text-base"
            variant="outline"
          >
            <ImageIcon size={20} />
            갤러리에서 선택
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
