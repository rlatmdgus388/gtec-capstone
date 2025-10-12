"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AddWordDialog } from "./add-word-dialog"
import { PhotoWordCapture } from "@/components/camera/photo-word-capture"
import { ImageSelectionModal } from "@/components/camera/image-selection-modal"
import { ArrowLeft, Search, MoreVertical, Edit, Trash2, Volume2, Play, Eye, EyeOff, Camera, Share2 } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface Word {
  id: string; word: string; meaning: string; example?: string; pronunciation?: string; mastered: boolean; createdAt: string;
}
interface Wordbook {
  id: number | string; name: string; description?: string; wordCount: number; progress: number; category: string;
}
interface WordbookDetailProps {
  wordbook: Wordbook;
  onBack: () => void;
  onUpdate: () => void; // 단어장 목록 새로고침을 위한 콜백
}

export function WordbookDetail({ wordbook, onBack, onUpdate }: WordbookDetailProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState<string | null>(null);

  const fetchWords = async () => {
    if (!wordbook.id) return;
    setIsLoading(true);
    try {
      const data = await fetchWithAuth(`/api/wordbooks/${wordbook.id}`);
      setWords(data.words || []);
    } catch (error) {
      console.error("단어 목록 로딩 실패:", error);
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [wordbook.id]);

  const handleAddWord = async (newWordData: any) => {
    try {
      await fetchWithAuth(`/api/wordbooks/${wordbook.id}/words`, {
        method: 'POST',
        body: JSON.stringify(newWordData)
      });
      fetchWords(); // 목록 새로고침
      onUpdate();   // 단어장 목록 화면의 wordCount 업데이트
    } catch (error) {
      console.error("단어 추가 실패:", error);
    }
  };

  const handleShareWordbook = async () => {
    try {
      await fetchWithAuth('/api/community/wordbooks', {
        method: 'POST',
        body: JSON.stringify({
          wordbookId: wordbook.id,
          name: wordbook.name,
          description: wordbook.description || '',
          category: wordbook.category,
          wordCount: words.length,
          words: words, // 단어 전체 목록 전달
        }),
      });
      alert('단어장이 커뮤니티에 성공적으로 공유되었습니다!');
    } catch (error) {
      console.error('단어장 공유 실패:', error);
      alert('단어장 공유에 실패했습니다.');
    }
  };

  const filteredWords = words.filter(
    (word) =>
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ... (기존 다른 핸들러 함수들은 유지)
  const handlePhotoCaptureClick = () => setShowPhotoCapture(true);
  const handleWordsAddedFromPhoto = (addedWords: any[]) => {
    // TODO: 사진으로 추가된 단어들을 DB에 저장하는 로직
    console.log("Words to add from photo:", addedWords);
    setShowPhotoCapture(false);
    fetchWords();
    onUpdate();
  };


  if (showPhotoCapture) {
    return <PhotoWordCapture imageData={selectedImageData} onClose={() => setShowPhotoCapture(false)} onWordsAdded={handleWordsAddedFromPhoto} />;
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2">
              <ArrowLeft size={20} className="text-gray-700" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">{wordbook.name}</h1>
              <p className="text-sm text-gray-600">{words.length}개 단어</p>
            </div>
            {/* 공유하기 버튼이 포함된 드롭다운 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2"><MoreVertical size={20} className="text-gray-700" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Edit size={16} className="mr-2" />단어장 편집</DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Share2 size={16} className="mr-2" />커뮤니티에 공유
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>단어장을 공유하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        '{wordbook.name}' 단어장과 포함된 모든 단어가 커뮤니티에 공개적으로 공유됩니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleShareWordbook}>공유하기</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive"><Trash2 size={16} className="mr-2" />단어장 삭제</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* ... 검색 및 다른 버튼들 ... */}
          <div className="grid grid-cols-2 gap-3">
            <AddWordDialog onAddWord={handleAddWord}>
              <Button className="h-12 w-full flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-xl font-medium">
                <Edit size={18} />직접 입력
              </Button>
            </AddWordDialog>
            <Button variant="outline" className="h-12 w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium" onClick={handlePhotoCaptureClick}>
              <Camera size={18} />사진으로 추가
            </Button>
          </div>
        </div>
      </div>

      {/* Word List */}
      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3 pt-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : filteredWords.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Edit size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">단어가 없습니다</h3>
              <p className="text-sm text-gray-600 mb-4">첫 번째 단어를 추가해보세요</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredWords.map((word) => (
              <Card key={word.id} className="border border-gray-200 hover:shadow-md transition-all rounded-lg bg-white">
                {/* ... 단어 카드 UI ... */}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
