"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreHorizontal, Download } from "lucide-react"

export function UserProfile({
  userId,
  isOwnProfile = false,
  onBack,
}: { userId: string; isOwnProfile?: boolean; onBack?: () => void }) {
  const [user, setUser] = useState({
    id: userId,
    name: "김영희",
    username: "@younghee_kim",
    avatar: "/korean-woman-profile.png",
    bio: "영어 학습을 열심히 하고 있는 대학생입니다! 함께 공부해요 📚",
    followers: 1247,
    following: 892,
    wordbooksCount: 15,
    studyStreak: 23,
    totalWords: 2847,
    isFollowing: false,
  })

  const [activeTab, setActiveTab] = useState<"wordbooks" | "activity">("wordbooks")

  const handleFollow = () => {
    setUser((prev) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-900">프로필</h1>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white p-6 border-b">
        <div className="flex items-start gap-4">
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-orange-200"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600 text-sm">{user.username}</p>
            <p className="text-gray-700 text-sm mt-2 leading-relaxed">{user.bio}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <div className="font-bold text-gray-900">{user.followers.toLocaleString()}</div>
            <div className="text-xs text-gray-600">팔로워</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900">{user.following.toLocaleString()}</div>
            <div className="text-xs text-gray-600">팔로잉</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900">{user.wordbooksCount}</div>
            <div className="text-xs text-gray-600">단어장</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900">{user.studyStreak}일</div>
            <div className="text-xs text-gray-600">연속 학습</div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleFollow}
              className={`flex-1 ${user.isFollowing ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-orange-500 text-white hover:bg-orange-600"}`}
            >
              {user.isFollowing ? "팔로잉" : "팔로우"}
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              메시지
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab("wordbooks")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === "wordbooks" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-600"
            }`}
          >
            공개 단어장
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === "activity" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-600"
            }`}
          >
            활동
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "wordbooks" ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">일상 영어 표현 {i}</h3>
                    <p className="text-sm text-gray-600 mt-1">자주 사용하는 영어 표현들을 모았습니다</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>단어 {45 + i * 10}개</span>
                      <span>좋아요 {123 + i * 20}개</span>
                      <span>다운로드 {89 + i * 15}회</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-start gap-3">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{user.name}</span>님이 새로운 단어장을 만들었습니다
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{i}시간 전</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
