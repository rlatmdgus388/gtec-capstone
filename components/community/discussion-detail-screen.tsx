"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Heart, MessageCircle, Send, Eye, MoreVertical, Edit, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Comment {
  id: string
  content: string
  author: {
    uid: string
    name: string
  }
  createdAt: any // (날짜 객체/문자열 겸용)
}

// [!!! 1. 여기가 수정되었습니다 !!!]
interface DiscussionPost {
  id: string
  title: string
  content: string
  author: {
    uid: string
    name: string
  }
  commentCount: number // 'replies' -> 'commentCount' (부모와 일치)
  likes: number
  views: number
  likedBy: string[]
  createdAt: any // (날짜 객체/문자열 겸용)
  category: string
  comments: Comment[]
}
// [!!! 1. 수정 완료 !!!]


// Firestore timestamp (객체 또는 문자열)를 밀리초(ms)로 변환하는 헬퍼 함수
const getTimestampInMillis = (timestamp: any): number => {
  if (!timestamp) {
    return 0;
  }
  // Case 1: Firestore Timestamp 객체 ({ _seconds, _nanoseconds })
  if (timestamp._seconds !== undefined && timestamp._nanoseconds !== undefined) {
    return timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000;
  }
  // Case 2: ISO 문자열 또는 기타 Date.parse가 가능한 형식
  const date = new Date(timestamp);
  if (!isNaN(date.getTime())) {
    return date.getTime();
  }
  // Fallback
  return 0;
};

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
          comments: [addedComment, ...prevPost.comments],
        }
      })
      setNewComment("")
    } catch (error) {
      console.error("댓글 작성 실패:", error)
      alert("댓글 작성에 실패했습니다.")
    }
  }

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

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditingCommentContent(comment.content)
  }

  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentContent("")
  }

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

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return
    try {
      await fetchWithAuth(`/api/community/discussions/${post.id}/comments/${commentId}`, { method: "DELETE" })
      alert("댓글이 삭제되었습니다.")
      setPost(prevPost => prevPost ? ({
        ...prevPost,
        comments: prevPost.comments.filter(c => c.id !== commentId),
      }) : null)
    } catch (error) {
      console.error("댓글 삭제 실패:", error)
      alert("댓글 삭제에 실패했습니다.")
    } finally {
      setIsDeleteCommentDialogOpen(null)
    }
  }

  const timeAgo = (dateString: any) => {
    const now = new Date()
    const past = new Date(getTimestampInMillis(dateString))
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
      {/* [수정 1] 'h-full' 제거 */}
      <div className={cn("flex flex-col bg-background", "page-transition-enter-from-left")}>

        {/* [수정 2] 'div' -> 'header'로 변경, 'sticky' 속성 추가 */}
        <header className="sticky top-0 z-40 w-full bg-background border-b flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground text-lg truncate flex-1">{post?.title || "게시글 상세"}</h1>

          {post && currentUser && post.author.uid === currentUser.uid && (
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => {
                    // [!!! 2. 여기가 수정되었습니다 !!!]
                    // 린터(linter)가 post가 null이 아님을 확신하도록 if 블록 추가
                    if (post) {
                      onEdit(post)
                    }
                  }}>
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
        </header>

        {/* [수정 3] 'overflow-y-auto' 제거, 'pb' 값 수정 */}
        <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))]">
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
                        <Heart size={14} /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} /> {post.comments.length}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={cn(
                        "transition-colors",
                        isLiked
                          ? "text-red-500 border-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 dark:bg-red-900/50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900"
                          : "text-muted-foreground"
                      )}
                    >
                      <Heart
                        className={cn(
                          "mr-2 h-4 w-4 transition-all",
                          isLiked && "fill-current"
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
                                <span className="font-semibold text-sm">{comment.author.name}</span>
                                <div className="flex items-center">
                                  <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
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
      </div>

      {/* (게시글 삭제 확인 다이얼로그 - 동일) */}
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

      {/* (댓글 삭제 확인 다이얼로그 - 동일) */}
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