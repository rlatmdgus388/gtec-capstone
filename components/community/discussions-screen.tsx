"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, MessageCircle, Heart, PlusCircle, Eye } from "lucide-react"
import { PostFormScreen } from "./post-form-screen"
import { DiscussionDetailScreen } from "./discussion-detail-screen"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// (목록용) 게시글 타입
interface DiscussionPost {
  id: string
  title: string
  author: { uid: string; name: string }
  replies: number
  likes: number
  views: number
  createdAt: string
  category: string
}

// (수정용) 게시글 타입: PostFormScreen에 전달할 타입 (content 포함)
interface PostToEditData {
  id: string
  title: string
  content: string // content 필드 추가
  category: string
}

// [수정] 카테고리 'value'를 DB에 저장된 한글로 변경
const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "hot", label: "핫 🔥" },
  { value: "학습팁", label: "학습팁" }, // "tip" -> "학습팁"
  { value: "질문", label: "질문" }, // "question" -> "질문"
  { value: "자유", label: "자유" }, // "free" -> "자유"
]

export function DiscussionsScreen({ onBack }: { onBack: () => void }) {
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // [수정] selectedCategory가 이제 "all" 또는 "hot" 또는 "학습팁" 등 한글 value를 사용
  const [selectedCategory, setSelectedCategory] = useState("all")

  const [screen, setScreen] = useState<"list" | "detail" | "create" | "edit">("list")
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const [postToEdit, setPostToEdit] = useState<PostToEditData | null>(null)

  const fetchDiscussions = useCallback(async () => {
    setIsLoading(true)
    try {
      // [수정] selectedCategory가 "hot"이면 sortBy=hot
      const sortBy = selectedCategory === "hot" ? "hot" : "createdAt"

      // [수정] selectedCategory가 "all" 또는 "hot"이면 category=all,
      // 그 외("학습팁", "질문" 등)에는 해당 한글 value가 category 파라미터로 전달됨
      const category = selectedCategory === "all" || selectedCategory === "hot" ? "all" : selectedCategory

      const data = await fetchWithAuth(`/api/community/discussions?sortBy=${sortBy}&category=${category}`)
      setDiscussions(data || [])
    } catch (error) {
      console.error("게시글 목록 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory]) // [수정] 의존성 배열은 selectedCategory로 유지

  useEffect(() => {
    if (screen === "list") {
      fetchDiscussions()
    }
  }, [fetchDiscussions, screen])

  const timeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "년 전"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "달 전"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "일 전"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "시간 전"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "분 전"
    return "방금 전"
  }

  // 7번 요청: 새 글쓰기 스크린 렌더링
  if (screen === "create") {
    return (
      <PostFormScreen
        onBack={() => setScreen("list")}
        onPostCreatedOrUpdated={() => {
          setScreen("list")
          fetchDiscussions()
        }}
      />
    )
  }

  // 2번 요청: 수정 스크린 렌더링
  if (screen === "edit" && postToEdit) {
    return (
      <PostFormScreen
        postToEdit={postToEdit}
        onBack={() => {
          setScreen("detail")
          setPostToEdit(null)
        }}
        onPostCreatedOrUpdated={() => {
          setScreen("detail")
          setPostToEdit(null)
        }}
      />
    )
  }

  // 7번 & 2번 요청: 상세 스크린 렌더링
  if (screen === "detail" && selectedPostId) {
    return (
      <DiscussionDetailScreen
        postId={selectedPostId}
        onBack={() => {
          setScreen("list")
          setSelectedPostId(null)
          fetchDiscussions()
        }}
        onEdit={(post) => {
          setPostToEdit(post)
          setScreen("edit")
        }}
      />
    )
  }

  // 기본 리스트 스크린
  return (
    // ✅ [수정] 1. 'flex-1 overflow-y-auto pb-20' -> 'h-full flex flex-col'
    <div className={cn("h-full flex flex-col bg-background", "page-transition-enter")}>
      {/* ✅ [수정] 2. 고정될 헤더 영역. 'sticky' -> 'shrink-0' */}
      <div className="bg-card shadow-sm border-b border-border shrink-0">
        {/* ▼▼▼ [수정됨] justify-between 추가, 버튼 이동 ▼▼▼ */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-foreground text-lg">토론 게시판</h1>
          </div>
          <Button size="sm" onClick={() => setScreen("create")} className="flex-shrink-0">
            <PlusCircle size={16} className="mr-2" />
            글쓰기
          </Button>
        </div>
        {/* ▲▲▲ [수정됨] justify-between 추가, 버튼 이동 ▲▲▲ */}
      </div>

      {/* ✅ [수정] 3. 스크롤 영역을 새 div로 감싸고 'flex-1 overflow-y-auto pb-20' 적용 */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* ▼▼▼ [수정됨] justify-between 제거, 버튼 삭제 ▼▼▼ */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {/* [수정] CATEGORIES 객체 배열을 순회 (이제 value가 한글) */}
            {CATEGORIES.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "secondary"}
                onClick={() => setSelectedCategory(category.value)} // 클릭 시 '학습팁', '질문' 등 한글 value가 state에 저장됨
                className="cursor-pointer flex-shrink-0"
              >
                {category.label} {/* 사용자에게는 한글 label이 보임 */}
              </Badge>
            ))}
          </div>
          {/* ▲▲▲ [수정됨] justify-between 제거, 버튼 삭제 ▲▲▲ */}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : discussions.length === 0 ? (
            <Card className="text-center py-16 border-dashed border-border">
              <CardContent>
                <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">게시글이 없습니다</h3>
                <p className="text-sm text-muted-foreground">첫 번째 게시글을 작성해보세요.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {discussions.map((discussion) => (
                <Card
                  key={discussion.id}
                  onClick={() => {
                    setSelectedPostId(discussion.id)
                    setScreen("detail")
                  }}
                  className="cursor-pointer bg-card border-border"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {discussion.author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium text-card-foreground">{discussion.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{discussion.author.name}</span>
                          <span>{timeAgo(discussion.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Heart size={12} />
                            {discussion.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {discussion.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            {discussion.replies}
                          </span>
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
    </div>
  )
}