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
import { ArrowLeft, Search, MoreVertical, Edit, Trash2, Volume2, Play, Camera, Lightbulb } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageSelection, setShowImageSelection] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState<string | null>(null);
  const [visibleExamples, setVisibleExamples] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // --- API를 통해 단어 목록을 불러오는 로직 ---
  useEffect(() => {
    const fetchWords = async () => {
      if (!wordbook.id) return;
      
      setIsLoading(true);
      try {
        const data = await fetchWithAuth(`/api/wordbooks/${wordbook.id}`);
        // API 호출이 실패할 경우를 대비한 Mock 데이터 (UI 테스트용)
        const mockWords = [
            { id: '1', word: 'apple', meaning: '사과', example: 'An apple a day keeps the doctor away.', pronunciation: '/ˈæpəl/', mastered: false, createdAt: '2024-01-01' },
            { id: '2', word: 'banana', meaning: '바나나', pronunciation: '/bəˈnænə/', mastered: true, createdAt: '2024-01-02' },
            { id: '3', word: 'cherry', meaning: '체리', example: 'This cherry pie is delicious.', mastered: false, createdAt: '2024-01-03' },
        ];
        setWords(data.words || mockWords);
      } catch (error) {
        console.error("단어 목록을 불러오는데 실패했습니다:", error);
        setWords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, [wordbook.id]);

  // --- 기존 함수들 (핸들러) ---
  const filteredWords = words.filter(
    (word) =>
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddWord = (newWordData: any) => {
    const newWord: Word = {
      id: `${Date.now()}`, ...newWordData, mastered: false, createdAt: new Date().toISOString().split("T")[0],
    };
    setWords((prev) => [newWord, ...prev]);
  };

  const handleDeleteWord = (wordId: string) => {
    setWords((prev) => prev.filter((word) => word.id !== wordId));
  };
  const toggleMastered = (wordId: string) => {
    setWords((prev) => prev.map((word) => (word.id === wordId ? { ...word, mastered: !word.mastered } : word)));
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
  };

    // --- 예문/소리 관련 핸들러 함수들 ---
    const handleToggleExample = (wordId: string, hasExample: boolean) => {
        if (!hasExample) {
          toast({
            title: "예문 없음",
            description: "이 단어에는 등록된 예문이 없습니다.",
          });
          return;
        }
        setVisibleExamples(prev => {
          const newSet = new Set(prev);
          if (newSet.has(wordId)) {
            newSet.delete(wordId);
          } else {
            newSet.add(wordId);
          }
          return newSet;
        });
      };
    
      const handlePlaySound = (wordText: string) => {
        toast({
          title: "음성 재생",
          description: `"${wordText}" 단어의 음성을 재생합니다.`,
        });
        // 실제 TTS API 연동 로직
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
      
      {/* **[복구]** 상단 UI 및 단어 추가 기능 전체 복구 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
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
              <AddWordDialog onAddWord={handleAddWord} trigger={<Button className="h-12 flex items-center justify-center gap-2 rounded-xl font-medium"><Edit size={18} />직접 입력</Button>} />
              <Button variant="outline" className="h-12 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium" onClick={handlePhotoCaptureClick}><Camera size={18} />사진으로 추가</Button>
            </div>
            <Button className="w-full h-12 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-xl font-medium"><Play size={18} />학습하기</Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3 pt-4">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
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
                        <AddWordDialog onAddWord={handleAddWord} trigger={<Button className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white"><Edit size={16} className="mr-2" />단어 추가하기</Button>} />
                    )}
                </CardContent>
            </Card>
        ) : (
          <div className="space-y-3">
            {filteredWords.map((word) => (
              <Card key={word.id} className="border border-gray-200 hover:shadow-md transition-all rounded-lg bg-white">
                <CardContent className="p-4 relative">
                  <div className="flex items-start justify-between pb-12">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 break-all">{word.word}</h3>
                        {word.mastered && (
                          <Badge className="bg-green-100 text-green-700 flex-shrink-0">암기완료</Badge>
                        )}
                      </div>
                      <p className="text-base text-gray-700 mb-1">{word.meaning}</p>
                      {word.pronunciation && <p className="text-sm text-gray-500 mb-2">{word.pronunciation}</p>}
                      {visibleExamples.has(word.id) && word.example && (
                        <p className="text-sm text-blue-600 italic mt-2 p-2 bg-blue-50 rounded-md">
                          "{word.example}"
                        </p>
                      )}
                    </div>
                    <div className="pl-2">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical size={16} className="text-gray-500" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleMastered(word.id)}>{word.mastered ? "암기 해제" : "암기 완료"}</DropdownMenuItem>
                            <DropdownMenuItem>편집</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteWord(word.id)}>삭제</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 flex items-center gap-1">
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleExample(word.id, !!word.example)}
                          className={cn(
                              "h-10 w-10 rounded-full",
                              word.example ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
                          )}
                          title={word.example ? "예문 보기/숨기기" : "등록된 예문 없음"}
                      >
                          <Lightbulb size={22} />
                      </Button>
                      
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlaySound(word.word)}
                          className="h-10 w-10 rounded-full text-gray-600 hover:bg-gray-100"
                          title="단어 음성 듣기"
                      >
                          <Volume2 size={22} />
                      </Button>
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