// hahaha5/components/vocabulary/vocabulary-screen.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Plus, Camera } from "lucide-react"
import { CreateWordbookDialog } from "./create-wordbook-dialog"
import { WordbookDetail } from "./wordbook-detail"
import { PhotoWordCapture } from "@/components/camera/photo-word-capture"
import { ImageSelectionModal } from "@/components/camera/image-selection-modal"
// API 호출을 위한 fetchWithAuth 함수를 불러옵니다.
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"


// 단어장 타입 정의 (ID를 string으로 변경)
interface LocalWordbook {
  id: string
  name: string
  wordCount: number
  progress: number
  category: string
  createdAt: string
}


interface VocabularyScreenProps {
  selectedWordbookId?: string | null; // ID 타입을 string으로 변경
  onNavigateToStudy?: (wordbookId?: string) => void
}

export function VocabularyScreen({ selectedWordbookId, onNavigateToStudy }: VocabularyScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWordbook, setSelectedWordbook] = useState<any>(null)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [showImageSelection, setShowImageSelection] = useState(false)

  // --- ⬇️ 데이터 로딩 로직 수정 ⬇️ ---

  const [wordbooks, setWordbooks] = useState<LocalWordbook[]>([])
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태를 관리할 state 추가

  // 컴포넌트가 처음 렌더링될 때 실제 단어장 목록을 API를 통해 불러옵니다.
  useEffect(() => {
    const loadWordbooks = async () => {
      setIsLoading(true);
      try {
        // API를 호출하여 실제 단어장 데이터를 가져옵니다.
        const data = await fetchWithAuth('/api/wordbooks');
        setWordbooks(data);
      } catch (error) {
        console.error("단어장 목록을 불러오는데 실패했습니다:", error);
        // 사용자에게 오류 발생을 알릴 수 있습니다 (예: alert, toast)
        alert("단어장 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false); // 로딩 상태 종료
      }
    };
    loadWordbooks();
  }, []);

  // --- ⬆️ 데이터 로딩 로직 수정 완료 ⬆️ ---

  useEffect(() => {
    const handleDownloadWordbook = (event: CustomEvent) => {
      const downloadedWordbook = event.detail.wordbook;

      const newWordbook: LocalWordbook = {
        id: Date.now().toString(), // ID를 문자열로 생성
        name: downloadedWordbook.name,
        wordCount: downloadedWordbook.wordCount,
        progress: 0,
        category: downloadedWordbook.category,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setWordbooks((prev) => [newWordbook, ...prev]);
      alert(`${newWordbook.name} 단어장이 내 단어장에 추가되었습니다!`);
    };

    window.addEventListener("downloadWordbook", handleDownloadWordbook as EventListener);

    return () => {
      window.removeEventListener("downloadWordbook", handleDownloadWordbook as EventListener);
    };
  }, []);


  useEffect(() => {
    if (selectedWordbookId) {
      const wordbook = wordbooks.find((wb) => wb.id === selectedWordbookId)
      if (wordbook) {
        setSelectedWordbook(wordbook)
      }
    }
  }, [selectedWordbookId, wordbooks])

  const filteredWordbooks = wordbooks.filter((wordbook) =>
    wordbook.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // --- ⬇️ 단어장 생성 로직 수정 ⬇️ ---
  const handleCreateWordbook = (newWordbookData: { name: string; description: string; category: string }) => {
    // API를 통해 단어장을 생성하고, 성공 시 목록을 다시 불러옵니다.
    const create = async () => {
        try {
            const newWordbook = await fetchWithAuth('/api/wordbooks', {
                method: 'POST',
                body: JSON.stringify(newWordbookData),
            });
            // 기존 목록의 맨 앞에 새로 생성된 단어장을 추가합니다.
            setWordbooks(prev => [newWordbook, ...prev]);
        } catch (error) {
            console.error("단어장 생성 실패:", error);
            alert("단어장 생성에 실패했습니다.");
        }
    };
    create();
  }
  // --- ⬆️ 단어장 생성 로직 수정 완료 ⬆️ ---


  const handleWordbookClick = (wordbook: any) => {
    setSelectedWordbook(wordbook)
  }

  const handlePhotoCapture = () => {
    setShowImageSelection(true)
  }

  const handleCameraSelect = () => {
    setShowImageSelection(false)
    setShowPhotoCapture(true)
  }

  const handleGallerySelect = () => {
    setShowImageSelection(false)
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = e.target?.result as string
          setShowPhotoCapture(true)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleWordsAdded = (words: any[], wordbookId: number) => {
    console.log("Words added:", words, "to wordbook:", wordbookId)
    setWordbooks((prev) =>
      prev.map((wb) => (wb.id === wordbookId.toString() ? { ...wb, wordCount: wb.wordCount + words.length } : wb)),
    )
  }

  if (showPhotoCapture) {
    return <PhotoWordCapture onClose={() => setShowPhotoCapture(false)} onWordsAdded={handleWordsAdded} />
  }

  if (selectedWordbook) {
    return <WordbookDetail wordbook={selectedWordbook} onBack={() => setSelectedWordbook(null)} />
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <ImageSelectionModal
        open={showImageSelection}
        onClose={() => setShowImageSelection(false)}
        onCameraSelect={handleCameraSelect}
        onGallerySelect={handleGallerySelect}
      />

      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="text-[#FF7A00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">단어장</h1>
              <p className="text-sm text-gray-600">나만의 단어장을 관리하세요</p>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="단어장 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-gray-50 border-0 rounded-full text-base placeholder:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CreateWordbookDialog onCreateWordbook={handleCreateWordbook} />
            <Button
              variant="outline"
              className="h-12 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium"
              onClick={handlePhotoCapture}
            >
              <Camera size={18} />
              사진으로 추가
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          // 로딩 중 스켈레톤
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : filteredWordbooks.length === 0 ? (
          // 단어장이 없을 때 화면
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <BookOpen size={48} className="text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">단어장이 없습니다</h3>
            <p className="text-sm text-gray-600">첫 번째 단어장을 만들어보세요</p>
            <CreateWordbookDialog onCreateWordbook={handleCreateWordbook} />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWordbooks.map((wordbook) => (
              <Card
                key={wordbook.id}
                className="bg-white border border-gray-200 hover:shadow-md transition-all cursor-pointer rounded-xl"
                onClick={() => handleWordbookClick(wordbook)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-base">{wordbook.name}</h3>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-[#FF7A00]/10 text-[#FF7A00] border-0 rounded-full"
                        >
                          {wordbook.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{wordbook.wordCount}개 단어</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between text-sm mb-1">
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
        )}
      </div>
    </div>
  )
}