"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, Share2, Heart, BookOpen, ArrowLeft } from "lucide-react"
import { useState } from "react"
// ▼▼▼ [수정됨] 컴포넌트를 불러오는 경로를 수정합니다 ▼▼▼
import { UserProfile } from "@/components/community/user-profile"
import { SharedWordbookDetail } from "@/components/community/shared-wordbook-detail"
import { CommunityBoard } from "@/components/community/CommunityBoard"

export function CommunityScreen() {
  const [currentView, setCurrentView] = useState<"main" | "profile" | "wordbook" | "community">("main")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedWordbookId, setSelectedWordbookId] = useState<string>("")

  const sharedWordbooks = [
    {
      id: 1,
      name: "TOEFL 고득점 어휘",
      author: "영어마스터",
      wordCount: 200,
      likes: 45,
      downloads: 123,
      category: "시험",
    },
    {
      id: 2,
      name: "여행 영어 필수 표현",
      author: "여행러버",
      wordCount: 89,
      likes: 32,
      downloads: 87,
      category: "여행",
    },
    {
      id: 3,
      name: "IT 업계 전문 용어",
      author: "개발자김씨",
      wordCount: 156,
      likes: 67,
      downloads: 234,
      category: "전문",
    },
  ]

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId)
    setCurrentView("profile")
  }

  const handleViewWordbook = (wordbookId: string) => {
    setSelectedWordbookId(wordbookId)
    setCurrentView("wordbook")
  }

  const handleViewCommunity = () => {
    setCurrentView("community")
  }

  const handleBackToMain = () => {
    setCurrentView("main")
  }

  if (currentView === "profile") {
    return <UserProfile userId={selectedUserId} onBack={handleBackToMain} />
  }

  if (currentView === "wordbook") {
    return <SharedWordbookDetail wordbookId={selectedWordbookId} onBack={handleBackToMain} />
  }

  if (currentView === "community") {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={handleBackToMain}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">커뮤니티 게시판</h1>
            <div className="w-9"></div>
          </div>
        </div>
        <div className="p-4">
          <CommunityBoard />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-[#FF7A00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">커뮤니티</h1>
              <p className="text-sm text-gray-600">다른 사용자들과 단어장을 공유하세요</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button className="h-12 flex items-center gap-2 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white">
              <Share2 size={18} />
              단어장 공유하기
            </Button>
            <Button
              variant="outline"
              className="h-12 flex items-center gap-2 border-2 border-gray-200 hover:bg-gray-50 bg-white text-black"
              onClick={handleViewCommunity}
            >
              <MessageCircle size={18} />
              게시판
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Shared Wordbooks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen size={20} className="text-[#FF7A00]" />
              공유 단어장
            </h2>
            <Button variant="ghost" size="sm" className="text-[#FF7A00] hover:bg-[#FF7A00]/10">
              더보기
            </Button>
          </div>

          <div className="space-y-3">
            {sharedWordbooks.map((wordbook) => (
              <Card
                key={wordbook.id}
                className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-gray-200 rounded-xl"
              >
                <CardContent className="px-4 py-3" onClick={() => handleViewWordbook(wordbook.id.toString())}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-black">{wordbook.name}</h3>
                        <Badge variant="secondary" className="text-xs bg-[#FF7A00]/10 text-[#FF7A00] border-0">
                          {wordbook.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">by {wordbook.author}</p>
                      <p className="text-sm text-gray-600">{wordbook.wordCount}개 단어</p>
                    </div>
                    <Button size="sm" className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white">
                      다운로드
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      {wordbook.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 size={14} />
                      {wordbook.downloads}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

