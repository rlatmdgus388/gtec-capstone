"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Heart, Eye } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils" // 1번: cn 유틸리티 추가

interface Word {
  id: string
  word: string
  meaning: string
}

interface SharedWordbook {
  id: string
  name: string
  description: string
  author: {
    uid: string
    name: string
  }
  wordCount: number
  likes: number
  likedBy: string[]
  downloads: number
  views: number
  category: string
  words: Word[]
}

export function SharedWordbookDetail({ wordbookId, onBack }: { wordbookId: string; onBack: () => void }) {
  const [wordbook, setWordbook] = useState<SharedWordbook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const currentUser = auth.currentUser
  const fetchInitiated = useRef(false)

  const fetchWordbook = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchWithAuth(`/api/community/wordbooks/${wordbookId}`)
      setWordbook(data)
      if (currentUser && data.likedBy?.includes(currentUser.uid)) {
        setIsLiked(true)
      }
    } catch (error) {
      console.error("공유 단어장 상세 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [wordbookId, currentUser])

  useEffect(() => {
    if (wordbookId && !fetchInitiated.current) {
      fetchInitiated.current = true
      fetchWordbook()
    }
  }, [wordbookId, fetchWordbook])

  const handleLike = async () => {
    if (!currentUser || !wordbook) {
      alert("로그인이 필요합니다.")
      return
    }

    try {
      await fetchWithAuth(`/api/community/wordbooks/${wordbook.id}/like`, { method: "POST" })
      setIsLiked(!isLiked)
      setWordbook((prev) => (prev ? { ...prev, likes: isLiked ? prev.likes - 1 : prev.likes + 1 } : null))
    } catch (error) {
      console.error("좋아요 처리 실패:", error)
      alert("요청 처리에 실패했습니다.")
    }
  }

  const handleDownload = async () => {
    if (!currentUser || !wordbook) {
      alert("로그인이 필요합니다.")
      return
    }
    try {
      await fetchWithAuth(`/api/community/wordbooks/${wordbook.id}/download`, { method: "POST" })
      alert(`'${wordbook.name}' 단어장을 다운로드했습니다!`)
      setWordbook((prev) => (prev ? { ...prev, downloads: prev.downloads + 1 } : null))
    } catch (error) {
      console.error("다운로드 실패:", error)
      alert("단어장 다운로드에 실패했습니다.")
    }
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border sticky top-0 z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-foreground text-lg truncate">{wordbook?.name || "단어장 정보"}</h1>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : wordbook ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <Badge variant="outline" className="mb-2 w-fit">
                  {wordbook.category}
                </Badge>
                <h2 className="text-2xl font-bold">{wordbook.name}</h2>
                {/* 4번 요청: p 태그는 원래 클릭 불가능 */}
                <p className="text-sm text-muted-foreground">by {wordbook.author.name}</p>
                <p className="text-sm text-foreground mt-2">{wordbook.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Heart size={14} /> 좋아요 {wordbook.likes}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Download size={14} /> 다운로드 {wordbook.downloads}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} /> 조회수 {wordbook.views}
                  </span>
                </div>
              </CardContent>
              <CardContent>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> 내 단어장에 추가
                  </Button>
                  {/* 1번 요청: 좋아요 버튼 스타일 수정 */}
                  <Button
                    variant="outline"
                    onClick={handleLike}
                    className={cn(
                      "transition-colors",
                      isLiked
                        ? "text-red-500 border-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600"
                        : "text-muted-foreground"
                    )}
                  >
                    <Heart
                      className={cn(
                        "mr-2 h-4 w-4 transition-all",
                        isLiked && "fill-current" // text-red-500가 적용됨
                      )}
                    />
                    {isLiked ? "좋아요" : "좋아요"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">단어 목록 ({wordbook.wordCount}개)</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {wordbook.words.map((word) => (
                    <div key={word.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium text-sm">{word.word}</span>
                      <span className="text-sm text-muted-foreground">{word.meaning}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p>단어장 정보를 불러올 수 없습니다.</p>
        )}
      </div>
    </div>
  )
}