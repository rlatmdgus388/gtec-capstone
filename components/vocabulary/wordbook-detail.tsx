"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddWordDialog } from "./add-word-dialog"
import { PhotoWordCapture } from "@/components/camera/photo-word-capture"
import { ImageSelectionModal } from "@/components/camera/image-selection-modal"
import { ArrowLeft, Search, MoreVertical, Edit, Trash2, Volume2, Play, Eye, EyeOff, Camera, ImageUp } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

// --- 인터페이스 정의 ---
interface Word {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  pronunciation?: string;
  mastered: boolean;
  createdAt: string;
}
interface WordbookDetailProps {
  wordbook: {
    id: number;
    name: string;
    wordCount: number;
    progress: number;
    category: string;
  };
  onBack: () => void;
}

export function WordbookDetail({ wordbook, onBack }: WordbookDetailProps) {
  // --- 상태 관리 ---
  const [searchQuery, setSearchQuery] = useState("");
  const [hideMode, setHideMode] = useState<"none" | "word" | "meaning">("none");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState<string | null>(null);
  
  // ▼▼▼ [수정됨] 단어 목록과 로딩 상태 관리 ▼▼▼
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ▼▼▼ [수정됨] API를 통해 단어 목록을 불러오는 로직 ▼▼▼
  useEffect(() => {
    const fetchWords = async () => {
      if (!wordbook.id) return;
      
      setIsLoading(true);
      try {
        // API 호출로 실제 단어 데이터 가져오기
        const data = await fetchWithAuth(`/api/wordbooks/${wordbook.id}`);
        setWords(data.words || []);
      } catch (error) {
        console.error("단어 목록을 불러오는데 실패했습니다:", error);
        setWords([]); // 에러 발생 시 빈 배열로 초기화
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, [wordbook.id]); // wordbook.id가 변경될 때마다 데이터를 새로고침

  // --- 함수들 ---
  const filteredWords = words.filter(
    (word) =>
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddWord = (newWordData: any) => {
    // API 호출 후 상태를 업데이트하는 방식으로 변경하는 것을 추천합니다.
    // 우선은 UI에 즉시 반영되도록 기존 로직을 유지합니다.
    const newWord: Word = {
      id: `${Date.now()}`, ...newWordData, mastered: false, createdAt: new Date().toISOString().split("T")[0],
    };
    setWords((prev) => [newWord, ...prev]);
  };

  const handleDeleteWord = (wordId: string) => {
    // API 호출로 DB에서 삭제 후 UI 업데이트
    setWords((prev) => prev.filter((word) => word.id !== wordId));
  };
  const toggleMastered = (wordId: string) => {
    // API 호출로 DB 업데이트 후 UI 업데이트
    setWords((prev) => prev.map((word) => (word.id === wordId ? { ...word, mastered: !word.mastered } : word)));
  };

  const handleHideWords = () => { setHideMode("word"); setFlippedCards(new Set()); };
  const handleHideMeanings = () => { setHideMode("meaning"); setFlippedCards(new Set()); };
  const handleShowAll = () => { setHideMode("none"); setFlippedCards(new Set()); };
  const handleCardFlip = (wordId: string) => {
    if (hideMode === "none") return;
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      newSet.has(wordId) ? newSet.delete(wordId) : newSet.add(wordId);
      return newSet;
    });
  };

  const handlePhotoCaptureClick = () => setShowImageSelection(true);
  const handleCameraSelect = () => { setShowImageSelection(false); setSelectedImageData(null); setShowPhotoCapture(true); };
  const handleGallerySelect = () => {
    setShowImageSelection(false);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const imageData = readerEvent.target?.result as string;
          setSelectedImageData(imageData);
          setShowPhotoCapture(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleWordsAdded = (addedWords: any[], wordbookId: number) => {
     console.log("Words added:", addedWords, "to wordbook:", wordbookId);
    // TODO: 실제로 API를 호출하여 단어를 추가하고, 목록을 다시 불러오는 로직으로 변경 필요
  };

  if (showPhotoCapture) {
    return (
      <PhotoWordCapture 
        imageData={selectedImageData} 
        onClose={() => setShowPhotoCapture(false)} 
        onWordsAdded={handleWordsAdded} 
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      <ImageSelectionModal
        open={showImageSelection}
        onClose={() => setShowImageSelection(false)}
        onCameraSelect={handleCameraSelect}
        onGallerySelect={handleGallerySelect}
      />
      
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2">
              <ArrowLeft size={20} className="text-gray-700" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{wordbook.name}</h1>
              <p className="text-sm text-gray-600">{words.length}개 단어 • {wordbook.progress}% 완료</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="p-2"><MoreVertical size={20} className="text-gray-700" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Edit size={16} className="mr-2" />단어장 편집</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive"><Trash2 size={16} className="mr-2" />단어장 삭제</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input placeholder="단어 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-11 h-11 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <AddWordDialog onAddWord={handleAddWord} trigger={<Button className="h-12 ..."><Edit size={18} />직접 입력</Button>} />
              <Button variant="outline" className="h-12 ..." onClick={handlePhotoCaptureClick}><Camera size={18} />사진으로 추가</Button>
            </div>
            <Button className="w-full h-12 ..."><Play size={18} />학습하기</Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <Card className="border border-gray-200 rounded-lg shadow-sm">{/* ... 학습 진도 카드 ... */}</Card>
        
        {/* ▼▼▼ [수정됨] 로딩 및 단어 목록 UI ▼▼▼ */}
        {isLoading ? (
          <div className="space-y-3 pt-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : filteredWords.length === 0 ? (
          <Card className="text-center py-12 border border-gray-200 rounded-lg">
            <CardContent>
              <Edit size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "검색 결과가 없습니다" : "단어가 없습니다"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {searchQuery ? "다른 검색어를 시도해보세요" : "첫 번째 단어를 추가해보세요"}
              </p>
              {!searchQuery && (
                <AddWordDialog onAddWord={handleAddWord} trigger={<Button className="bg-[#FF7A00] ..."><Edit size={16} className="mr-2" />단어 추가하기</Button>} />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredWords.map((word) => (
              <Card key={word.id} className="border border-gray-200 hover:shadow-md transition-all rounded-lg bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => handleCardFlip(word.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        {hideMode === "word" && !flippedCards.has(word.id) ? (
                          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
                        ) : (
                          <h3 className="text-lg font-semibold text-gray-900">{word.word}</h3>
                        )}
                        {word.mastered && (
                          <Badge className="bg-green-100 text-green-700 ...">맞기완료</Badge>
                        )}
                      </div>
                      {hideMode === "meaning" && !flippedCards.has(word.id) ? (
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                      ) : (
                        <p className="text-base text-gray-700 mb-1">{word.meaning}</p>
                      )}
                      {word.pronunciation && <p className="text-sm text-gray-500 mb-2">{word.pronunciation}</p>}
                      {word.example && <p className="text-sm text-gray-500 italic mt-2 ...">{word.example}</p>}
                      {hideMode !== "none" && !flippedCards.has(word.id) && (
                        <p className="text-xs text-gray-400 mt-2">탭하여 보기</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mr-2"><MoreVertical size={16} className="text-gray-500" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleMastered(word.id)}>{word.mastered ? "암기 해제" : "암기 완료"}</DropdownMenuItem>
                        <DropdownMenuItem>편집</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteWord(word.id)}>삭제</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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