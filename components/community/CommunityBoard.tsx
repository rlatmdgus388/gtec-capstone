"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, BookOpen, Trophy, Target } from "lucide-react"

interface Comment {
  user: {
    name: string
    avatarFallback: string
  }
  text: string
}

// ▼▼▼ [추가됨] 피드 아이템들의 타입을 명확하게 정의합니다 ▼▼▼
interface FeedItemBase {
  id: number;
  user: { name: string; username: string; avatar: string };
  timestamp: string;
  likes: number;
  comments: Comment[];
}

interface WordbookCreatedItem extends FeedItemBase {
  type: "wordbook_created";
  content: {
    title: string;
    description: string;
    wordCount: number;
    category: string;
  };
}

interface StudyAchievementItem extends FeedItemBase {
  type: "study_achievement";
  content: { achievement: string; streak: number; totalWords: number };
}

interface WordbookSharedItem extends FeedItemBase {
  type: "wordbook_shared";
  content: { title: string; description: string; wordCount: number; category: string; originalAuthor: string; };
}

interface StudyMilestoneItem extends FeedItemBase {
  type: "study_milestone";
  content: { milestone: string; totalWords: number; studyDays: number; };
}

interface DiscussionItem extends FeedItemBase {
  type: "discussion";
  content: { text: string; };
}

type FeedItem = WordbookCreatedItem | StudyAchievementItem | WordbookSharedItem | StudyMilestoneItem | DiscussionItem;


export function CommunityBoard() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<number | null>(null)
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({})
  const [newPostText, setNewPostText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    {
      id: 1,
      type: "wordbook_created",
      user: { name: "김영희", username: "@younghee_kim", avatar: "/placeholder.svg" },
      content: {
        title: "일상 영어 회화 표현",
        description: "매일 사용하는 영어 표현들을 정리했어요!",
        wordCount: 45,
        category: "회화",
      },
      timestamp: "2시간 전",
      likes: 12,
      comments: [
        { user: { name: "박민수", avatarFallback: "박" }, text: "오, 좋은 단어장이네요!" },
        { user: { name: "이지은", avatarFallback: "이" }, text: "감사합니다~" },
      ],
    },
    {
      id: 2,
      type: "study_achievement",
      user: { name: "박민수", username: "@minsoo_park", avatar: "/placeholder.svg" },
      content: { achievement: "7일 연속 학습 달성!", streak: 7, totalWords: 156 },
      timestamp: "4시간 전",
      likes: 8,
      comments: [],
    },
    {
      id: 3,
      type: "wordbook_shared",
      user: { name: "이지은", username: "@jieun_lee", avatar: "/placeholder.svg" },
      content: {
        title: "TOEIC 필수 단어 500",
        description: "TOEIC 고득점을 위한 필수 어휘 모음",
        wordCount: 500,
        category: "시험",
        originalAuthor: "영어마스터",
      },
      timestamp: "6시간 전",
      likes: 23,
      comments: [],
    },
    {
      id: 4,
      type: "study_milestone",
      user: { name: "최수진", username: "@sujin_choi", avatar: "/placeholder.svg" },
      content: {
        milestone: "1000개 단어 학습 완료!",
        totalWords: 1000,
        studyDays: 45,
      },
      timestamp: "1일 전",
      likes: 34,
      comments: [],
    },
    {
      id: 5,
      type: "discussion",
      user: { name: "학습자A", username: "@learner_a", avatar: "/placeholder.svg" },
      content: {
        text: "다들 단어 암기할 때 어떤 방법을 쓰시나요? 좋은 팁 있으면 공유해주세요!",
      },
      timestamp: "방금 전",
      likes: 0,
      comments: [],
    },
  ])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [newPostText])

  const handleLike = (postId: number) => {
    const newLikedPosts = new Set(likedPosts)
    const isLiked = newLikedPosts.has(postId)

    setFeedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === postId) {
          return { ...item, likes: isLiked ? item.likes - 1 : item.likes + 1 }
        }
        return item
      }),
    )

    if (isLiked) {
      newLikedPosts.delete(postId)
    } else {
      newLikedPosts.add(postId)
    }
    setLikedPosts(newLikedPosts)
  }

  const handleToggleComments = (postId: number) => {
    setExpandedCommentsPostId((prevId) => (prevId === postId ? null : postId))
  }

  const handleCommentSubmit = (postId: number) => {
    const newCommentText = commentInputs[postId]
    if (!newCommentText || newCommentText.trim() === "") return

    const newComment: Comment = {
      user: { name: "나", avatarFallback: "나" },
      text: newCommentText,
    }

    setFeedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === postId) {
          return { ...item, comments: [...item.comments, newComment] }
        }
        return item
      }),
    )

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
  }

  const handlePostSubmit = () => {
    if (!newPostText || newPostText.trim() === "") return

    const newPost: DiscussionItem = {
      id: Date.now(),
      type: "discussion",
      user: { name: "나", username: "@me", avatar: "/placeholder.svg" },
      content: {
        text: newPostText,
      },
      timestamp: "방금 전",
      likes: 0,
      comments: [],
    }

    setFeedItems((prevItems) => [newPost, ...prevItems])
    setNewPostText("")
  }


  const renderFeedItem = (item: FeedItem) => {
    const isLiked = likedPosts.has(item.id)

    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        {/* ▼▼▼ [수정됨] 카드 내부 여백을 px-4 py-3으로 조정합니다 ▼▼▼ */}
        <CardContent className="px-4 py-3">
          {/* User Info */}
          {/* ▼▼▼ [수정됨] 하단 마진을 mb-2로 조정합니다 ▼▼▼ */}
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-orange-100 text-orange-600">{item.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{item.user.name}</span>
                <span className="text-xs text-gray-500">{item.user.username}</span>
              </div>
              <span className="text-xs text-gray-500">{item.timestamp}</span>
            </div>
          </div>

          {/* Content */}
          {item.type === "wordbook_created" && (
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">새로운 단어장을 만들었습니다</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.content.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.content.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.content.category}
                      </Badge>
                      <span className="text-xs text-gray-500">{item.content.wordCount}개 단어</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {item.type === "study_achievement" && (
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">학습 목표를 달성했습니다</span>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2">{item.content.achievement}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>연속 학습: {item.content.streak}일</span>
                  <span>총 학습 단어: {item.content.totalWords}개</span>
                </div>
              </div>
            </div>
          )}

          {item.type === "wordbook_shared" && (
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">단어장을 공유했습니다</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900">{item.content.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.content.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.content.category}
                  </Badge>
                  <span className="text-xs text-gray-500">{item.content.wordCount}개 단어</span>
                  <span className="text-xs text-gray-500">원작자: {item.content.originalAuthor}</span>
                </div>
              </div>
            </div>
          )}

          {item.type === "study_milestone" && (
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">학습 마일스톤을 달성했습니다</span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-2">{item.content.milestone}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>총 학습일: {item.content.studyDays}일</span>
                  <span>학습 단어: {item.content.totalWords}개</span>
                </div>
              </div>
            </div>
          )}

          {item.type === "discussion" && (
            <div className="mb-2">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{item.content.text}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(item.id)}
              className={`flex items-center gap-1 ${isLiked ? "text-red-500" : "text-gray-500"}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500" : ""}`} />
              <span className="text-xs">{item.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleComments(item.id)}
              className="flex items-center gap-1 text-gray-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{item.comments.length}</span>
            </Button>
          </div>

          {/* 댓글 목록 및 입력창 UI */}
          {expandedCommentsPostId === item.id && (
            <div className="mt-4 pt-4 border-t">
              {/* 댓글 목록 */}
              <div className="space-y-3 mb-4">
                {item.comments.length > 0 ? (
                  item.comments.map((comment, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-gray-100">{comment.user.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-gray-50 rounded-lg p-2">
                        <span className="font-semibold text-xs mr-2">{comment.user.name}</span>
                        <p className="text-xs text-gray-700 inline">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center">아직 댓글이 없습니다.</p>
                )}
              </div>
              {/* 새 댓글 입력창 */}
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">나</AvatarFallback>
                </Avatar>
                <input
                  type="text"
                  placeholder="댓글 추가..."
                  className="flex-1 border-gray-200 rounded-full px-3 py-1.5 text-xs focus:ring-orange-500 focus:border-orange-500"
                  value={commentInputs[item.id] || ""}
                  onChange={(e) => setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit(item.id)}
                />
                <Button size="sm" onClick={() => handleCommentSubmit(item.id)} disabled={!commentInputs[item.id]}>
                  게시
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      <Card>
        <CardContent className="px-4 py-3">
          <textarea
            ref={textareaRef}
            className="w-full border-gray-200 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500 resize-none overflow-hidden"
            placeholder="새로운 소식을 공유해보세요..."
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            rows={1}
          />
          <div className="flex justify-end mt-2">
            <Button size="sm" onClick={handlePostSubmit} disabled={!newPostText.trim()}>
              게시하기
            </Button>
          </div>
        </CardContent>
      </Card>

      {feedItems.map(renderFeedItem)}
    </div>
  )
}

