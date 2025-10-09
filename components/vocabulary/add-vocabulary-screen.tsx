"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

interface AddVocabularyScreenProps {
  onBack: () => void
  onCreateWordbook: (wordbook: { name: string; description: string; category: string }) => void
}

export function AddVocabularyScreen({ onBack, onCreateWordbook }: AddVocabularyScreenProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "기초",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name) {
      onCreateWordbook(formData)
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
          <h1 className="text-xl font-bold text-gray-900">새로운 단어장</h1>
          <div className="ml-auto">
            <span className="text-sm text-[#FF7A00] font-medium">편집</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              단어장 이름
            </Label>
            <Input
              id="name"
              placeholder="새로 추가할 단어장 이름을 입력하세요"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="h-12 rounded-xl border-gray-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              설명 (선택사항)
            </Label>
            <Input
              id="description"
              placeholder="단어장에 대한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="h-12 rounded-xl border-gray-200"
            />
          </div>

          <div className="pt-8">
            <p className="text-sm text-gray-600 mb-4">학습하고 있는 단어장이 있나요?</p>
            <Button
              type="submit"
              className="w-full h-12 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-xl font-medium"
            >
              단어장 생성
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
