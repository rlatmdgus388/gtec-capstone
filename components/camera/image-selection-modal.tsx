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
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="w-[calc(100vw-3rem)] max-w-sm mx-auto rounded-2xl p-6 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="relative pb-4">
          <DialogTitle className="text-center text-lg font-semibold text-gray-900 pr-8">이미지 선택</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-0 top-0 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
          >
            <X size={16} />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={onCameraSelect}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-base"
            variant="outline"
          >
            <Camera size={20} />
            카메라로 촬영
          </Button>

          <Button
            onClick={onGallerySelect}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-base"
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
