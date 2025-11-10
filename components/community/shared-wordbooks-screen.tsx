"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, BookOpen, Download, Heart, Share2, Search, Trash2, Eye, MoreVertical } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { ShareWordbookDialog } from "./share-wordbook-dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

// --- 인터페이스 정의 ---
interface SharedWordbook {
  id: string
  name: string
  author: { uid: string; name: string }
  wordCount: number
  likes: number
  downloads: number
  views: number
  category: string // e.g., '시험', '일상' (한글)
}

// [수정] CATEGORY_MAP과 getCategoryLabel 삭제

// [수정] 필터 카테고리를 DB에 저장된 한글 값으로 변경 (요청하신 목록)
const FILTER_CATEGORIES = [
  { label: "전체", value: "all" },
  { label: "시험", value: "시험" }, // "exam" -> "시험"
  { label: "일상", value: "일상" }, // "daily" -> "일상"
  { label: "여행", value: "여행" }, // "travel" -> "여행"
  { label: "비즈니스", value: "비즈니스" }, // "business" -> "비즈니스"
  { label: "자유", value: "자유" }, // "free" -> "자유"
  { label: "기타", value: "기타" }, // "etc" -> "기타"
]

export function SharedWordbooksScreen({
  onBack,
  onSelectWordbook,
}: {
  onBack: () => void
  onSelectWordbook: (wordbookId: string) => void
}) {
  const [wordbooks, setWordbooks] = useState<SharedWordbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  // [수정] selectedCategory는 이제 'all', '시험', '일상' 등의 한글 값을 저장합니다.
  const [selectedCategory, setSelectedCategory] = useState("all")

  const currentUserId = auth.currentUser?.uid

  const fetchWordbooks = useCallback(async () => {
    setIsLoading(true)
    try {
      // [수정] API 호출 시 category 파라미터를 추가 (서버 사이드 필터링)
      const categoryParam = selectedCategory === "all" ? "all" : selectedCategory
      // 원본 파일(before)에서 sortBy=downloads로 고정되어 있었으므로 유지
      const data = await fetchWithAuth(`/api/community/wordbooks?sortBy=downloads&category=${categoryParam}`)
      setWordbooks(data || [])
    } catch (error) {
      console.error("공유 단어장 목록 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory]) // [수정] selectedCategory가 바뀔 때마다 fetchWordbooks가 다시 실행되도록 의존성 추가

  useEffect(() => {
    fetchWordbooks()
  }, [fetchWordbooks])

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

  // [수정] 클라이언트 측 카테고리 필터링 제거 (서버가 하므로)
  const filteredWordbooks = wordbooks.filter((wb) => {
    const matchesSearch =
      wb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wb.author.name.toLowerCase().includes(searchQuery.toLowerCase())

    // const matchesCategory = ... (제거)

    return matchesSearch
  })

  return (
    <>
      <ShareWordbookDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} onShared={fetchWordbooks} />

      {/* ✅ [수정] 1. 'flex-1 overflow-y-auto pb-20' -> 'h-full flex flex-col' */}
      <div className={cn("h-full flex flex-col bg-background", "page-transition-enter")}>

        {/* ✅ [수정] 2. 고정될 헤더 영역. 'sticky top-0 z-10' -> 'shrink-0' */}
        <div className="bg-card shadow-sm border-b border-border shrink-0 p-4">
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

          {/* ✨ 카테고리 필터 렌더링 수정 */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2">
              {FILTER_CATEGORIES.map((cat) => (
                <Badge
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "secondary"}
                  onClick={() => setSelectedCategory(cat.value)} // 클릭 시 한글 value("시험", "일상" 등)가 state에 저장됨
                  className="cursor-pointer"
                >
                  {cat.label} {/* 사용자에게는 한글 label이 보임 */}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* ✅ [수정] 3. 스크롤될 콘텐츠 영역. 'flex-1 overflow-y-auto' + 'pb-20' 적용 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
          {isLoading ? (
            <div className="space-y-2">
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
              <Drawer key={wordbook.id}>
                <Card
                  onClick={() => onSelectWordbook(wordbook.id)}
                  className="cursor-pointer transition-all hover:shadow-md bg-card border-border"
                >
                  {/* ▼▼▼ [수정됨] CardContent 패딩을 px-4 py-3으로, 내부 레이아웃을 홈화면과 동일하게 변경 ▼▼▼ */}
                  <CardContent className="px-4 py-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-card-foreground">{wordbook.name}</h3>
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                            {wordbook.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          by {wordbook.author.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{wordbook.wordCount} words</p>
                      </div>
                      {/* ▲▲▲ [수정됨] 레이아웃 변경 완료 ▲▲▲ */}
                      <div className="flex items-center">
                        {currentUserId === wordbook.author.uid && (
                          <DrawerTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()} // Prevent card click
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DrawerTrigger>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
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
                      <Button
                        size="sm"
                        onClick={(e) => handleDownload(e, wordbook)}
                        className="h-8"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        다운로드
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Drawer (삭제 확인) 부분은 원본과 동일 */}
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="text-left">
                      <DrawerTitle>정말 삭제하시겠습니까?</DrawerTitle>
                      <DrawerDescription>
                        이 작업은 되돌릴 수 없습니다. 단어장이 커뮤니티에서 영구적으로 삭제됩니다.
                      </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(wordbook.id)
                        }}
                      >
                        삭제
                      </Button>
                      <DrawerClose asChild>
                        <Button variant="outline" onClick={(e) => e.stopPropagation()}>
                          취소
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            ))
          )}
        </div>
      </div>
    </>
  )
}