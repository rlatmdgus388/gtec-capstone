"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen } from "lucide-react"

interface VocabularySelectionScreenProps {
    onBack: () => void
    wordbooks: Array<{
        id: number
        name: string
        wordCount: number
        progress: number
        category: string
    }>
    onSelectWordbook: (wordbook: any) => void
}

export function VocabularySelectionScreen({ onBack, wordbooks, onSelectWordbook }: VocabularySelectionScreenProps) {
    return (
        // [수정 1] 'min-h-screen' -> 'flex flex-col' (body 스크롤 사용)
        <div className="flex flex-col bg-white">
            {/* [수정 2] 'div' -> 'header'로 감싸고 'sticky' 속성 추가 */}
            {/* (참고: bg-white와 border-gray-100 등 기존 스타일 유지) */}
            <header className="sticky top-0 z-40 w-full bg-white">
                <div className="px-4 py-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                            <ArrowLeft size={18} className="text-gray-600" />
                        </Button>
                        <h1 className="text-xl font-bold text-gray-900">단어장 선택</h1>
                    </div>
                </div>
            </header>

            {/* [수정 3] Wordbook List: 동적 하단 여백 추가 */}
            {/* 'pb-[calc(5rem+env(safe-area-inset-bottom))]' */}
            <div className="px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
                <p className="text-sm text-gray-600 mb-6">학습할 단어장을 선택하여 공부를 시작하세요</p>

                <div className="space-y-4">
                    {wordbooks.map((wordbook) => (
                        <Card
                            key={wordbook.id}
                            className="border-0 shadow-sm bg-white rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => onSelectWordbook(wordbook)}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900 text-lg">{wordbook.name}</h3>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs bg-[#FF7A00]/10 text-[#FF7A00] border-0 rounded-full"
                                            >
                                                {wordbook.category}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{wordbook.wordCount}개 단어</p>
                                    </div>
                                    <BookOpen size={20} className="text-gray-400" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex-1 mr-4">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600">학습 진도</span>
                                            <span className="font-semibold text-[#FF7A00]">{wordbook.progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full">
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
        </div>
    )
}