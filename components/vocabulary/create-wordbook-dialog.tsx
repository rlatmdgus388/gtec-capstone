"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, BookOpen } from "lucide-react"

interface CreateWordbookDialogProps {
  onCreateWordbook: (wordbook: { name: string; description: string; category: string }) => void
}

export function CreateWordbookDialog({ onCreateWordbook }: CreateWordbookDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  })

  const categories = [
    { value: "basic", label: "기초" },
    { value: "exam", label: "시험" },
    { value: "conversation", label: "회화" },
    { value: "business", label: "비즈니스" },
    { value: "travel", label: "여행" },
    { value: "academic", label: "학술" },
    { value: "technical", label: "전문" },
    { value: "other", label: "기타" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.category) {
      onCreateWordbook(formData)
      setFormData({ name: "", description: "", category: "" })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 flex items-center gap-2 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white">
          <Plus size={18} />새 단어장 만들기
        </Button>

      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />새 단어장 만들기
          </DialogTitle>
          <DialogDescription>새로운 단어장을 만들어 단어 학습을 시작하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">단어장 이름 *</Label>
            <Input
              id="name"
              placeholder="예: 영어 기초 단어"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">카테고리 *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택사항)</Label>
            <Textarea
              id="description"
              placeholder="단어장에 대한 간단한 설명을 입력하세요"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              만들기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
