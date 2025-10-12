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
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="px-4 py-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                        <ArrowLeft size={18} className="text-gray-600" />
                    </Button>
                    <h1 className="text-xl font-bold text-gray-900">단어장 선택</h1>
                </div>
            </div>

            {/* Wordbook List */}
            <div className="px-4 py-6">
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
