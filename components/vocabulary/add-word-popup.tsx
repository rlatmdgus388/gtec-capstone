"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface AddWordPopupProps {
  isOpen: boolean
  onClose: () => void
  onAddWord: (word: { word: string; meaning: string; example?: string }) => void
}

export function AddWordPopup({ isOpen, onClose, onAddWord }: AddWordPopupProps) {
  const [formData, setFormData] = useState({
    word: "",
    meaning: "",
    example: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.word && formData.meaning) {
      onAddWord(formData)
      setFormData({ word: "", meaning: "", example: "" })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">단어 추가</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X size={18} className="text-gray-500" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word" className="text-sm font-medium text-gray-700">
                새로운 단어 추가
              </Label>
              <Input
                id="word"
                placeholder="새로 추가할 단어를 입력하세요"
                value={formData.word}
                onChange={(e) => setFormData((prev) => ({ ...prev, word: e.target.value }))}
                className="h-12 rounded-xl border-gray-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meaning" className="text-sm font-medium text-gray-700">
                뜻
              </Label>
              <Input
                id="meaning"
                placeholder="단어의 뜻을 입력하세요"
                value={formData.meaning}
                onChange={(e) => setFormData((prev) => ({ ...prev, meaning: e.target.value }))}
                className="h-12 rounded-xl border-gray-200"
                required
              />
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-4">학습하고 있는 단어가 있나요?</p>
              <Button
                type="submit"
                className="w-full h-12 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-xl font-medium"
              >
                단어 추가
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
