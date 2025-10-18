"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, BookOpen, Download, Heart, Share2, Search, Trash2, Eye } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { ShareWordbookDialog } from "./share-wordbook-dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// --- 인터페이스 정의 ---
interface SharedWordbook {
  id: string
  name: string
  author: { uid: string; name: string }
  wordCount: number
  likes: number
  downloads: number
  views: number
  category: string
}

const ALL_CATEGORIES = ["기초", "시험", "회화", "비즈니스", "여행", "전문", "기타"]
const FILTER_CATEGORIES = [{ label: "전체", value: "all" }, ...ALL_CATEGORIES.map((c) => ({ label: c, value: c }))]

// ✨ 아래 줄이 수정되었습니다. onSelectWordbook prop을 추가합니다.
export function SharedWordbooksScreen({
  onBack,
  onSelectWordbook,
}: { onBack: () => void; onSelectWordbook: (wordbookId: string) => void }) {
  const [wordbooks, setWordbooks] = useState<SharedWordbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // ✨ 아래 줄이 삭제되었습니다. 펼치기 상태는 더 이상 필요 없습니다.
  // const [expandedWordbookId, setExpandedWordbookId] = useState<string | null>(null);

  const currentUserId = auth.currentUser?.uid

  const fetchWordbooks = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchWithAuth("/api/community/wordbooks?sortBy=downloads")
      setWordbooks(data || [])
    } catch (error) {
      console.error("공유 단어장 목록 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWordbooks()
  }, [fetchWordbooks])

  // ✨ 아래 함수가 삭제되었습니다. 펼치기 기능이 없어졌기 때문입니다.
  // const handleToggleDetail = async (wordbookId: string) => { ... };

  const handleDelete = async (wordbookId: string) => {
    try {
      await fetchWithAuth(`/api/community/wordbooks/${wordbookId}`, { method: "DELETE" })
      alert("단어장이 삭제되었습니다.")
      fetchWordbooks() // 목록 새로고침
    } catch (error) {
      console.error("단어장 삭제 실패:", error)
      alert("단어장 삭제에 실패했습니다.")
    }
  }

  const handleDownload = async (e: React.MouseEvent, wordbook: SharedWordbook) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    try {
      await fetchWithAuth(`/api/community/wordbooks/${wordbook.id}/download`, { method: "POST" })
      alert(`'${wordbook.name}' 단어장을 다운로드했습니다!`)
      setWordbooks((prev) => prev.map((wb) => (wb.id === wordbook.id ? { ...wb, downloads: wb.downloads + 1 } : wb)))
    } catch (error) {
      console.error("다운로드 실패:", error)
      alert("단어장 다운로드에 실패했습니다.")
    }
  }

  const filteredWordbooks = wordbooks.filter((wb) => {
    const matchesSearch =
      wb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wb.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || wb.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <ShareWordbookDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} onShared={fetchWordbooks} />
      <div className="flex-1 overflow-y-auto pb-20 bg-background">
        {/* Header */}
        <div className="bg-card shadow-sm border-b border-border sticky top-0 z-10 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold text-foreground text-lg">공유 단어장</h1>
            </div>
            <Button size="sm" onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" /> 공유하기
            </Button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="단어장 이름 또는 작성자로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/50 border-border rounded-md"
            />
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2">
              {FILTER_CATEGORIES.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "secondary"}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="cursor-pointer"
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredWordbooks.length === 0 ? (
            <Card className="text-center py-16 border-dashed border-border">
              <CardContent>
                <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">결과 없음</h3>
                <p className="text-sm text-muted-foreground">검색 조건을 변경해보세요.</p>
              </CardContent>
            </Card>
          ) : (
            filteredWordbooks.map((wordbook) => (
              <Card
                key={wordbook.id}
                onClick={() => onSelectWordbook(wordbook.id)}
                className="cursor-pointer transition-all hover:shadow-md bg-card border-border"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground">{wordbook.name}</h3>
                      <p className="text-sm text-muted-foreground">by {wordbook.author.name}</p>
                      <p className="text-sm text-muted-foreground">{wordbook.wordCount} words</p>
                      <Badge variant="secondary" className="mt-2">
                        {wordbook.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentUserId === wordbook.author.uid && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                              <AlertDialogDescription>
                                이 작업은 되돌릴 수 없습니다. 단어장이 커뮤니티에서 영구적으로 삭제됩니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(wordbook.id)
                                }}
                              >
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <Button size="sm" onClick={(e) => handleDownload(e, wordbook)}>
                        <Download className="h-4 w-4 mr-2" />
                        다운로드
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      {wordbook.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download size={14} />
                      {wordbook.downloads}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {wordbook.views}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  )
}
