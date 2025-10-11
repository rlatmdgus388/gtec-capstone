"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Heart, Download, Share2, MessageCircle, Star, Play } from "lucide-react"

interface SharedWordbookDetailProps {
  wordbookId: string
  onBack: () => void
}

export function SharedWordbookDetail({ wordbookId, onBack }: SharedWordbookDetailProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const wordbook = {
    id: wordbookId,
    name: "TOEFL 고득점 어휘",
    description:
      "TOEFL 시험에서 자주 출제되는 고급 어휘들을 정리한 단어장입니다. 실제 시험 문제에서 추출한 단어들로 구성되어 있어 실전에 도움이 됩니다.",
    author: {
      name: "영어마스터",
      username: "@english_master",
      avatar: "/placeholder.svg?height=40&width=40",
      followers: 1234,
    },
    wordCount: 200,
    likes: 45,
    downloads: 123,
    rating: 4.8,
    // reviews: 28, // 리뷰 데이터 제거
    category: "시험",
    difficulty: "고급",
    createdAt: "2024-01-15",
    tags: ["TOEFL", "시험", "고급어휘", "학술"],
  }

  const sampleWords = [
    { word: "ubiquitous", meaning: "어디에나 있는, 편재하는", pronunciation: "/juːˈbɪkwɪtəs/" },
    { word: "meticulous", meaning: "세심한, 꼼꼼한", pronunciation: "/məˈtɪkjələs/" },
    { word: "paradigm", meaning: "패러다임, 모범", pronunciation: "/ˈpærədaɪm/" },
    { word: "scrutinize", meaning: "자세히 조사하다", pronunciation: "/ˈskruːtənaɪz/" },
    { word: "ambiguous", meaning: "애매한, 모호한", pronunciation: "/æmˈbɪɡjuəs/" },
  ]

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleDownload = () => {
    setIsDownloaded(true)
    // Download logic here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-900">단어장 상세</h1>
          <Button variant="ghost" size="sm">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 pb-20 space-y-6">
        {/* Wordbook Info */}
        <Card>
          <CardContent className="px-6 py-2">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-orange-100 text-orange-600">{wordbook.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{wordbook.name}</h2>
                <p className="text-sm text-gray-600">by {wordbook.author.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{wordbook.category}</Badge>
                  <Badge variant="outline">{wordbook.difficulty}</Badge>
                </div>
              </div>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed mb-4">{wordbook.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="font-bold text-gray-900">{wordbook.wordCount}</div>
                <div className="text-xs text-gray-600">단어</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{wordbook.likes}</div>
                <div className="text-xs text-gray-600">좋아요</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{wordbook.downloads}</div>
                <div className="text-xs text-gray-600">다운로드</div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {wordbook.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            {/* ▼▼▼ [수정됨] 댓글 아이콘을 삭제하고 하트 버튼의 스타일 오류를 수정합니다 ▼▼▼ */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                className={`flex-1 h-12 ${isDownloaded ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"
                  }`}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloaded ? "다운로드 완료" : "다운로드"}
              </Button>
              <Button
                variant="outline"
                onClick={handleLike}
                className={`h-12 w-12 ${isLiked ? "bg-red-50 border-red-200 text-red-600" : ""}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sample Words Preview */}
        <Card>
          <CardContent className="px-6 py-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold">미리보기</h3>
              <Button size="lg" variant="outline">
                <Play className="h-4 w-4 mr-2" />
                학습하기
              </Button>
            </div>
            <div className="space-y-3">
              {sampleWords.map((word, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* ▼▼▼ [수정됨] 글자 크기를 text-base로 변경합니다 ▼▼▼ */}
                      <div className="font-semibold text-gray-900 text-base">{word.word}</div>
                      <div className="text-base text-gray-600 mt-1">{word.meaning}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                총 {wordbook.wordCount}개 단어 중 {sampleWords.length}개 미리보기
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

