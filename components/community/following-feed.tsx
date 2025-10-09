// hahaha5/components/community/following-feed.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, BookOpen, Trophy, Target, UserPlus, LogOut } from "lucide-react"

// ==========================================================
// TypeScript 인터페이스 정의 및 Mock 데이터 통합 관리
// ==========================================================

type ActivityType = "wordbook_created" | "study_achievement" | "new_post" | "followed"

interface ActivityFeedItem {
  id: number | string
  type: ActivityType
  user: {
    id: string
    name: string
    username: string
  }
  timestamp: string
  content: {
    text: string
    relatedEntity?: string
    value?: number
  }
}

const MOCK_FEED_ITEMS: ActivityFeedItem[] = [
  {
    id: 1,
    type: "study_achievement",
    user: { id: "learner_a_id", name: "학습자A", username: "@learner_a" },
    timestamp: "10분 전",
    content: {
      text: "단어 100개를 복습하여 '집중 학습가' 배지를 획득했습니다.",
      value: 100,
    },
  },
  {
    id: 2,
    type: "wordbook_created",
    user: { id: "english_master_id", name: "영어마스터", username: "@english_master" },
    timestamp: "30분 전",
    content: {
      text: "새로운 단어장 [IT 업계 전문 용어]를 공유했습니다.",
      relatedEntity: "IT 업계 전문 용어",
    },
  },
  {
    id: 3,
    type: "new_post",
    user: { id: "steadier_id", name: "꾸준이", username: "@steadier" },
    timestamp: "1시간 전",
    content: {
      text: "토론 게시판에 새로운 글 [매일 30분씩 꾸준히 하는 방법]을 작성했습니다.",
      relatedEntity: "매일 30분씩 꾸준히 하는 방법",
    },
  },
  {
    id: 4,
    type: "followed",
    user: { id: "travel_lover_id", name: "여행러버", username: "@travel_lover" },
    timestamp: "2시간 전",
    content: {
      text: "님이 영어마스터 님을 팔로우하기 시작했습니다.",
    },
  },
]

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "wordbook_created":
      return <BookOpen className="h-5 w-5 text-orange-600" />
    case "study_achievement":
      return <Trophy className="h-5 w-5 text-green-600" />
    case "new_post":
      return <MessageCircle className="h-5 w-5 text-blue-600" />
    case "followed":
      return <UserPlus className="h-5 w-5 text-purple-600" />
    default:
      return <MessageCircle className="h-5 w-5 text-gray-600" />
  }
}

export function FollowingFeed() {
  // 기존 mock 데이터를 초기 상태로 사용
  const [feedItems, setFeedItems] = useState<ActivityFeedItem[]>(MOCK_FEED_ITEMS)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  // ==========================================================
  // 2. 팔로우 이벤트 핸들러 및 useEffect를 통한 이벤트 수신 (Step 3)
  // ==========================================================
  const handleFollowToggle = useCallback((event: CustomEvent) => {
    const { userId, userName, isFollowing, timestamp } = event.detail;

    // 언팔로우 시에는 아무 활동도 추가하지 않습니다.
    if (!isFollowing) return;

    const newActivity: ActivityFeedItem = {
      id: Date.now(), // Unique ID
      type: "followed",
      user: { id: userId, name: userName, username: `@${userId}` },
      timestamp: "방금 전",
      content: {
        text: `님을 팔로우하기 시작했습니다.`,
        relatedEntity: undefined,
      },
    };

    // 최신 활동을 피드 목록 맨 위에 추가
    setFeedItems((prevItems) => [newActivity, ...prevItems]);
  }, [])

  useEffect(() => {
    // 이벤트 리스너 등록
    window.addEventListener("userFollowToggle", handleFollowToggle as EventListener);

    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      window.removeEventListener("userFollowToggle", handleFollowToggle as EventListener);
    };
  }, [handleFollowToggle]);


  const handleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const renderFeedItem = (item: ActivityFeedItem) => {
    const isLiked = likedPosts.has(item.id as number)

    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-start gap-4">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
              {item.user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getActivityIcon(item.type)}
              <span className="font-semibold text-gray-900">{item.user.name}</span>
              <span className="text-xs text-gray-500">· {item.timestamp}</span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium text-black">{item.user.name}</span>
              {item.content.text}
            </p>

            {item.content.relatedEntity && (
              <div className="mt-2 text-sm text-orange-500 font-medium cursor-pointer hover:text-orange-600">
                {item.content.relatedEntity}
              </div>
            )}

            {/* Like/Comment actions (향후 구현) */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                <Heart size={14} /> 좋아요
              </span>
              <span className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                <MessageCircle size={14} /> 댓글
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <div className="space-y-4">{feedItems.map(renderFeedItem)}</div>
}