"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Play, Clock, BookOpen, PenTool, Brain } from "lucide-react"
import { FlashcardMode } from "./flashcard-mode"
import { QuizMode } from "./quiz-mode"
import { WritingMode } from "./writing-mode"
import { AutoplayMode } from "./autoplay-mode"
import { StudyResults } from "./study-results"

interface Word {
  id: number
  word: string
  meaning: string
  example?: string
  pronunciation?: string
}

interface StudyScreenProps {
  selectedWordbookId?: number | null
}

export function StudyScreen({ selectedWordbookId }: StudyScreenProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [selectedWordbook, setSelectedWordbook] = useState<string>("")
  const [studyResults, setStudyResults] = useState<any>(null)

  // Mock data
  const wordbooks = [
    { id: "1", name: "영어 기초 단어", wordCount: 45 },
    { id: "2", name: "TOEIC 필수 어휘", wordCount: 120 },
    { id: "3", name: "일상 회화 표현", wordCount: 67 },
  ]

  const mockWords: Word[] = [
    { id: 1, word: "apple", meaning: "사과", example: "I eat an apple every day.", pronunciation: "/ˈæpəl/" },
    { id: 2, word: "banana", meaning: "바나나", example: "The banana is yellow.", pronunciation: "/bəˈnænə/" },
    { id: 3, word: "orange", meaning: "오렌지", example: "Orange juice is delicious.", pronunciation: "/ˈɔːrɪndʒ/" },
    { id: 4, word: "grape", meaning: "포도", example: "Grapes are sweet.", pronunciation: "/ɡreɪp/" },
    { id: 5, word: "strawberry", meaning: "딸기", example: "Strawberries are red.", pronunciation: "/ˈstrɔːbəri/" },
  ]

  const studyModes = [
    {
      id: "flashcard",
      name: "플래시카드",
      description: "카드를 넘기며 단어 학습",
      icon: BookOpen,
      color: "bg-[#FF7A00]",
      difficulty: "쉬움",
    },
    {
      id: "autoplay",
      name: "자동재생",
      description: "자동으로 단어와 뜻 재생",
      icon: Play,
      color: "bg-gray-700",
      difficulty: "쉬움",
    },
    {
      id: "writing",
      name: "받아쓰기",
      description: "직접 단어를 입력하여 학습",
      icon: PenTool,
      color: "bg-gray-600",
      difficulty: "어려움",
    },
    {
      id: "quiz",
      name: "객관식 퀴즈",
      description: "객관식 문제로 실력 테스트",
      icon: Brain,
      color: "bg-black",
      difficulty: "보통",
    },
  ]

  const recentSessions = [
    { wordbook: "영어 기초 단어", mode: "플래시카드", score: 85, duration: "15분", date: "오늘" },
    { wordbook: "TOEIC 필수 어휘", mode: "객관식 퀴즈", score: 72, duration: "20분", date: "어제" },
    { wordbook: "일상 회화 표현", mode: "쓰기 테스트", score: 91, duration: "12분", date: "2일 전" },
  ]

  useEffect(() => {
    if (selectedWordbookId) {
      setSelectedWordbook(selectedWordbookId.toString())
    }
  }, [selectedWordbookId])

  const handleModeSelect = (modeId: string) => {
    if (!selectedWordbook) {
      alert("먼저 단어장을 선택해주세요.")
      return
    }
    setSelectedMode(modeId)
  }

  const handleStudyComplete = (results: { correct: number; total: number; timeSpent: number }) => {
    setStudyResults({ ...results, mode: selectedMode })
    setSelectedMode(null)
  }

  const handleAutoplayComplete = () => {
    setStudyResults({ correct: mockWords.length, total: mockWords.length, timeSpent: 180, mode: "autoplay" })
    setSelectedMode(null)
  }

  const handleRestart = () => {
    setStudyResults(null)
  }

  const handleHome = () => {
    setStudyResults(null)
    setSelectedMode(null)
    setSelectedWordbook("")
  }

  // Render study modes
  if (selectedMode === "flashcard") {
    return <FlashcardMode words={mockWords} onComplete={handleStudyComplete} onBack={() => setSelectedMode(null)} />
  }

  if (selectedMode === "quiz") {
    return <QuizMode words={mockWords} onComplete={handleStudyComplete} onBack={() => setSelectedMode(null)} />
  }

  if (selectedMode === "writing") {
    return <WritingMode words={mockWords} onComplete={handleStudyComplete} onBack={() => setSelectedMode(null)} />
  }

  if (selectedMode === "autoplay") {
    return <AutoplayMode words={mockWords} onComplete={handleAutoplayComplete} onBack={() => setSelectedMode(null)} />
  }

  // Render results
  if (studyResults) {
    const modeName = studyModes.find((m) => m.id === studyResults.mode)?.name || "학습"
    return <StudyResults results={studyResults} mode={modeName} onRestart={handleRestart} onHome={handleHome} />
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-xl flex items-center justify-center">
              <GraduationCap size={24} className="text-[#FF7A00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">학습하기</h1>
              <p className="text-sm text-gray-600">다양한 방법으로 단어를 학습하세요</p>
            </div>
          </div>

          <div className="space-y-2 mb-2">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-[#FF7A00]" />
              <span className="text-base font-medium text-black">단어장 선택</span>
            </div>
            <Select value={selectedWordbook} onValueChange={setSelectedWordbook}>
              <SelectTrigger className="h-10 border border-gray-200 bg-white rounded-lg">
                <SelectValue placeholder="학습할 단어장을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {wordbooks.map((wordbook) => (
                  <SelectItem key={wordbook.id} value={wordbook.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{wordbook.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{wordbook.wordCount}개</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-black">학습 모드</h2>
          <div className="grid grid-cols-2 gap-3">
            {studyModes.map((mode) => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  className="aspect-square bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 p-4 flex flex-col items-center justify-center text-center space-y-2 group"
                  onClick={() => handleModeSelect(mode.id)}
                >
                  <div
                    className={`w-14 h-14 ${mode.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon size={34} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-black mb-0.5 text-base">{mode.name}</h3>
                    <p className="text-sm text-gray-600 leading-tight">{mode.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-3 text-black">최근 학습 기록</h2>
          <div className="space-y-2">
            {recentSessions.map((session, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 shadow-sm bg-white rounded-xl"
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-black mb-0.5 text-base">{session.wordbook}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{session.mode}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {session.duration}
                        </span>
                        <span>{session.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#FF7A00]">{session.score}%</div>
                      <div className="text-[16px] text-gray-500">점수</div>
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
