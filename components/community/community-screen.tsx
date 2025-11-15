"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MessageCircle, Heart, BookOpen, Download, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { UserProfile } from "./user-profile"
import { SharedWordbookDetail } from "./shared-wordbook-detail"
import { DiscussionDetailScreen } from "./discussion-detail-screen"
import { Skeleton } from "@/components/ui/skeleton"
import { PostFormScreen } from "./post-form-screen"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase"
import { DiscussionsScreen } from "./discussions-screen"
import { SharedWordbooksScreen } from "./shared-wordbooks-screen"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer"

// --- 인터페이스 정의 ---
interface SharedWordbook {
  id: string
  name: string
  author: { uid: string; name: string }
  wordCount: number
  likes: number
  downloads: number
  views: number // 조회수
  category: string
}

interface DiscussionPost {
  id: string
  title: string
  content: string
  author: { uid: string; name: string }
  replies: number
  likes: number
  views: number // 조회수
  createdAt: string
  category: string
}

// ✅ [추가] props 인터페이스 정의
interface CommunityScreenProps {
  refreshKey: number;
}

export function CommunityScreen({ refreshKey }: CommunityScreenProps) { // ✅ [수정] props 받기
  const [currentView, setCurrentView] = useState<
    "main" | "profile" | "wordbook" | "discussion" | "allDiscussions" | "allWordbooks" | "editPost"
  >("main")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedWordbookId, setSelectedWordbookId] = useState<string>("")
  const [selectedPostId, setSelectedPostId] = useState<string>("")
  const [sharedWordbooks, setSharedWordbooks] = useState<SharedWordbook[]>([])
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([])
  const [isLoading, setIsLoading] = useState({ wordbooks: true, discussions: true })
  const [postToEdit, setPostToEdit] = useState<DiscussionPost | null>(null)
  const currentUserId = auth.currentUser?.uid

  const fetchCommunityData = useCallback(async () => {
    setIsLoading({ wordbooks: true, discussions: true })
    try {
      const [wordbooksData, discussionsData] = await Promise.all([
        fetchWithAuth("/api/community/wordbooks?sortBy=downloads"),
        fetchWithAuth("/api/community/discussions?sortBy=likes"),
      ])
      setSharedWordbooks(wordbooksData || [])
      setDiscussions(discussionsData || [])
    } catch (error) {
      console.error("커뮤니티 데이터 조회 실패:", error)
    } finally {
      setIsLoading({ wordbooks: false, discussions: false })
    }
  }, [])

  useEffect(() => {
    if (currentView === "main") {
      fetchCommunityData()
    }
  }, [currentView, fetchCommunityData])

  // ✅ [추가] refreshKey가 변경되면 화면을 메인으로 리셋하는 useEffect
  useEffect(() => {
    if (refreshKey > 0) { // 초기 렌더링(0)시에는 실행 안 함
      handleBackToMain();
    }
  }, [refreshKey]); // refreshKey에 의존

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

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId)
    setCurrentView("profile")
  }
  const handleViewWordbook = (wordbookId: string) => {
    setSelectedWordbookId(wordbookId)
    setCurrentView("wordbook")
  }
  const handleViewDiscussion = (postId: string) => {
    setSelectedPostId(postId)
    setCurrentView("discussion")
  }
  const handleBackToMain = () => {
    setCurrentView("main")
    setSelectedPostId("")
    setSelectedUserId("")
    setSelectedWordbookId("")
    setPostToEdit(null)
  }

  const handleEditClick = (post: DiscussionPost) => {
    setPostToEdit(post)
    setCurrentView("editPost")
  }

  const handleDeleteClick = async (postId: string) => {
    if (!confirm("게시글을 정말 삭제하시겠습니까?")) return
    try {
      await fetchWithAuth(`/api/community/discussions/${postId}`, { method: "DELETE" })
      alert("게시글이 삭제되었습니다.")
      fetchCommunityData()
    } catch (error) {
      console.error("게시글 삭제 실패:", error)
      alert("게시글 삭제에 실패했습니다.")
    }
  }

  if (currentView === "profile") return <UserProfile userId={selectedUserId} onBack={handleBackToMain} />
  if (currentView === "wordbook")
    return <SharedWordbookDetail wordbookId={selectedWordbookId} onBack={() => setCurrentView("allWordbooks")} />

  if (currentView === "discussion")
    return (
      <DiscussionDetailScreen
        postId={selectedPostId}
        onBack={handleBackToMain}
        onEdit={handleEditClick}
      />
    )

  if (currentView === "allDiscussions") return <DiscussionsScreen onBack={handleBackToMain} />
  if (currentView === "allWordbooks")
    return <SharedWordbooksScreen onBack={handleBackToMain} onSelectWordbook={handleViewWordbook} />

  if (currentView === "editPost" && postToEdit) {
    return (
      <PostFormScreen
        postToEdit={postToEdit}
        onBack={handleBackToMain}
        onPostCreatedOrUpdated={() => {
          setPostToEdit(null)
          handleBackToMain()
        }}
      />
    )
  }

  return (
    // 레이아웃: h-full flex flex-col 적용
    <div className="h-full flex flex-col bg-background">

      {/* 헤더: shrink-0 적용 */}
      <div className="bg-card shrink-0">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            {/* 아이콘 박스: h-7 -> h-10 수정 */}
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">커뮤니티</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 컨텐츠 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* 내부 패딩: py-4 -> py-6, space-y-4 -> space-y-6 수정 */}
        <div className="px-4 py-6 space-y-6">
          {/* Shared Wordbooks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen size={20} className="text-primary" /> 인기 공유 단어장
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
                onClick={() => setCurrentView("allWordbooks")}
              >
                더보기
              </Button>
            </div>
            {isLoading.wordbooks ? (
              <div className="space-y-2">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : sharedWordbooks.length === 0 ? (
              <Card className="text-center py-12 border border-border rounded-xl">
                <CardContent>
                  <BookOpen size={48} className="mx-auto text-muted mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">공유된 단어장이 없습니다</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {sharedWordbooks.slice(0, 3).map((wordbook) => (
                  <Card
                    key={wordbook.id}
                    className="hover:shadow-md transition-shadow cursor-pointer bg-card border border-border rounded-xl"
                    onClick={() => handleViewWordbook(wordbook.id)}
                  >
                    <CardContent className="px-4 py-2">
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
                ))}
              </div>
            )}
          </div>

          {/* Discussion Board */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle size={20} className="text-primary" /> 인기 토론글
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
                onClick={() => setCurrentView("allDiscussions")}
              >
                더보기
              </Button>
            </div>
            {isLoading.discussions ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : discussions.length === 0 ? (
              <Card className="text-center py-12 border border-border rounded-xl">
                <CardContent>
                  <MessageCircle size={48} className="mx-auto text-muted mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">게시글이 없습니다</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {discussions.slice(0, 3).map((discussion) => (
                  <Card key={discussion.id} className="bg-card border border-border rounded-xl">
                    <div className="flex items-start gap-3 p-4">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {discussion.author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 cursor-pointer" onClick={() => handleViewDiscussion(discussion.id)}>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-card-foreground text-sm">{discussion.title}</h3>
                          <Badge variant="outline" className="text-xs border-border">
                            {discussion.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                        </div>
                      </div>
                      {currentUserId === discussion.author.uid && (
                        <Drawer>
                          <DrawerTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <div className="mx-auto w-full max-w-sm">
                              <div className="p-2">
                                <DrawerClose asChild>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start p-2 h-12 text-sm"
                                    onClick={() => handleEditClick(discussion)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    수정
                                  </Button>
                                </DrawerClose>
                                <DrawerClose asChild>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start p-2 h-12 text-sm text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteClick(discussion.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    삭제
                                  </Button>
                                </DrawerClose>
                              </div>
                              <DrawerFooter className="pt-2">
                                <DrawerClose asChild>
                                  <Button variant="outline">취소</Button>
                                </DrawerClose>
                              </DrawerFooter>
                            </div>
                          </DrawerContent>
                        </Drawer>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}