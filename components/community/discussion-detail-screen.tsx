"use client"

<<<<<<< HEAD
import { useState, useEffect, useCallback, useRef } from "react"; // useRef import
=======
import { useState, useEffect, useCallback, useRef } from "react" // useRef import
>>>>>>> db7745a (다크모드, 프로필 설정)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Heart, MessageCircle, Send, Eye } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"

interface Comment {
<<<<<<< HEAD
    id: string;
    content: string;
    author: {
        uid: string;
        name: string;
    };
    createdAt: string;
}

interface DiscussionPost {
    id: string;
    title: string;
    content: string;
    author: {
        uid: string;
        name: string;
    };
    replies: number;
    likes: number;
    views: number;
    likedBy: string[];
    createdAt: string;
    category: string;
    comments: Comment[];
}

export function DiscussionDetailScreen({ postId, onBack }: { postId: string; onBack: () => void; }) {
    const [post, setPost] = useState<DiscussionPost | null>(null);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const currentUser = auth.currentUser;
    const fetchInitiated = useRef(false); // API 호출 여부를 추적하는 ref

    const fetchPost = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchWithAuth(`/api/community/discussions/${postId}`);
            setPost(data);
            if (currentUser && data.likedBy?.includes(currentUser.uid)) {
                setIsLiked(true);
            }
        } catch (error) {
            console.error("게시글 조회 실패:", error);
        } finally {
            setIsLoading(false);
        }
    }, [postId, currentUser]);

    useEffect(() => {
        // ref를 확인하여 fetch가 시작되지 않았을 경우에만 API 호출 (StrictMode 중복 실행 방지)
        if (postId && !fetchInitiated.current) {
            fetchInitiated.current = true; // 호출 시작으로 표시
            fetchPost();
        }
    }, [postId, fetchPost]);


    const handleLike = async () => {
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (!post) return;

        try {
            await fetchWithAuth(`/api/community/discussions/${post.id}/like`, {
                method: 'POST',
            });
            setIsLiked(!isLiked);
            setPost(prevPost => {
                if (!prevPost) return null;
                return {
                    ...prevPost,
                    likes: isLiked ? prevPost.likes - 1 : prevPost.likes + 1,
                };
            });
        } catch (error) {
            console.error("좋아요 처리 실패:", error);
            alert("요청 처리에 실패했습니다.");
        }
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }
        if (!currentUser || !post) return;

        try {
            const addedComment = await fetchWithAuth(`/api/community/discussions/${post.id}/comments`, {
                method: 'POST',
                body: JSON.stringify({ content: newComment }),
            });
            setPost(prevPost => {
                if (!prevPost) return null;
                return {
                    ...prevPost,
                    comments: [...prevPost.comments, addedComment],
                    replies: prevPost.replies + 1,
                }
            })
            setNewComment("");
        } catch (error) {
            console.error("댓글 작성 실패:", error);
            alert("댓글 작성에 실패했습니다.");
        }
    };


    const timeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

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
    };


    return (
        <div className="flex-1 overflow-y-auto pb-20 bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10 p-4 flex items-center">
                <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8"><ArrowLeft className="h-5 w-5" /></Button>
                <h1 className="font-semibold text-gray-900 text-lg truncate">{post?.title || '게시글 상세'}</h1>
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
                                        <Badge variant="outline" className="mb-2">{post.category}</Badge>
                                        <h2 className="text-2xl font-bold">{post.title}</h2>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-2">
                                    <Avatar className="w-6 h-6 mr-2"><AvatarFallback>{post.author.name[0]}</AvatarFallback></Avatar>
                                    <span>{post.author.name}</span>
                                    <span className="mx-2">·</span>
                                    <span>{timeAgo(post.createdAt)}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center text-gray-500">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1"><Eye size={14} /> {post.views}</span>
                                    <span className="flex items-center gap-1"><MessageCircle size={14} /> {post.replies}</span>
                                    <span className="flex items-center gap-1"><Heart size={14} /> {post.likes}</span>
                                </div>
                                <Button variant={isLiked ? "destructive" : "outline"} size="sm" onClick={handleLike}>
                                    <Heart className="mr-2 h-4 w-4" />{isLiked ? '좋아요 취소' : '좋아요'}
                                </Button>
                            </CardFooter>
                        </Card>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">댓글 ({post.comments.length})</h3>
                            <div className="space-y-4 mb-6">
                                {post.comments.map(comment => (
                                    <Card key={comment.id} className="bg-white">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <Avatar className="w-8 h-8"><AvatarFallback>{comment.author.name[0]}</AvatarFallback></Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-sm">{comment.author.name}</span>
                                                        <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Card className="bg-white">
                                <CardContent className="p-4">
                                    <div className="flex gap-3">
                                        <Textarea
                                            placeholder="댓글을 입력하세요..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button onClick={handleCommentSubmit}><Send className="h-4 w-4" /></Button>
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
    )
}
=======
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

export function DiscussionDetailScreen({ postId, onBack }: { postId: string; onBack: () => void }) {
  const [post, setPost] = useState<DiscussionPost | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const currentUser = auth.currentUser
  const fetchInitiated = useRef(false) // API 호출 여부를 추적하는 ref

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
    // ref를 확인하여 fetch가 시작되지 않았을 경우에만 API 호출 (StrictMode 중복 실행 방지)
    if (postId && !fetchInitiated.current) {
      fetchInitiated.current = true // 호출 시작으로 표시
      fetchPost()
    }
  }, [postId, fetchPost])

  const handleLike = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.")
      return
    }
    if (!post) return

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
          comments: [...prevPost.comments, addedComment],
          replies: prevPost.replies + 1,
        }
      })
      setNewComment("")
    } catch (error) {
      console.error("댓글 작성 실패:", error)
      alert("댓글 작성에 실패했습니다.")
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
    <div className="flex-1 overflow-y-auto pb-20 bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border sticky top-0 z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-foreground text-lg truncate">{post?.title || "게시글 상세"}</h1>
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
                <Button variant={isLiked ? "destructive" : "outline"} size="sm" onClick={handleLike}>
                  <Heart className="mr-2 h-4 w-4" />
                  {isLiked ? "좋아요 취소" : "좋아요"}
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
                            <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-foreground mt-1">{comment.content}</p>
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
                    <Button onClick={handleCommentSubmit}>
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
  )
}
>>>>>>> db7745a (다크모드, 프로필 설정)
