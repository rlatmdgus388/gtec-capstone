"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, MessageCircle, Heart, PlusCircle, Eye } from "lucide-react"
import { PostFormScreen } from "./post-form-screen"
// [!!! 1. 여기가 수정되었습니다 !!!] DiscussionDetailScreen import 제거
// import { DiscussionDetailScreen } from "./discussion-detail-screen"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// [!!! 2. 여기가 수정되었습니다 !!!]
// (목록용) 게시글 타입
interface DiscussionPost {
  id: string
  title: string
  author: { uid: string; name: string }
  commentCount: number // 'replies' -> 'commentCount'
  likes: number
  views: number
  createdAt: any // [수정] string -> any
  category: string
}
// [!!! 2. 수정 완료 !!!]


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

// Prop 인터페이스 정의
interface DiscussionsScreenProps {
  onBack: () => void;
  onViewDiscussion: (postId: string) => void; // 부모가 상세보기를 처리할 함수
}

// Firestore timestamp (객체 또는 문자열)를 밀리초(ms)로 변환하는 헬퍼 함수
const getTimestampInMillis = (timestamp: any): number => {
  if (!timestamp) {
    return 0;
  }
  if (timestamp._seconds !== undefined && timestamp._nanoseconds !== undefined) {
    return timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000;
  }
  const date = new Date(timestamp);
  if (!isNaN(date.getTime())) {
    return date.getTime();
  }
  return 0;
};

// props로 onViewDiscussion을 받음
export function DiscussionsScreen({ onBack, onViewDiscussion }: DiscussionsScreenProps) {
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  // 'list' | 'create'만 관리 (detail, edit은 부모가 처리)
  const [screen, setScreen] = useState<"list" | "create">("list")
  // selectedPostId 상태 제거
  // postToEdit 상태 제거

  const fetchDiscussions = useCallback(async () => {
    setIsLoading(true)
    try {
      const sortBy = selectedCategory === "hot" ? "hot" : "createdAt"
      const category = selectedCategory === "all" || selectedCategory === "hot" ? "all" : selectedCategory

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

  // timeAgo 함수가 getTimestampInMillis 헬퍼 함수를 사용하도록 수정
  const timeAgo = (dateString: any) => { // any 타입으로 받음
    const now = new Date()
    const past = new Date(getTimestampInMillis(dateString)) // 헬퍼 함수 사용
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "년 전";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "달 전";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "일 전";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "시간 전";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "분 전";
    return "방금 전";
  }

  // 7번 요청: 새 글쓰기 스크린 렌더링
  if (screen === "create") {
    return (
      <PostFormScreen
        onBack={() => setScreen("list")}
        onPostCreatedOrUpdated={() => {
          setScreen("list")
          // fetchDiscussions() // 어차피 useEffect[screen]이 호출해줌
        }}
      />
    )
  }

  // 'edit' (수정) 스크린 렌더링 로직 제거
  // 'detail' (상세) 스크린 렌더링 로직 제거


  // 기본 리스트 스크린
  return (
    <div className={cn("h-full flex flex-col bg-background", "page-transition-enter")}>
      <div className="bg-background shrink-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-foreground text-lg">토론 게시판</h1>
          </div>
          <Button size="sm" onClick={() => setScreen("create")} className="flex-shrink-0">
            <PlusCircle size={16} className="mr-2" />
            글쓰기
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "secondary"}
                onClick={() => setSelectedCategory(category.value)}
                className="cursor-pointer flex-shrink-0"
              >
                {category.label}
              </Badge>
            ))}
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
                  // onClick을 `onViewDiscussion` prop 호출로 변경
                  onClick={() => onViewDiscussion(discussion.id)}
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

                        {/* [!!! 3. 여기가 수정되었습니다 !!!] (아이콘 순서 및 댓글 수 수정) */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{discussion.author.name}</span>
                          <span>{timeAgo(discussion.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {discussion.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart size={12} />
                            {discussion.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            {discussion.commentCount || 0} {/* replies -> commentCount */}
                          </span>
                        </div>
                        {/* [!!! 3. 수정 완료 !!!] */}

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