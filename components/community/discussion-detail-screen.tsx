"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Heart, MessageCircle, Send, Eye, MoreVertical, Edit, Trash2 } from "lucide-react" // 2번: 아이콘 추가
import { Textarea } from "@/components/ui/textarea"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils" // 1번: cn 유틸리티 추가
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // 2번: 드롭다운 메뉴 추가
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog" // 2번: 삭제 확인 다이얼로그 추가

interface Comment {
  id: string
  content: string
  author: {
    uid: string
    name: string
  }
  createdAt: string
}

interface DiscussionPost {
  id: string
  title: string
  content: string
  author: {
    uid: string
    name: string
  }
  replies: number
  likes: number
  views: number
  likedBy: string[]
  createdAt: string
  category: string
  comments: Comment[]
}

// 2번 요청: onEdit prop 추가
export function DiscussionDetailScreen({
  postId,
  onBack,
  onEdit,
}: {
  postId: string
  onBack: () => void
  onEdit: (post: DiscussionPost) => void
}) {
  const [post, setPost] = useState<DiscussionPost | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const currentUser = auth.currentUser
  const fetchInitiated = useRef(false)

  // 2번 요청: 수정/삭제 관련 상태
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleteCommentDialogOpen, setIsDeleteCommentDialogOpen] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState("")

  const fetchPost = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchWithAuth(`/api/community/discussions/${postId}`)
      setPost(data)
      if (currentUser && data.likedBy?.includes(currentUser.uid)) {
        setIsLiked(true)
      }
    } catch (error) {
      console.error("게시글 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [postId, currentUser])

  useEffect(() => {
    if (postId && !fetchInitiated.current) {
      fetchInitiated.current = true
      fetchPost()
    }
  }, [postId, fetchPost])

  const handleLike = async () => {
    if (!currentUser || !post) {
      alert("로그인이 필요합니다.")
      return
    }

    try {
      await fetchWithAuth(`/api/community/discussions/${post.id}/like`, {
        method: "POST",
      })
      setIsLiked(!isLiked)
      setPost((prevPost) => {
        if (!prevPost) return null
        return {
          ...prevPost,
          likes: isLiked ? prevPost.likes - 1 : prevPost.likes + 1,
        }
      })
    } catch (error) {
      console.error("좋아요 처리 실패:", error)
      alert("요청 처리에 실패했습니다.")
    }
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요.")
      return
    }
    if (!currentUser || !post) return

    try {
      const addedComment = await fetchWithAuth(`/api/community/discussions/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment }),
      })
      setPost((prevPost) => {
        if (!prevPost) return null
        return {
          ...prevPost,
          // 5번 요청: 새 댓글을 맨 앞에 추가 (최신순)
          comments: [addedComment, ...prevPost.comments],
          replies: prevPost.replies + 1,
        }
      })
      setNewComment("")
    } catch (error) {
      console.error("댓글 작성 실패:", error)
      alert("댓글 작성에 실패했습니다.")
    }
  }

  // 2번 요청: 게시글 삭제 핸들러
  const handleDeletePost = async () => {
    if (!post) return
    try {
      await fetchWithAuth(`/api/community/discussions/${post.id}`, { method: "DELETE" })
      alert("게시글이 삭제되었습니다.")
      onBack() // 목록으로 돌아가기
    } catch (error) {
      console.error("게시글 삭제 실패:", error)
      alert("게시글 삭제에 실패했습니다.")
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  // 2번 요청: 댓글 수정 시작
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditingCommentContent(comment.content)
  }

  // 2번 요청: 댓글 수정 취소
  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentContent("")
  }

  // 2번 요청: 댓글 수정 제출
  const handleUpdateComment = async () => {
    if (!editingCommentId || !post) return
    try {
      const updatedComment = await fetchWithAuth(`/api/community/discussions/${post.id}/comments/${editingCommentId}`, {
        method: "PUT",
        body: JSON.stringify({ content: editingCommentContent }),
      })
      setPost(prevPost => prevPost ? ({
        ...prevPost,
        comments: prevPost.comments.map(c => c.id === editingCommentId ? updatedComment : c)
      }) : null)
      handleCancelEditComment() // 수정 상태 리셋
    } catch (error) {
      console.error("댓글 수정 실패:", error)
      alert("댓글 수정에 실패했습니다.")
    }
  }

  // 2번 요청: 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId: string) => {
    if (!post) return
    try {
      await fetchWithAuth(`/api/community/discussions/${post.id}/comments/${commentId}`, { method: "DELETE" })
      alert("댓글이 삭제되었습니다.")
      setPost(prevPost => prevPost ? ({
        ...prevPost,
        comments: prevPost.comments.filter(c => c.id !== commentId),
        replies: prevPost.replies - 1
      }) : null)
    } catch (error) {
      console.error("댓글 삭제 실패:", error)
      alert("댓글 삭제에 실패했습니다.")
    } finally {
      setIsDeleteCommentDialogOpen(null)
    }
  }

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

  return (
    <>
      <div className={cn("flex-1 overflow-y-auto pb-20 bg-background", "page-transition-enter-from-left")}>
        {/* Header */}
        <div className="bg-card shadow-sm border-b border-border sticky top-0 z-10 p-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground text-lg truncate flex-1">{post?.title || "게시글 상세"}</h1>

          {/* 2번 요청: 게시글 수정/삭제 드롭다운 */}
          {post && currentUser && post.author.uid === currentUser.uid && (
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEdit(post)}>
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : post ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {post.category}
                      </Badge>
                      <h2 className="text-2xl font-bold">{post.title}</h2>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    {/* 4번 요청: span 태그는 원래 클릭 불가능 */}
                    <span>{post.author.name}</span>
                    <span className="mx-2">·</span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-muted-foreground">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Eye size={14} /> {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} /> {post.replies}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={14} /> {post.likes}
                    </span>
                  </div>
                  {/* 1번 요청: 좋아요 버튼 스타일 수정 */}
                  <Button
                    variant="outline"
                    size="sm"
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
                </CardFooter>
              </Card>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">댓글 ({post.comments.length})</h3>
                <div className="space-y-4 mb-6">
                  {post.comments.map((comment) => (
                    <Card key={comment.id} className="bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              {/* 4번 요청: span 태그는 원래 클릭 불가능 */}
                              <span className="font-semibold text-sm">{comment.author.name}</span>
                              <div className="flex items-center">
                                <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                                {/* 2번 요청: 댓글 수정/삭제 드롭다운 */}
                                {currentUser && comment.author.uid === currentUser.uid && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        수정
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setIsDeleteCommentDialogOpen(comment.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        삭제
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>

                            {/* 2번 요청: 댓글 수정 폼 (인라인) */}
                            {editingCommentId === comment.id ? (
                              <div className="mt-2 space-y-2">
                                <Textarea
                                  value={editingCommentContent}
                                  onChange={(e) => setEditingCommentContent(e.target.value)}
                                  rows={2}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={handleCancelEditComment}>취소</Button>
                                  <Button size="sm" onClick={handleUpdateComment} disabled={!editingCommentContent.trim()}>저장</Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{comment.content}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-card">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="댓글을 입력하세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <p>게시글을 불러올 수 없습니다.</p>
          )}
        </div>
      </div>

      {/* 2번 요청: 게시글 삭제 확인 다이얼로그 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 게시글과 모든 댓글이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2번 요청: 댓글 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!isDeleteCommentDialogOpen} onOpenChange={(open) => !open && setIsDeleteCommentDialogOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteCommentDialogOpen(null)}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => isDeleteCommentDialogOpen && handleDeleteComment(isDeleteCommentDialogOpen)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}