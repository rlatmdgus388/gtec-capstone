"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Plus } from "lucide-react"


interface VocabularyListScreenProps {
    onBack: () => void
    wordbook: {
        id: number
        name: string
        words: Array<{ id: number; word: string; meaning: string; example?: string }>
    }
}

export function VocabularyListScreen({ onBack, wordbook }: VocabularyListScreenProps) {
    const [searchQuery, setSearchQuery] = useState("")
    // [수정] const [showAddPopup, setShowAddPopup] = useState(false) <-- 이 줄 제거
    const [words, setWords] = useState(wordbook.words)

    const filteredWords = words.filter(
        (word) =>
            word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
            word.meaning.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // [수정] handleAddWord 함수 전체 제거
    /*
    const handleAddWord = (newWord: { word: string; meaning: string; example?: string }) => {
        const word = {
            id: Date.now(),
            ...newWord,
        }
        setWords((prev) => [...prev, word])
    }
    */

    return (
        // [수정] 'min-h-screen bg-white' -> 'flex flex-col' (sticky 레이아웃)
        <div className="flex flex-col">
            {/* [수정] 'div' -> 'header', 'sticky' 추가, 'bg-background' 및 'border-b' (표준) 적용 */}
            <header className="sticky top-0 z-40 w-full bg-background">
                <div className="px-4 py-4"> {/* [수정] 'py-6' -> 'py-4' */}
                    <div className="flex items-center gap-3 mb-4">
                        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                            <ArrowLeft size={18} className="text-gray-600" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-900">{wordbook.name}</h1>
                            <p className="text-sm text-gray-600">{words.length}개 단어</p>
                        </div>
                        {/* [수정] 단어 추가(+) 버튼 제거 */}
                        {/*
                        <Button
                            onClick={() => setShowAddPopup(true)}
                            className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-full p-3"
                        >
                            <Plus size={18} />
                        </Button>
                        */}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="단어 검색"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 bg-gray-50 border-0 rounded-full"
                        />
                    </div>
                </div>
            </header>

            {/* [수정] Word List: 'pb-6' (하단 여백) 추가 */}
            <div className="px-4 py-4 space-y-3 pb-6">
                {filteredWords.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">검색 결과가 없습니다</p>
                        {/* [수정] 단어 추가 버튼 제거 */}
                        {/*
                        <Button
                            onClick={() => setShowAddPopup(true)}
                            className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-full px-6"
                        >
                            첫 번째 단어 추가하기
                        </Button>
                        */}
                    </div>
                ) : (
                    filteredWords.map((word) => (
                        <Card key={word.id} className="border-0 shadow-sm bg-white rounded-2xl">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{word.word}</h3>
                                        <p className="text-gray-600 mb-2">{word.meaning}</p>
                                        {word.example && <p className="text-sm text-gray-500 italic">"{word.example}"</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>


        </div>
    )
}