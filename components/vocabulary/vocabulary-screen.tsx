"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Camera, Edit } from "lucide-react"
import { PhotoWordCapture } from "@/components/camera/photo-word-capture"
import { ImageSelectionModal } from "@/components/camera/image-selection-modal"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface Wordbook {
  id: string
  name: string
  wordCount: number
  progress: number
  category: string
  createdAt: string
  lastStudied?: string
  description?: string
}

interface VocabularyScreenProps {
  onWordbookSelect: (wordbook: Wordbook) => void
  onStartCreate: () => void
  refreshKey: number
  onNavigateToStudy?: (wordbookId: string) => void
}

export function VocabularyScreen({
  onWordbookSelect,
  onStartCreate,
  refreshKey,
  onNavigateToStudy,
}: VocabularyScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [wordbooks, setWordbooks] = useState<Wordbook[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [showImageSelection, setShowImageSelection] = useState(false)
  const [selectedImageData, setSelectedImageData] = useState<string | null>(null)

  const fetchWordbooks = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchWithAuth("/api/wordbooks")
      if (data) {
        const sorted = data.sort((a: any, b: any) => {
          const dateA = new Date(a.lastStudied || a.createdAt).getTime()
          const dateB = new Date(b.lastStudied || b.createdAt).getTime()
          return dateB - dateA
        })
        setWordbooks(sorted)
      } else {
        setWordbooks([])
      }
    } catch (error) {
      console.error("단어장 목록을 불러오는데 실패했습니다:", error)
      setWordbooks([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWordbooks()
  }, [fetchWordbooks, refreshKey])

  const filteredWordbooks = wordbooks.filter((wordbook) =>
    wordbook.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handlePhotoCaptureClick = () => {
    setShowImageSelection(true)
  }

  const handleCameraSelect = () => {
    setShowImageSelection(false)
    setSelectedImageData(null)
    setShowPhotoCapture(true)
  }

  const handleGallerySelect = () => {
    setShowImageSelection(false)
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (readerEvent) => {
          const imageData = readerEvent.target?.result as string
          setSelectedImageData(imageData)
          setShowPhotoCapture(true)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleWordsAdded = () => {
    fetchWordbooks()
  }

  if (showPhotoCapture) {
    return (
      <PhotoWordCapture
        imageData={selectedImageData}
        onClose={() => setShowPhotoCapture(false)}
        onWordsAdded={handleWordsAdded}
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <ImageSelectionModal
        open={showImageSelection}
        onClose={() => setShowImageSelection(false)}
        onCameraSelect={handleCameraSelect}
        onGallerySelect={handleGallerySelect}
      />

      <div className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">단어장</h1>
              <p className="text-sm text-muted-foreground">나만의 단어장을 관리하세요</p>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="단어장 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-muted border-0 rounded-full text-base placeholder:text-muted-foreground"
            />
          </div>
          {/* --- [수정됨] --- */}
          {/* grid-cols-2 gap-3를 grid-cols-1로 변경 */}
          <div className="grid grid-cols-1">
            <Button
              onClick={onStartCreate}
              className="h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
            >
              <Edit size={18} />새 단어장
            </Button>
            {/* "사진으로 추가" 버튼 삭제됨 */}
          </div>
          {/* --- [수정 끝] --- */}
        </div>
      </div>

      <div className="px-4 py-6 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : filteredWordbooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-muted mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">단어장이 없습니다</h3>
            <p className="text-sm text-muted-foreground mb-6">첫 번째 단어장을 만들어보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWordbooks.map((wordbook) => (
              <Card
                key={wordbook.id}
                className="bg-card border border-border hover:shadow-md transition-all cursor-pointer rounded-xl"
                onClick={() => onWordbookSelect(wordbook)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-card-foreground text-base">{wordbook.name}</h3>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0 rounded-full">
                          {wordbook.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{wordbook.wordCount}개 단어</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">학습 진도</span>
                        <span className="font-semibold text-primary">{wordbook.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${wordbook.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
