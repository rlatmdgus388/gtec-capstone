"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"

interface AddWordToVocabularyScreenProps {
  onBack: () => void
  wordbooks: Array<{ id: number; name: string }>
  onAddWord: (word: { word: string; meaning: string; wordbookId: number }) => void
}

export function AddWordToVocabularyScreen({ onBack, wordbooks, onAddWord }: AddWordToVocabularyScreenProps) {
  const [formData, setFormData] = useState({
    word: "",
    meaning: "",
    wordbookId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.word && formData.meaning && formData.wordbookId) {
      onAddWord({
        word: formData.word,
        meaning: formData.meaning,
        wordbookId: Number.parseInt(formData.wordbookId),
      })
      onBack()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft size={18} className="text-gray-600" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">단어장에 단어 추가</h1>
          <div className="ml-auto">
            <span className="text-sm text-[#FF7A00] font-medium">편집</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wordbook" className="text-sm font-medium text-gray-700">
              단어장 선택
            </Label>
            <Select
              value={formData.wordbookId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, wordbookId: value }))}
            >
              <SelectTrigger className="h-12 rounded-xl border-gray-200">
                <SelectValue placeholder="단어를 추가할 단어장을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {wordbooks.map((wordbook) => (
                  <SelectItem key={wordbook.id} value={wordbook.id.toString()}>
                    {wordbook.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="word" className="text-sm font-medium text-gray-700">
              단어
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

          <div className="pt-8">
            <p className="text-sm text-gray-600 mb-4">학습하고 있는 단어가 있나요?</p>
            <Button
              type="submit"
              className="w-full h-12 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-xl font-medium"
            >
              단어 추가
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
