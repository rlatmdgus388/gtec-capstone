// hahaha5/components/community/shared-wordbook-detail.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Heart, Download, Share2, MessageCircle, Star, Play } from "lucide-react"

// ==========================================================
// 2단계 핵심: 단어장 다운로드 이벤트 디스패치 함수
// ==========================================================
const dispatchDownloadEvent = (wordbook: any) => {
  window.dispatchEvent(
    new CustomEvent("downloadWordbook", {
      detail: { wordbook },
    })
  );
}

// ==========================================================
// TypeScript 인터페이스 및 Mock 데이터 (Step 1에서 정의된 내용 기반)
// ==========================================================
interface WordbookAuthor {
  name: string
  username: string
  avatar: string
  followers: number
}

interface SampleWord {
  word: string
  meaning: string
  pronunciation: string
}

interface WordbookDetailData {
  id: string
  name: string
  description: string
  author: WordbookAuthor
  wordCount: number
  likes: number
  downloads: number
  rating: number
  reviews: number
  category: string
  difficulty: string
  createdAt: string
  tags: string[]
}

const MOCK_WORDBOOK_DETAIL: WordbookDetailData = {
  id: "toefl_high_score",
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
  reviews: 28,
  category: "시험",
  difficulty: "고급",
  createdAt: "2024-01-15",
  tags: ["TOEFL", "시험", "고급어휘", "학술"],
}

const MOCK_SAMPLE_WORDS: SampleWord[] = [
  { word: "ubiquitous", meaning: "어디에나 있는, 편재하는", pronunciation: "/juːˈbɪkwɪtəs/" },
  { word: "meticulous", meaning: "세심한, 꼼꼼한", pronunciation: "/məˈtɪkjələs/" },
  { word: "paradigm", meaning: "패러다임, 모범", pronunciation: "/ˈpærədaɪm/" },
  { word: "scrutinize", meaning: "자세히 조사하다", pronunciation: "/ˈskruːtənaɪz/" },
  { word: "ambiguous", meaning: "애매한, 모호한", pronunciation: "/æmˈbɪɡjuəs/" },
]

interface SharedWordbookDetailProps {
  wordbookId: string
  onBack: () => void
}
// ==========================================================


export function SharedWordbookDetail({ wordbookId, onBack }: SharedWordbookDetailProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [currentLikes, setCurrentLikes] = useState(MOCK_WORDBOOK_DETAIL.likes)

  const wordbook = MOCK_WORDBOOK_DETAIL
  const sampleWords = MOCK_SAMPLE_WORDS


  const handleLike = () => {
    setIsLiked((prev) => {
      setCurrentLikes((prevCount) => (prev ? prevCount - 1 : prevCount + 1))
      return !prev
    })
  }

  const handleDownload = () => {
    if (isDownloaded) return;

    // 다운로드에 필요한 핵심 정보만 추려서 이벤트 전송 (Step 2)
    dispatchDownloadEvent({
      name: wordbook.name,
      wordCount: wordbook.wordCount,
      category: wordbook.category
    });

    setIsDownloaded(true)
    // VocabularyScreen에서 최종 알림을 담당합니다.
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

      <div className="p-4 space-y-6">
        {/* Wordbook Info */}
        <Card>
          <CardContent className="p-6">
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
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="font-bold text-gray-900">{wordbook.wordCount}</div>
                <div className="text-xs text-gray-600">단어</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{currentLikes}</div>
                <div className="text-xs text-gray-600">좋아요</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{wordbook.downloads}</div>
                <div className="text-xs text-gray-600">다운로드</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900 flex items-center justify-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {wordbook.rating}
                </div>
                <div className="text-xs text-gray-600">{wordbook.reviews}개 리뷰</div>
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
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                className={`flex-1 ${isDownloaded ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"}`}
                disabled={isDownloaded}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloaded ? "다운로드 완료" : "다운로드"}
              </Button>
              <Button
                variant="outline"
                onClick={handleLike}
                className={`${isLiked ? "bg-red-50 border-red-200 text-red-600" : ""}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="outline">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sample Words Preview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">미리보기</h3>
              <Button size="sm" variant="outline">
                <Play className="h-4 w-4 mr-2" />
                학습하기
              </Button>
            </div>
            <div className="space-y-3">
              {sampleWords.map((word, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{word.word}</div>
                      <div className="text-sm text-gray-600 mt-1">{word.meaning}</div>
                      <div className="text-xs text-gray-500 mt-1">{word.pronunciation}</div>
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

        {/* Reviews */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">리뷰 ({wordbook.reviews})</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">학{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">학습자{i}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        정말 유용한 단어장이에요! TOEFL 준비에 많은 도움이 되었습니다.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{i}일 전</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}