"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Type, Volume2 } from "lucide-react"

interface AddWordDialogProps {
  onAddWord: (word: { word: string; meaning: string; example?: string; pronunciation?: string }) => void
  trigger?: React.ReactNode
}

export function AddWordDialog({ onAddWord, trigger }: AddWordDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    word: "",
    meaning: "",
    example: "",
    pronunciation: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.word && formData.meaning) {
      onAddWord(formData)
      setFormData({ word: "", meaning: "", example: "", pronunciation: "" })
      setOpen(false)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="bg-transparent">
      <Plus size={16} className="mr-2" />
      단어 추가
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type size={20} className="text-primary" />
            단어 추가하기
          </DialogTitle>
          <DialogDescription>새로운 단어를 직접 입력하여 추가하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">단어 *</Label>
            <Input
              id="word"
              placeholder="예: apple"
              value={formData.word}
              onChange={(e) => setFormData((prev) => ({ ...prev, word: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meaning">뜻 *</Label>
            <Input
              id="meaning"
              placeholder="예: 사과"
              value={formData.meaning}
              onChange={(e) => setFormData((prev) => ({ ...prev, meaning: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pronunciation">발음 (선택사항)</Label>
            <div className="relative">
              <Input
                id="pronunciation"
                placeholder="예: /ˈæpəl/"
                value={formData.pronunciation}
                onChange={(e) => setFormData((prev) => ({ ...prev, pronunciation: e.target.value }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <Volume2 size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="example">예문 (선택사항)</Label>
            <Textarea
              id="example"
              placeholder="예: I eat an apple every day."
              value={formData.example}
              onChange={(e) => setFormData((prev) => ({ ...prev, example: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              추가하기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
