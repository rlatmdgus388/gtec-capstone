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
  onUpdate: () => void; // 단어장 목록 새로고침을 위한 함수
}

interface DetectedWord {
  text: string;
  selected: boolean;
}


export function WordbookDetail({ wordbook, onBack, onUpdate }: WordbookDetailProps) {
  // --- 상태 관리 ---
  const [searchQuery, setSearchQuery] = useState("");
  const [hideMode, setHideMode] = useState<"none" | "word" | "meaning">("none");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState<string | null>(null);
  
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWords = async () => {
    if (!wordbook.id) return;
    
    setIsLoading(true);
    try {
      const data = await fetchWithAuth(`/api/wordbooks/${wordbook.id}`);
      setWords(data.words || []);
    } catch (error) {
      console.error("단어 목록을 불러오는데 실패했습니다:", error);
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [wordbook.id]);

  // --- 함수들 ---
  const filteredWords = words.filter(
    (word) =>
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddWord = async (newWordData: { word: string; meaning: string; example?: string; pronunciation?: string; }) => {
    try {
      await fetchWithAuth(`/api/wordbooks/${wordbook.id}/words`, {
        method: 'POST',
        body: JSON.stringify([newWordData]), // 배열로 전송
      });
      await fetchWords();
      onUpdate(); // 단어장 목록의 단어 개수도 업데이트
    } catch (error) {
      console.error("단어 추가에 실패했습니다:", error);
      alert("단어 추가 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteWord = async (wordId: string) => {
     try {
        await fetchWithAuth(`/api/wordbooks/${wordbook.id}/words/${wordId}`, {
            method: 'DELETE',
        });
        await fetchWords();
        onUpdate();
    } catch (error) {
        console.error("단어 삭제 실패:", error);
        alert("단어 삭제 중 오류가 발생했습니다.");
    }
  };

  const toggleMastered = (wordId: string) => {
    setWords((prev) => prev.map((word) => (word.id === wordId ? { ...word, mastered: !word.mastered } : word)));
    // TODO: 서버에 암기 상태 업데이트 API 호출
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

  const handleWordsAdded = async (addedWords: DetectedWord[]) => {
    if (!wordbook || !wordbook.id || addedWords.length === 0) {
        setShowPhotoCapture(false);
        return;
    }

    try {
        const wordsToAdd = addedWords.map(word => ({
            word: word.text,
            meaning: '뜻을 입력하세요', // 기본 의미 설정
        }));

        await fetchWithAuth(`/api/wordbooks/${wordbook.id}/words`, {
            method: 'POST',
            body: JSON.stringify(wordsToAdd), // 배열로 한 번에 전송
        });

        alert(`${wordsToAdd.length}개의 단어가 추가되었습니다.`);
        await fetchWords(); // 현재 단어장 단어 목록 새로고침
        onUpdate(); // 전체 단어장 목록 새로고침 (단어 개수 등)
    } catch (error) {
        console.error("사진으로 단어 추가 실패:", error);
        alert("단어 추가 중 오류가 발생했습니다.");
    } finally {
        setShowPhotoCapture(false);
    }
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
              <AddWordDialog onAddWord={handleAddWord} trigger={<Button className="h-12 flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-lg font-medium"><Edit size={18} />직접 입력</Button>} />
              <Button variant="outline" className="h-12 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium" onClick={handlePhotoCaptureClick}><Camera size={18} />사진으로 추가</Button>
            </div>
            <Button className="w-full h-12 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-lg font-medium"><Play size={18} className="mr-2" />학습하기</Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 단어/뜻 가리기 버튼 */}
        <div className="flex justify-end gap-2">
          <Button variant={hideMode === "word" ? "default" : "outline"} size="sm" onClick={handleHideWords} className="text-xs rounded-full"><EyeOff size={14} className="mr-1" />단어 가리기</Button>
          <Button variant={hideMode === "meaning" ? "default" : "outline"} size="sm" onClick={handleHideMeanings} className="text-xs rounded-full"><EyeOff size={14} className="mr-1" />뜻 가리기</Button>
          <Button variant={hideMode === "none" ? "default" : "outline"} size="sm" onClick={handleShowAll} className="text-xs rounded-full"><Eye size={14} className="mr-1" />모두 보기</Button>
        </div>
        
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
                <AddWordDialog onAddWord={handleAddWord} trigger={<Button className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-lg font-medium"><Edit size={16} className="mr-2" />단어 추가하기</Button>} />
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
                          <Badge className="bg-green-100 text-green-700 border-0 rounded-full">암기완료</Badge>
                        )}
                      </div>
                      {hideMode === "meaning" && !flippedCards.has(word.id) ? (
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                      ) : (
                        <p className="text-base text-gray-700 mb-1">{word.meaning}</p>
                      )}
                      {word.pronunciation && <p className="text-sm text-gray-500 mb-2">{word.pronunciation}</p>}
                      {word.example && <p className="text-sm text-gray-500 italic mt-2 border-l-2 border-gray-200 pl-3">{word.example}</p>}
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