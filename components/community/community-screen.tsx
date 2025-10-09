// hahaha5/components/community/community-screen.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MessageCircle, Share2, Heart, BookOpen, ArrowLeft, Search } from "lucide-react"
import { useState } from "react"
import { UserProfile } from "./user-profile"
import { SharedWordbookDetail } from "./shared-wordbook-detail"
import { FollowingFeed } from "./following-feed"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// ==========================================================
// 1. TypeScript 인터페이스 및 Mock 데이터 
// ==========================================================

interface SharedWordbook {
  id: number | string
  name: string
  author: string
  authorId: string
  wordCount: number
  likes: number
  downloads: number
  category: string
}

interface DiscussionPost {
  id: number | string
  title: string
  author: string
  authorId: string
  replies: number
  likes: number
  time: string
  category: string
}

const MOCK_SHAREDBOOKS: SharedWordbook[] = [
  {
    id: 1,
    name: "TOEFL 고득점 어휘",
    author: "영어마스터",
    authorId: "english_master_id",
    wordCount: 200,
    likes: 45,
    downloads: 123,
    category: "시험",
  },
  {
    id: 2,
    name: "여행 영어 필수 표현",
    author: "여행러버",
    authorId: "travel_lover_id",
    wordCount: 89,
    likes: 32,
    downloads: 87,
    category: "회화",
  },
  {
    id: 3,
    name: "IT 업계 전문 용어",
    author: "개발자김씨",
    authorId: "dev_kim_id",
    wordCount: 156,
    likes: 67,
    downloads: 234,
    category: "전문",
  },
  {
    id: 4,
    name: "영어 기초 1000단어",
    author: "열공러",
    authorId: "hard_worker_id",
    wordCount: 1000,
    likes: 300,
    downloads: 500,
    category: "기초",
  },
]

const MOCK_DISCUSSIONS: DiscussionPost[] = [
  {
    id: 1,
    title: "효과적인 단어 암기 방법이 있을까요?",
    author: "학습자A",
    authorId: "learner_a_id",
    replies: 12,
    likes: 8,
    time: "2시간 전",
    category: "학습팁",
  },
  {
    id: 2,
    title: "TOEIC 단어 추천 부탁드려요",
    author: "토익준비생",
    authorId: "toeic_student_id",
    replies: 7,
    likes: 5,
    time: "5시간 전",
    category: "질문",
  },
  {
    id: 3,
    title: "매일 30분씩 꾸준히 하는 방법",
    author: "꾸준이",
    authorId: "steadier_id",
    replies: 15,
    likes: 23,
    time: "1일 전",
    category: "학습팁",
  },
]

// 모든 카테고리 추출 및 필터링 옵션 생성 (Step 4)
const ALL_CATEGORIES = Array.from(new Set(MOCK_SHAREDBOOKS.map(wb => wb.category))).sort()
const FILTER_CATEGORIES = [{ label: "전체", value: "all" }, ...ALL_CATEGORIES.map(c => ({ label: c, value: c }))]

// ==========================================================
// 2. Component Logic (검색 및 필터링 상태 추가)
// ==========================================================

export function CommunityScreen() {
  const [currentView, setCurrentView] = useState<"main" | "profile" | "wordbook" | "following">("main")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedWordbookId, setSelectedWordbookId] = useState<string>("")

  // 4단계: 검색 및 필터 상태 추가
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")


  const sharedWordbooks = MOCK_SHAREDBOOKS
  const discussions = MOCK_DISCUSSIONS

  // 4단계: 필터링 로직 구현
  const filteredWordbooks = sharedWordbooks.filter((wordbook) => {
    const matchesSearch = wordbook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wordbook.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || wordbook.category === selectedCategory
    return matchesSearch && matchesCategory
  })


  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId)
    setCurrentView("profile")
  }

  const handleViewWordbook = (wordbookId: string) => {
    setSelectedWordbookId(wordbookId)
    setCurrentView("wordbook")
  }

  const handleViewFollowing = () => {
    setCurrentView("following")
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

  if (currentView === "following") {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={handleBackToMain}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">팔로잉 피드</h1>
            <div></div>
          </div>
        </div>
        <div className="p-4">
          <FollowingFeed />
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
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button className="h-12 flex items-center gap-2 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white">
              <Share2 size={18} />
              단어장 공유하기
            </Button>
            <Button
              variant="outline"
              className="h-12 flex items-center justify-center gap-2 border-2 border-gray-200 hover:bg-gray-50 bg-white text-black"
              onClick={handleViewFollowing}
            >
              <MessageCircle size={18} />
              팔로잉 피드
            </Button>
          </div>

          {/* 4단계: 검색 입력 필드 추가 */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="단어장 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500"
            />
          </div>

          {/* 4단계: 카테고리 필터링 버튼 추가 */}
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex w-max space-x-2">
              {FILTER_CATEGORIES.map((category) => (
                <Badge
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "secondary"}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`cursor-pointer transition-colors text-sm px-3 py-1 ${selectedCategory === category.value
                      ? "bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white border-0"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                    }`}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Shared Wordbooks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen size={20} className="text-[#FF7A00]" />
              공유 단어장 ({filteredWordbooks.length}개)
            </h2>
            <Button variant="ghost" size="sm" className="text-[#FF7A00] hover:bg-[#FF7A00]/10">
              더보기
            </Button>
          </div>

          {/* 4단계: 필터링된 목록 표시 */}
          {filteredWordbooks.length === 0 ? (
            <Card className="text-center py-12 border border-gray-200 rounded-xl">
              <CardContent>
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-sm text-gray-600">다른 검색어 또는 필터를 사용해 보세요.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredWordbooks.map((wordbook) => (
                <Card
                  key={wordbook.id}
                  className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-gray-200 rounded-xl"
                >
                  <CardContent className="p-4" onClick={() => handleViewWordbook(wordbook.id.toString())}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-black">{wordbook.name}</h3>
                          <Badge variant="secondary" className="text-xs bg-[#FF7A00]/10 text-[#FF7A00] border-0">
                            {wordbook.category}
                          </Badge>
                        </div>
                        <p
                          className="text-sm text-gray-600 cursor-pointer hover:text-[#FF7A00]"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewProfile(wordbook.authorId)
                          }}
                        >
                          by {wordbook.author}
                        </p>
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
          )}
        </div>

        {/* Discussion Board remains the same */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle size={20} className="text-[#FF7A00]" />
              토론 게시판
            </h2>
            <Button variant="ghost" size="sm" className="text-[#FF7A00] hover:bg-[#FF7A00]/10">
              더보기
            </Button>
          </div>

          <div className="space-y-3">
            {discussions.map((discussion) => (
              <Card
                key={discussion.id}
                className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-gray-200 rounded-xl"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-[#FF7A00]/10 text-[#FF7A00]">
                        {discussion.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-black text-sm">{discussion.title}</h3>
                        <Badge variant="outline" className="text-xs border-gray-200">
                          {discussion.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span
                          className="cursor-pointer hover:text-[#FF7A00]"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewProfile(discussion.authorId)
                          }}
                        >
                          {discussion.author}
                        </span>
                        <span>{discussion.time}</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {discussion.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} />
                          {discussion.likes}
                        </span>
                      </div>
                    </div>
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