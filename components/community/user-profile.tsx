// hahaha5/components/community/user-profile.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, UserPlus, MessageCircle, Heart, BookOpen, Star, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// ==========================================================
// Global Event Dispatcher (Step 3)
// 팔로우 이벤트를 전역적으로 발생시켜 FollowingFeed가 이를 감지하도록 합니다.
const dispatchFollowEvent = (userId: string, userName: string, isFollowing: boolean) => {
  window.dispatchEvent(
    new CustomEvent("userFollowToggle", {
      detail: { userId, userName, isFollowing, timestamp: new Date().toISOString() },
    })
  )
}
// ==========================================================


// ==========================================================
// TypeScript 인터페이스 및 Mock 데이터 (Step 1 기반)
// ==========================================================

interface UserProfileData {
  id: string
  name: string
  username: string
  bio: string
  followers: number
  following: number
  totalWords: number
  sharedWordbooksCount: number
}

interface SharedWordbook {
  id: number | string
  name: string
  wordCount: number
  likes: number
  category: string
  rating: number
}

const MOCK_USER_PROFILE: UserProfileData = {
  id: "english_master_id",
  name: "영어마스터",
  username: "@english_master",
  bio: "TOEFL, GRE 고득점 어휘 전문가. 함께 성장해요! 📚✨",
  followers: 1234,
  following: 87,
  totalWords: 5000,
  sharedWordbooksCount: 5,
}

const MOCK_USER_WORDBOOKS: SharedWordbook[] = [
  {
    id: 101,
    name: "TOEFL 고득점 어휘",
    wordCount: 200,
    likes: 45,
    category: "시험",
    rating: 4.8,
  },
  {
    id: 102,
    name: "비즈니스 회화 필수",
    wordCount: 150,
    likes: 21,
    category: "직장",
    rating: 4.5,
  },
]


interface UserProfileProps {
  userId: string
  onBack: () => void
}

export function UserProfile({ userId, onBack }: UserProfileProps) {
  // 팔로우 상태를 관리하는 useState 로직 추가 (Step 3)
  const [isFollowing, setIsFollowing] = useState(false)

  const user = MOCK_USER_PROFILE
  const sharedWordbooks = MOCK_USER_WORDBOOKS

  const handleFollow = () => {
    const newState = !isFollowing
    setIsFollowing(newState)

    // ==========================================================
    // 1. 팔로우/언팔로우 시 전역 이벤트 발생 (Step 3)
    // ==========================================================
    dispatchFollowEvent(user.id, user.name, newState)
    alert(newState ? `${user.name}님을 팔로우합니다!` : `${user.name}님을 언팔로우했습니다.`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-900">프로필</h1>
          <div></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <Avatar className="w-20 h-20 mb-3">
              <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-600 mb-3">{user.username}</p>
            <p className="text-center text-sm text-gray-700 mb-4">{user.bio}</p>

            {/* Follow/Message/Stats */}
            <div className="flex gap-3 mb-4">
              <Button
                onClick={handleFollow}
                className={`w-28 ${isFollowing ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-orange-500 hover:bg-orange-600"}`}
              >
                {isFollowing ? (
                  <>
                    <Check className="h-4 w-4 mr-1" /> 팔로잉
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" /> 팔로우
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-12">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{user.followers}</div>
                <div className="text-xs text-gray-600">팔로워</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{user.following}</div>
                <div className="text-xs text-gray-600">팔로잉</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{user.totalWords}</div>
                <div className="text-xs text-gray-600">총 단어</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shared Wordbooks Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">공유 단어장 ({sharedWordbooks.length})</h3>
          <div className="space-y-3">
            {sharedWordbooks.map((wordbook) => (
              <Card key={wordbook.id} className="cursor-pointer hover:shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-black">{wordbook.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>{wordbook.wordCount}개 단어</span>
                        <span className="flex items-center gap-1">
                          <Heart size={14} /> {wordbook.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" /> {wordbook.rating}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-600">
                      {wordbook.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Activity/Posts Section (구현 예정) */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-3">최근 활동</h3>
          <Card>
            <CardContent className="p-4 text-center text-gray-500 text-sm">
              최근 활동 내용이 여기에 표시됩니다.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}