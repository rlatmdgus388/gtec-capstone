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
  id: string;
  title: string;
  content: string; // content 필드 추가
  category: string;
}

// 6번 요청: '핫 🔥' 카테고리 추가
const CATEGORIES = ["전체", "핫 🔥", "학습팁", "질문", "자유"]

export function DiscussionsScreen({ onBack }: { onBack: () => void }) {
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("전체")

  const [screen, setScreen] = useState<"list" | "detail" | "create" | "edit">("list")
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const [postToEdit, setPostToEdit] = useState<PostToEditData | null>(null)

  const fetchDiscussions = useCallback(async () => {
    setIsLoading(true)
    try {
      // [수정]
      // '핫' 카테고리가 아닐 경우, 기본 정렬을 'likes'(좋아요순)에서 'createdAt'(최신순)으로 변경합니다.
      const sortBy = selectedCategory === "핫 🔥" ? "hot" : "createdAt"
      const category = (selectedCategory === "전체" || selectedCategory === "핫 🔥") ? "all" : selectedCategory

      const data = await fetchWithAuth(`/api/community/discussions?sortBy=${sortBy}&category=${category}`)
      setDiscussions(data || [])
    } catch (error) {
      console.error("게시글 목록 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory])

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
    <div className="flex-1 overflow-y-auto pb-20 bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground text-lg">토론 게시판</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                onClick={() => setSelectedCategory(category)}
                className="cursor-pointer flex-shrink-0"
              >
                {category}
              </Badge>
            ))}
          </div>
          <Button size="sm" onClick={() => setScreen("create")} className="flex-shrink-0">
            <PlusCircle size={16} className="mr-2" />
            글쓰기
          </Button>
        </div>

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
  )
}