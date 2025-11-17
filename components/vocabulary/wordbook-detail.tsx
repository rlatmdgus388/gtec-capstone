"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { WordEditScreen } from "./word-edit-screen"
// [!!! 여기를 수정합니다 !!!] - 새로 만든 단어장 수정 스크린 import
import { WordbookEditScreen } from "./wordbook-edit-screen"
import { PhotoWordCapture } from "@/components/camera/photo-word-capture"
import { ImageSelectionModal } from "@/components/camera/image-selection-modal"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Camera,
  CheckCircle,
  FolderInput,
  BookCopy,
  Filter,
  ListFilter,
  Check,
  Shuffle,
  X,
} from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

//
// [!!! 1. 여기가 수정되었습니다 !!!]
//
// --- 인터페이스 정의 ---
interface Word {
  id: string
  word: string
  meaning: string
  example?: string
  pronunciation?: string
  mastered: boolean
  createdAt: any // [수정] string에서 any로 변경 (Timestamp 객체와 문자열 모두 받기 위해)
  importOrder?: number
}
// [!!! 1. 수정 완료 !!!]
//

interface Wordbook {
  id: string
  name: string
  wordCount: number
  progress: number
  category: string
}
interface WordbookDetailProps {
  wordbook: Wordbook
  onBack: () => void
  onUpdate: () => void
}
interface DetectedWord {
  text: string
  selected: boolean
  meaning?: string
}

//
// [!!! 2. 여기가 수정되었습니다 !!!]
//
// Firestore timestamp (객체 또는 문자열)를 밀리초(ms)로 변환하는 헬퍼 함수
const getTimestampInMillis = (timestamp: any): number => {
  if (!timestamp) {
    return 0;
  }
  // Case 1: Firestore Timestamp 객체 ({ _seconds, _nanoseconds })
  if (timestamp._seconds !== undefined && timestamp._nanoseconds !== undefined) {
    return timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000;
  }
  // Case 2: ISO 문자열 또는 기타 Date.parse가 가능한 형식
  const date = new Date(timestamp);
  if (!isNaN(date.getTime())) {
    return date.getTime();
  }
  // Fallback
  return 0;
};
// [!!! 2. 수정 완료 !!!]
//

export function WordbookDetail({ wordbook, onBack, onUpdate }: WordbookDetailProps) {
  // --- 상태 관리 ---
  const [words, setWords] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [hideMode, setHideMode] = useState<"none" | "word" | "meaning">("none")
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())

  const [filterMastered, setFilterMastered] = useState<"all" | "exclude">("all")
  const [sortOrder, setSortOrder] = useState<"default" | "random">("default")
  const [shuffledWords, setShuffledWords] = useState<Word[]>([])

  const [showImageSelection, setShowImageSelection] = useState(false)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [selectedImageData, setSelectedImageData] = useState<string | null>(null)

  const [isAddingWord, setIsAddingWord] = useState(false)
  const [editingWord, setEditingWord] = useState<Word | null>(null)

  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())

  const [wordToDelete, setWordToDelete] = useState<Word | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleteWordbookDialogOpen, setIsDeleteWordbookDialogOpen] = useState(false)

  const [isMoveDrawerOpen, setIsMoveDrawerOpen] = useState(false)
  const [movableWordbooks, setMovableWordbooks] = useState<Wordbook[]>([])
  const [isFetchingWordbooks, setIsFetchingWordbooks] = useState(false)

  // [!!! 여기를 수정합니다 !!!] - 단어장 정보 수정용 '페이지' 상태 추가
  const [isEditingWordbookInfo, setIsEditingWordbookInfo] = useState(false)
  // [!!! 수정 끝 !!!] (기존 Drawer 관련 상태 3줄 제거)

  //
  // [!!! 3. 여기가 수정되었습니다 !!!]
  //
  const fetchWords = useCallback(async () => {
    if (!wordbook.id) return
    setIsLoading(true)
    try {
      const data = await fetchWithAuth(`/api/wordbooks/${wordbook.id}`)
      const fetchedWords = data.words || []

      // [수정] 2단계 정렬 로직 (헬퍼 함수 사용)
      fetchedWords.sort((a: Word, b: Word) => {
        // [수정] 헬퍼 함수를 사용하여 안전하게 timestamp 비교
        const dateA = getTimestampInMillis(a.createdAt);
        const dateB = getTimestampInMillis(b.createdAt);

        // 1순위: createdAt 내림차순 (최신순)
        if (dateB !== dateA) {
          return dateB - dateA
        }

        // 2순위: createdAt이 같으면 importOrder 오름차순 (CSV 순서)
        // importOrder가 없는 기존/직접추가 단어는 맨 뒤로 (Infinity)
        const orderA = a.importOrder ?? Infinity
        const orderB = b.importOrder ?? Infinity

        return orderA - orderB
      })
      // [수정 끝]

      setWords(fetchedWords)
      setShuffledWords([...fetchedWords].sort(() => Math.random() - 0.5))
    } catch (error) {
      console.error("단어 목록 로딩 실패:", error)
      setWords([])
    } finally {
      setIsLoading(false)
    }
  }, [wordbook.id])
  //
  // [!!! 3. 수정 완료 !!!]
  //

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  useEffect(() => {
    setSelectedWords(new Set())
  }, [isEditMode])

  // [!!! 여기를 수정합니다 !!!] - (기존 Drawer용 useEffect 제거)

  const filteredAndSortedWords = useMemo(() => {
    // ... (기존 코드와 동일)
    let processedWords = words

    if (searchQuery) {
      processedWords = processedWords.filter(
        (word) =>
          word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.meaning.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (filterMastered === "exclude") {
      processedWords = processedWords.filter((word) => !word.mastered)
    }

    if (sortOrder === "random") {
      const currentFilteredIds = new Set(processedWords.map((w) => w.id))
      processedWords = shuffledWords.filter((w) => currentFilteredIds.has(w.id))
    }

    return processedWords
  }, [words, searchQuery, filterMastered, sortOrder, shuffledWords])

  const handleFilterToggle = () => {
    // ... (기존 코드와 동일)
    setFilterMastered((prevFilter) => {
      const newFilter = prevFilter === "all" ? "exclude" : "all"
      if (sortOrder === "random") {
        setShuffledWords([...words].sort(() => Math.random() - 0.5))
      }
      return newFilter
    })
  }

  const handleSortToggle = () => {
    // ... (기존 코드와 동일)
    setSortOrder((prevOrder) => {
      const newOrder = prevOrder === "default" ? "random" : "default"
      if (newOrder === "random") {
        setShuffledWords([...words].sort(() => Math.random() - 0.5))
      }
      return newOrder
    })
  }

  const handleAddWord = async (newWordData: {
    word: string
    meaning: string
    example?: string
    pronunciation?: string
  }) => {
    // ... (기존 코드와 동일)
    try {
      await fetchWithAuth(`/api/wordbooks/${wordbook.id}/words`, {
        method: "POST",
        body: JSON.stringify([newWordData]),
      })
      await fetchWords()
      onUpdate()
      setIsAddingWord(false)
    } catch (error) {
      console.error("단어 추가에 실패했습니다:", error)
      alert("단어 추가 중 오류가 발생했습니다.")
    }
  }
  const handleUpdateWord = async (
    wordId: string,
    updatedData: {
      word: string
      meaning: string
      example?: string
      pronunciation?: string
    },
  ) => {
    // ... (기존 코드와 동일)
    try {
      await fetchWithAuth(`/api/wordbooks/${wordbook.id}/words/${wordId}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
      })
      await fetchWords()
      onUpdate()
      setEditingWord(null)
    } catch (error) {
      console.error("단어 수정 실패:", error)
      alert("단어 수정 중 오류가 발생했습니다.")
    }
  }
  const confirmWordDelete = async () => {
    // ... (기존 코드와 동일)
    if (!wordToDelete) return
    try {
      await fetchWithAuth(`/api/wordbooks/${wordbook.id}/words/${wordToDelete.id}`, { method: "DELETE" })
      await fetchWords()
      onUpdate()
    } catch (error) {
      console.error("단어 삭제 실패:", error)
      alert("단어 삭제 중 오류가 발생했습니다.")
    } finally {
      setWordToDelete(null)
    }
  }
  const handleDeleteSelectedWords = async () => {
    // ... (기존 코드와 동일)
    try {
      await fetchWithAuth(`/api/wordbooks/${wordbook.id}/words`, {
        method: "DELETE",
        body: JSON.stringify({ wordIds: Array.from(selectedWords) }),
      })
      await fetchWords()
      onUpdate()
      setIsEditMode(false)
    } catch (error) {
      console.error("선택한 단어 삭제 실패:", error)
      alert("단어 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }
  const handleDeleteWordbook = async () => {
    // ... (기존 코드와 동일)
    try {
      await fetchWithAuth(`/api/wordbooks/${wordbook.id}`, { method: "DELETE" })
      alert("단어장이 삭제되었습니다.")
      onBack()
    } catch (error) {
      console.error("단어장 삭제 실패:", error)
      alert("단어장 삭제에 실패했습니다.")
    } finally {
      setIsDeleteWordbookDialogOpen(false)
    }
  }

  // [!!! 여기를 수정합니다 !!!] - 단어장 정보 "저장" 핸들러 (페이지용)
  const handleSaveWordbookInfo = async (data: { name: string; category: string }) => {
    // 유효성 검사는 자식 컴포넌트(WordbookEditScreen)가 하지만, 여기서도 한 번 더 할 수 있습니다.
    if (!data.name) {
      alert("단어장 이름은 비워둘 수 없습니다.")
      return Promise.reject(new Error("이름이 비어있습니다."))
    }
    try {
      await fetchWithAuth(`/api/wordbooks/${wordbook.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: data.name,
          category: data.category,
        }),
      })
      alert("단어장 정보가 수정되었습니다.")
      onUpdate() // 부모 컴포넌트에 변경 사항을 알려 목록을 새로고침하게 함
      setIsEditingWordbookInfo(false) // 상세 페이지로 복귀
    } catch (error) {
      console.error("단어장 정보 수정 실패:", error)
      alert("단어장 정보 수정에 실패했습니다.")
      // 자식 컴포넌트(WordbookEditScreen)가 isSaving을 false로 설정할 수 있도록 에러를 다시 던짐
      throw error
    }
  }
  // [!!! 수정 끝 !!!]

  const toggleMastered = async (wordToToggle: Word) => {
    // ... (기존 코드와 동일)
    try {
      const updatedWord = { ...wordToToggle, mastered: !wordToToggle.mastered }
      setWords((prev) => prev.map((word) => (word.id === wordToToggle.id ? updatedWord : word)))
      setShuffledWords((prev) => prev.map((word) => (word.id === wordToToggle.id ? updatedWord : word)))

      await fetchWithAuth(`/api/wordbooks/${wordbook.id}/words/${wordToToggle.id}`, {
        method: "PUT",
        body: JSON.stringify({ mastered: updatedWord.mastered }),
      })
      onUpdate()
    } catch (error) {
      console.error("암기 상태 업데이트 실패:", error)
      setWords((prev) => prev.map((word) => (word.id === wordToToggle.id ? wordToToggle : word)))
      setShuffledWords((prev) => prev.map((word) => (word.id === wordToToggle.id ? wordToToggle : word)))
      alert("암기 상태 변경에 실패했습니다.")
    }
  }
  const handleMoveWordsClick = async () => {
    // ... (기존 코드와 동일)
    setIsFetchingWordbooks(true)
    setIsMoveDrawerOpen(true)
    try {
      const allWordbooks = await fetchWithAuth("/api/wordbooks")
      setMovableWordbooks(allWordbooks.filter((wb: Wordbook) => wb.id !== wordbook.id))
    } catch (error) {
      console.error("단어장 목록 로딩 실패:", error)
      alert("단어장 목록을 불러오는데 실패했습니다.")
      setIsMoveDrawerOpen(false)
    } finally {
      setIsFetchingWordbooks(false)
    }
  }

  const handleConfirmMove = async (destinationWordbookId: string) => {
    // ... (기존 코드와 동일)
    setIsMoveDrawerOpen(false)
    try {
      await fetchWithAuth("/api/wordbooks/move-words", {
        method: "POST",
        body: JSON.stringify({
          sourceWordbookId: wordbook.id,
          destinationWordbookId,
          wordIds: Array.from(selectedWords),
        }),
      })
      alert(`${selectedWords.size}개의 단어를 이동했습니다.`)
      onBack()
      setIsEditMode(false)
    } catch (error) {
      console.error("단어 이동 실패:", error)
      alert("단어 이동에 실패했습니다.")
    }
  }

  const handleWordSelection = (wordId: string) => {
    // ... (기존 코드와 동일)
    setSelectedWords((prev) => {
      const newSelection = new Set(prev)
      if (newSelection.has(wordId)) {
        newSelection.delete(wordId)
      } else {
        newSelection.add(wordId)
      }
      return newSelection
    })
  }
  const handleSelectAll = () => {
    // ... (기존 코드와 동일)
    if (selectedWords.size === filteredAndSortedWords.length && filteredAndSortedWords.length > 0) {
      setSelectedWords(new Set())
    } else {
      setSelectedWords(new Set(filteredAndSortedWords.map((w) => w.id)))
    }
  }

  const handleToggleHideMode = () => {
    // ... (기존 코드와 동일)
    setFlippedCards(new Set())
    setHideMode((prevMode) => {
      if (prevMode === "none") {
        return "word"
      } else if (prevMode === "word") {
        return "meaning"
      } else {
        return "none"
      }
    })
  }

  const handleCardFlip = (wordId: string) => {
    // ... (기존 코드와 동일)
    setFlippedCards((prev) => {
      const newSet = new Set(prev)
      newSet.has(wordId) ? newSet.delete(wordId) : newSet.add(wordId)
      return newSet
    })
  }

  const handlePhotoCaptureClick = () => {
    setShowImageSelection(true)
  }
  const handleCameraSelect = () => {
    setShowImageSelection(false)
    setSelectedImageData(null)
    setShowPhotoCapture(true)
  }
  const handleGallerySelect = () => {
    // ... (기존 코드와 동일)
    setShowImageSelection(false)
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (readerEvent) => {
          const imageData = readerEvent.target?.result as string
          setSelectedImageData(imageData)
          setShowPhotoCapture(true)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }
  const handleWordsAdded = async (addedWords: DetectedWord[]) => {
    // ... (기존 코드와 동일)
    if (!wordbook || !wordbook.id || addedWords.length === 0) {
      setShowPhotoCapture(false)
      return
    }
    try {
      const wordsToAdd = addedWords.map((word) => ({ word: word.text, meaning: word.meaning || "뜻을 입력하세요" }))
      await fetchWithAuth(`/api/wordbooks/${wordbook.id}/words`, {
        method: "POST",
        body: JSON.stringify(wordsToAdd),
      })
      alert(`${wordsToAdd.length}개의 단어가 추가되었습니다.`)
      await fetchWords()
      onUpdate()
    } catch (error) {
      console.error("사진으로 단어 추가 실패:", error)
    } finally {
      setShowPhotoCapture(false)
    }
  }

  if (isAddingWord)
    return <WordEditScreen wordbookName={wordbook.name} onBack={() => setIsAddingWord(false)} onSave={handleAddWord} />
  if (editingWord)
    return (
      <WordEditScreen
        wordbookName={wordbook.name}
        initialData={editingWord}
        onBack={() => setEditingWord(null)}
        onSave={(data) => handleUpdateWord(editingWord.id, data)}
      />
    )

  // [!!! 여기를 수정합니다 !!!] - 단어장 정보 수정 "페이지" 렌더링
  if (isEditingWordbookInfo)
    return (
      <WordbookEditScreen
        initialData={{ name: wordbook.name, category: wordbook.category }}
        onBack={() => setIsEditingWordbookInfo(false)}
        onSave={handleSaveWordbookInfo}
      />
    )
  // [!!! 수정 끝 !!!]

  if (showPhotoCapture)
    return (
      <PhotoWordCapture
        imageData={selectedImageData}
        onClose={() => setShowPhotoCapture(false)}
        onWordsAdded={handleWordsAdded}
      />
    )

  // [!!! 여기를 수정합니다 !!!] - <React.Fragment> (<>) 추가
  return (
    <>
      {/* ✅ [수정] 
        1. 'flex-1 overflow-y-auto pb-20' 클래스를 제거합니다.
        2. 'h-full flex flex-col'을 추가합니다. 
           (부모 AuthManager가 잡아준 높이를 100% 채우고, flex 레이아웃으로 변경)
      */}
      <div className={cn("h-full flex flex-col bg-background", "page-transition-enter-from-left")}>
        {/* --- 다이얼로그 및 모달 --- */}
        <AlertDialog open={!!wordToDelete} onOpenChange={(open) => !open && setWordToDelete(null)}>
          {/* ... (기존 코드와 동일) */}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>단어 삭제</AlertDialogTitle>
              <AlertDialogDescription>'{wordToDelete?.word}' 단어를 정말로 삭제하시겠습니까?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={confirmWordDelete} className="bg-destructive hover:bg-destructive/90">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          {/* ... (기존 코드와 동일) */}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>단어 삭제</AlertDialogTitle>
              <AlertDialogDescription>{selectedWords.size}개의 단어를 정말로 삭제하시겠습니까?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSelectedWords} className="bg-destructive hover:bg-destructive/90">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={isDeleteWordbookDialogOpen} onOpenChange={setIsDeleteWordbookDialogOpen}>
          {/* ... (기존 코드와 동일) */}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>단어장 삭제</AlertDialogTitle>
              <AlertDialogDescription>'{wordbook.name}' 단어장을 정말로 삭제하시겠습니까?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteWordbook} className="bg-destructive hover:bg-destructive/90">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <ImageSelectionModal
          open={showImageSelection}
          onClose={() => setShowImageSelection(false)}
          onCameraSelect={handleCameraSelect}
          onGallerySelect={handleGallerySelect}
        />

        {/* [!!! 여기를 수정합니다 !!!] - (기존 단어장 정보 수정 Drawer UI 제거) */}

        {/* --- 그룹 변경 Drawer --- */}
        <Drawer open={isMoveDrawerOpen} onOpenChange={setIsMoveDrawerOpen}>
          {/* ... (기존 코드와 동일) */}
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>이동할 그룹 선택</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 max-h-64 overflow-y-auto">
                {isFetchingWordbooks ? (
                  <Skeleton className="h-10 w-full" />
                ) : movableWordbooks.length > 0 ? (
                  movableWordbooks.map((wb) => (
                    <Button
                      key={wb.id}
                      variant="outline"
                      className="w-full justify-start mb-2 bg-transparent"
                      onClick={() => handleConfirmMove(wb.id)}
                    >
                      <BookCopy className="mr-2 h-4 w-4" />
                      {wb.name}
                    </Button>
                  ))
                ) : (
                  <p className="text-center text-sm text-gray-500">이동할 다른 단어장이 없습니다.</p>
                )}
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">취소</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        {/* ✅ [수정] 
          고정될 헤더 영역입니다. 
          'sticky top-0 z-10' -> 'shrink-0' (flex 아이템이 줄어드는 것을 방지)
        */}
        <div className="bg-background shrink-0">
          <div className="px-4 py-4">
            {isEditMode ? (
              // ... (기존 코드와 동일)
              <div className="flex items-center gap-3 mb-4 h-10">
                <Button variant="ghost" size="sm" onClick={() => setIsEditMode(false)} className="p-2 -ml-2">
                  <ArrowLeft size={20} className="text-foreground" />
                </Button>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedWords.size > 0 &&
                      selectedWords.size === filteredAndSortedWords.length &&
                      filteredAndSortedWords.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-lg font-bold text-foreground">
                    단어 선택
                  </label>
                </div>
                <Button
                  variant="link"
                  onClick={() => setSelectedWords(new Set())}
                  className="ml-auto text-primary p-0 h-auto"
                  disabled={selectedWords.size === 0}
                >
                  선택 취소 ({selectedWords.size})
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2">
                    <ArrowLeft size={20} className="text-foreground" />
                  </Button>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-foreground">{wordbook.name}</h1>
                    <p className="text-sm text-muted-foreground">
                      {wordbook.wordCount}개 단어 • {wordbook.progress}% 완료
                    </p>
                  </div>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <MoreVertical size={20} className="text-foreground" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerTitle className="sr-only">단어장 설정</DrawerTitle>
                      <div className="mx-auto w-full max-w-sm">

                        <div className="p-2">
                          <DrawerClose asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start p-2 h-12 text-sm"
                              onClick={() => setIsEditingWordbookInfo(true)} // 페이지로 이동
                            >
                              <BookCopy size={16} className="mr-2" />
                              단어장 정보 수정
                            </Button>
                          </DrawerClose>
                          {/* [!!! 수정 끝 !!!] */}

                          <DrawerClose asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start p-2 h-12 text-sm"
                              onClick={() => setIsEditMode(true)}
                            >
                              <Edit size={16} className="mr-2" />
                              단어 편집
                            </Button>
                          </DrawerClose>
                          <Button
                            variant="ghost"
                            className="w-full justify-start p-2 h-12 text-sm text-destructive hover:text-destructive"
                            onClick={() => setIsDeleteWordbookDialogOpen(true)}
                          >
                            <Trash2 size={16} className="mr-2" />
                            단어장 삭제
                          </Button>
                        </div>
                        <DrawerFooter className="pt-2">
                          <DrawerClose asChild>
                            <Button variant="outline">취소</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>

                {/* ... (이하 기존 코드와 동일) ... */}
                <div className="relative mb-4">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Input
                    placeholder="단어 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-11 bg-muted border-0 rounded-lg text-sm placeholder:text-muted-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setIsAddingWord(true)}
                    className="h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
                  >
                    <Edit size={18} />
                    직접 입력
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 flex items-center justify-center gap-2 bg-card border border-border hover:bg-muted text-foreground rounded-lg font-medium"
                    onClick={handlePhotoCaptureClick}
                  >
                    <Camera size={18} />
                    사진으로 추가
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ✅ [수정] 
          스크롤이 필요한 단어 목록 영역입니다.
          1. 'flex-1' (남은 공간 다 차지)
          2. 'overflow-y-auto' (내부 스크롤)
          3. 'pb-20' (바닥 여백, 기존 최상위 div에서 이동)
        */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="px-4 py-4 space-y-4">
            {/* ... (이하 기존 코드와 동일) ... */}
            {!isEditMode && (
              <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex justify-end gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-full flex-shrink-0"
                    onClick={handleFilterToggle}
                  >
                    {filterMastered === "all" ? <Filter size={14} className="mr-1" /> : <X size={14} className="mr-1 text-red-500" />}
                    {filterMastered === "all" ? "전체" : "미암기"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-full flex-shrink-0"
                    onClick={handleSortToggle}
                  >
                    {sortOrder === "random" ? <Shuffle size={14} className="mr-1" /> : <ListFilter size={14} className="mr-1" />}
                    {sortOrder === "random" ? "랜덤" : "기본"}
                  </Button>
                  <Button
                    variant={hideMode === "none" ? "outline" : "default"}
                    size="sm"
                    onClick={handleToggleHideMode}
                    className="text-xs rounded-full flex-shrink-0"
                  >
                    {hideMode === "none" && (
                      <>
                        <Eye size={14} className="mr-1" />
                        모두 보기
                      </>
                    )}
                    {hideMode === "word" && (
                      <>
                        <EyeOff size={14} className="mr-1" />
                        단어 숨김
                      </>
                    )}
                    {hideMode === "meaning" && (
                      <>
                        <EyeOff size={14} className="mr-1" />
                        뜻 숨김
                      </>
                    )}
                  </Button>
                </div>
                <ScrollBar orientation="horizontal" className="h-2" />
              </ScrollArea>
            )}

            <div className={`space-y-3 ${isEditMode ? "pb-24" : ""}`}>
              {isLoading ? (
                <div className="space-y-3 pt-4">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : filteredAndSortedWords.length === 0 ? (
                <Card className="text-center py-12 border border-border rounded-lg">
                  <CardContent>
                    <Edit size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {searchQuery ? "검색 결과가 없습니다" : filterMastered === "exclude" ? "조건에 맞는 단어가 없습니다" : "단어가 없습니다"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery ? "다른 검색어를 시도해보세요" : filterMastered === "exclude" ? "필터를 변경하거나 단어를 추가하세요" : "첫 번째 단어를 추가해보세요"}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => setIsAddingWord(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
                      >
                        <Edit size={16} className="mr-2" />
                        단어 추가하기
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredAndSortedWords.map((word) => (
                  <Card
                    key={word.id}
                    className={`transition-all rounded-lg bg-card ${selectedWords.has(word.id) ? "border-primary ring-2 ring-primary" : "border border-border"
                      }`}
                    onClick={() => isEditMode && handleWordSelection(word.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        {isEditMode && <Checkbox checked={selectedWords.has(word.id)} className="mr-4 mt-1" />}
                        <div className="flex-1 cursor-pointer" onClick={() => !isEditMode && handleCardFlip(word.id)}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {hideMode === "word" && !flippedCards.has(word.id) && !isEditMode ? (
                                <div className="h-7 w-32 bg-muted rounded animate-pulse" />
                              ) : (
                                <h3 className="text-lg font-semibold text-foreground">{word.word}</h3>
                              )}
                            </div>
                            {!isEditMode && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleMastered(word)
                                }}
                                className={cn(
                                  "text-xs font-semibold rounded-full px-3 py-1 h-auto",
                                  word.mastered
                                    ? "text-green-700 bg-green-100 hover:bg-green-200"
                                    : "text-muted-foreground bg-muted hover:bg-muted/80",
                                )}
                              >
                                {word.mastered ? "암기 완료" : "암기 미완료"}
                              </Button>
                            )}
                          </div>
                          {hideMode === "meaning" && !flippedCards.has(word.id) && !isEditMode ? (
                            <div className="h-6 w-24 bg-muted rounded animate-pulse mb-1" />
                          ) : (
                            <p className="text-base text-foreground mb-1">{word.meaning}</p>
                          )}
                          {flippedCards.has(word.id) && !isEditMode && (
                            <>
                              {word.pronunciation && (
                                <p className="text-sm text-muted-foreground italic mb-1">[{word.pronunciation}]</p>
                              )}
                              {word.example && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 pl-2 border-l-2 border-blue-500 mt-2">
                                  {word.example}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        {!isEditMode && (
                          <Drawer>
                            <DrawerTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -ml-2">
                                <MoreVertical size={16} className="text-muted-foreground" />
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                              <DrawerTitle className="sr-only">단어 옵션</DrawerTitle>
                              <div className="mx-auto w-full max-w-sm">
                                <div className="p-2">
                                  <DrawerClose asChild>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start p-2 h-12 text-sm"
                                      onClick={() => setEditingWord(word)}
                                    >
                                      <Edit size={16} className="mr-2" />
                                      편집
                                    </Button>
                                  </DrawerClose>
                                  <DrawerClose asChild>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start p-2 h-12 text-sm text-destructive hover:text-destructive"
                                      onClick={() => setWordToDelete(word)}
                                    >
                                      <Trash2 size={16} className="mr-2" />
                                      삭제
                                    </Button>
                                  </DrawerClose>
                                </div>
                                <DrawerFooter className="pt-2">
                                  <DrawerClose asChild>
                                    <Button variant="outline">취소</Button>
                                  </DrawerClose>
                                </DrawerFooter>
                              </div>
                            </DrawerContent>
                          </Drawer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* [!!! 여기를 수정합니다 !!!] - 하단 편집 모드 버튼들이 있던 자리 (이제 비어있음) */}
      </div>

      {/* [!!! 여기를 수정합니다 !!!] - 하단 편집 모드 버튼들을 이곳으로 이동 */}
      {/* --- 하단 편집 모드 버튼들 --- */}
      {isEditMode && (
        // [!!!] 여기가 수정되었습니다.
        // bottom-0 -> bottom-[5rem] (네비게이션바 높이)
        // 내부 div의 style={{ marginBottom: "5rem" }} 제거
        <div className="fixed bottom-[5rem] left-1/2 -translate-x-1/2 w-full max-w-md z-20 p-4">
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-card/90 text-sm font-semibold p-2 rounded-lg shadow-md border border-border">
                그룹 변경
              </span>
              <Button
                variant="outline"
                size="icon"
                className="w-14 h-14 rounded-full border-2 bg-card shadow-lg"
                disabled={selectedWords.size === 0}
                onClick={handleMoveWordsClick}
              >
                <FolderInput className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-card/90 text-sm font-semibold p-2 rounded-lg shadow-md border border-border">
                삭제
              </span>
              <Button
                variant="destructive"
                size="icon"
                className="w-14 h-14 rounded-full shadow-lg"
                disabled={selectedWords.size === 0}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </> // [!!! 여기를 수정합니다 !!!] - </React.Fragment> (</>) 추가
  )
}