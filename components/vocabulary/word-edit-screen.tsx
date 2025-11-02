"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface WordData {
  word: string;
  meaning: string;
  example?: string;
  pronunciation?: string;
}

interface WordEditScreenProps {
  wordbookName: string
  onBack: () => void
  onSave: (word: WordData) => void
  initialData?: WordData
}

export function WordEditScreen({ wordbookName, onBack, onSave, initialData }: WordEditScreenProps) {
  const [formData, setFormData] = useState({
    word: "",
    meaning: "",
    example: "",
    pronunciation: "",
  })

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        word: initialData.word || "",
        meaning: initialData.meaning || "",
        example: initialData.example || "",
        pronunciation: initialData.pronunciation || "",
      })
    }
  }, [initialData]);


  const canSubmit = formData.word.trim() !== "" && formData.meaning.trim() !== ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canSubmit) {
      onSave(formData)
    }
  }

  return (
    <div className={cn("min-h-screen bg-background", "page-transition-enter")}>
      {/* Header */}
      <div className="px-2 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
              <ArrowLeft size={22} className="text-foreground" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">{isEditMode ? "단어 편집" : "단어 추가"}</h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="text-primary font-bold hover:bg-primary/10 text-base px-4"
          >
            저장
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="word" className="text-sm font-medium text-muted-foreground px-1">
              단어
            </Label>
            <Input
              id="word"
              value={formData.word}
              onChange={(e) => setFormData((prev) => ({ ...prev, word: e.target.value }))}
              className="h-12 text-base rounded-lg border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card shadow-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meaning" className="text-sm font-medium text-muted-foreground px-1">
              뜻
            </Label>
            <Input
              id="meaning"
              value={formData.meaning}
              onChange={(e) => setFormData((prev) => ({ ...prev, meaning: e.target.value }))}
              className="h-12 text-base rounded-lg border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card shadow-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="example" className="text-sm font-medium text-muted-foreground px-1">
              메모 / 설명 (선택)
            </Label>
            <Input
              id="example"
              value={formData.example}
              onChange={(e) => setFormData((prev) => ({ ...prev, example: e.target.value }))}
              className="h-12 text-base rounded-lg border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card shadow-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pronunciation" className="text-sm font-medium text-muted-foreground px-1">
              발음 (선택)
            </Label>
            <Input
              id="pronunciation"
              value={formData.pronunciation}
              onChange={(e) => setFormData((prev) => ({ ...prev, pronunciation: e.target.value }))}
              className="h-12 text-base rounded-lg border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card shadow-none"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
