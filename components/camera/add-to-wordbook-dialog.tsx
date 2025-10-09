"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, ArrowLeft } from "lucide-react"

interface DetectedWord {
  text: string
  confidence: number
  meaning?: string
  selected: boolean
}

interface AddToWordbookDialogProps {
  words: DetectedWord[]
  onAddToWordbook: (wordbookId: number) => void
  onBack: () => void
}

export function AddToWordbookDialog({ words, onAddToWordbook, onBack }: AddToWordbookDialogProps) {
  const [selectedWordbookId, setSelectedWordbookId] = useState<string>("")

  // Mock wordbooks data
  const wordbooks = [
    { id: 1, name: "영어 기초 단어", category: "기초" },
    { id: 2, name: "TOEIC 필수 어휘", category: "시험" },
    { id: 3, name: "일상 회화 표현", category: "회화" },
    { id: 4, name: "비즈니스 영어", category: "비즈니스" },
  ]

  const selectedWords = words.filter((word) => word.selected)

  const handleConfirm = () => {
    if (selectedWordbookId) {
      onAddToWordbook(Number.parseInt(selectedWordbookId))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft size={18} />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">단어장에 추가</h1>
              <p className="text-sm text-muted-foreground">{selectedWords.length}개 단어를 어느 단어장에 추가할까요?</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Selected Words Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus size={20} className="text-primary" />
              추가할 단어 ({selectedWords.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedWords.map((word, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">{word.text}</h3>
                  {word.meaning && <p className="text-sm text-muted-foreground">{word.meaning}</p>}
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(word.confidence * 100)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Wordbook Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              단어장 선택
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedWordbookId} onValueChange={setSelectedWordbookId}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="단어장을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {wordbooks.map((wordbook) => (
                  <SelectItem key={wordbook.id} value={wordbook.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{wordbook.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {wordbook.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">또는</p>
              <Button variant="outline" className="w-full bg-transparent">
                <Plus size={16} className="mr-2" />새 단어장 만들기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-6">
          <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
            이전으로
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedWordbookId}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            단어장에 추가
          </Button>
        </div>
      </div>
    </div>
  )
}
