"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp, Clock, Star, Home } from "lucide-react"
import { PhotoWordCapture } from "@/components/camera/photo-word-capture"

interface HomeScreenProps {
  onNavigateToVocabulary?: (wordbookId?: number) => void
}

export function HomeScreen({ onNavigateToVocabulary }: HomeScreenProps) {
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [recentWordbooks] = useState([
    { id: 1, name: "영어 기초 단어", wordCount: 45, progress: 78, lastStudied: "2시간 전" },
    { id: 2, name: "TOEIC 필수 어휘", wordCount: 120, progress: 34, lastStudied: "1일 전" },
    { id: 3, name: "일상 회화 표현", wordCount: 67, progress: 89, lastStudied: "3시간 전" },
  ])

  const [todayStats] = useState({
    wordsLearned: 12,
    studyTime: 25,
    streak: 7,
  })

  const handlePhotoCapture = () => {
    setShowPhotoCapture(true)
  }

  const handleWordsAdded = (words: any[], wordbookId: number) => {
    console.log("Words added:", words, "to wordbook:", wordbookId)
  }

  const handleWordbookClick = (wordbook: any) => {
    if (onNavigateToVocabulary) {
      onNavigateToVocabulary(wordbook.id)
    }
  }

  if (showPhotoCapture) {
    return <PhotoWordCapture onClose={() => setShowPhotoCapture(false)} onWordsAdded={handleWordsAdded} />
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-xl flex items-center justify-center">
              <Home size={24} className="text-[#FF7A00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">안녕하세요!</h1>
              <p className="text-sm text-gray-600">오늘의 단어, 시작해볼까요?</p>
            </div>
          </div>
          <Badge className="bg-[#FF7A00] text-white border-0 px-3 py-1 text-sm font-medium">
            {todayStats.streak}일 연속
          </Badge>
        </div>
      </div>

      <div className="px-6 py-4 space-y-6">
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardHeader className="pb-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-black">
              <TrendingUp size={20} className="text-[#FF7A00]" />
              오늘의 학습 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FF7A00] mb-1">{todayStats.wordsLearned}</div>
                <div className="text-xs text-gray-600 font-medium">학습한 단어</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FF7A00] mb-1">{todayStats.studyTime}</div>
                <div className="text-xs text-gray-600 font-medium">분 학습</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FF7A00] mb-1">{todayStats.streak}</div>
                <div className="text-xs text-gray-600 font-medium">일 연속</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
              <BookOpen size={20} className="text-[#FF7A00]" />
              최근 단어장
            </h2>
          </div>

          <div className="space-y-3">
            {recentWordbooks.map((wordbook) => (
              <Card
                key={wordbook.id}
                className="bg-white border border-gray-200 hover:shadow-md transition-all cursor-pointer rounded-xl"
                onClick={() => handleWordbookClick(wordbook)}
              >
                <CardContent className=
                  // "px-4 py-2">
                  "p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black text-base mb-1">{wordbook.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen size={14} />
                          {wordbook.wordCount}개 단어
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {wordbook.lastStudied}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-[#FF7A00] mb-1">{wordbook.progress}%</div>
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-[#FF7A00] rounded-full transition-all"
                          style={{ width: `${wordbook.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Card className="bg-white border-2 border-[#FF7A00]/20 shadow-sm rounded-xl">
          <CardContent className="px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-full flex items-center justify-center">
                <Star size={20} className="text-[#FF7A00]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-black text-base">추천 학습</h3>
                <p className="text-gray-600 text-sm mt-0.5">영어 기초 단어 복습하기</p>
              </div>
              <Button className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white border-0 px-4 py-2 rounded-lg font-semibold text-sm">
                시작
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
