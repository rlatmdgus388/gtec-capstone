"use client"

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera"
import { Capacitor } from "@capacitor/core"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  Camera as CameraIcon,
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

// --- 인터페이스 정의 ---
interface Word {
  id: string
  word: string
  meaning: string
  example?: string
  pronunciation?: string
  mastered: boolean
  createdAt: any
  importOrder?: number
}

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

// 🔥 [추가] 프로젝트 하단 탭바 높이 상수 정의
const PROJECT_TAB_BAR_HEIGHT = '4rem';


const getTimestampInMillis = (timestamp: any): number => {
  if (!timestamp) {
    return 0
  }
  if (timestamp._seconds !== undefined && timestamp._nanoseconds !== undefined) {
    return timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
  }
  const date = new Date(timestamp)
  if (!isNaN(date.getTime())) {
    return date.getTime()
  }
  return 0
}

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

  const [isEditingWordbookInfo, setIsEditingWordbookInfo] = useState(false)

  // --- 데이터 로딩 ---
  const fetchWords = useCallback(async () => {
    if (!wordbook.id) return
    setIsLoading(true)
    try {
      const data = await fetchWithAuth(`/api/wordbooks/${wordbook.id}`)
      const fetchedWords = data.words || []

      fetchedWords.sort((a: Word, b: Word) => {
        const dateA = getTimestampInMillis(a.createdAt)
        const dateB = getTimestampInMillis(b.createdAt)
        if (dateB !== dateA) {
          return dateB - dateA
        }
        const orderA = a.importOrder ?? Infinity
        const orderB = b.importOrder ?? Infinity
        return orderA - orderB
      })

      setWords(fetchedWords)
      setShuffledWords([...fetchedWords].sort(() => Math.random() - 0.5))
    } catch (error) {
      console.error("단어 목록 로딩 실패:", error)
      setWords([])
    } finally {
      setIsLoading(false)
    }
  }, [wordbook.id])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  useEffect(() => {
    setSelectedWords(new Set())
  }, [isEditMode])

  // --- 메모/필터링 로직 ---
  const filteredAndSortedWords = useMemo(() => {
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

  // --- 핸들러 함수들 ---
  const handleFilterToggle = () => {
    setFilterMastered((prevFilter) => {
      const newFilter = prevFilter === "all" ? "exclude" : "all"
      if (sortOrder === "random") {
        setShuffledWords([...words].sort(() => Math.random() - 0.5))
      }
      return newFilter
    })
  }

  const handleSortToggle = () => {
    setSortOrder((prevOrder) => {
      const newOrder = prevOrder === "default" ? "random" : "default"
      if (newOrder === "random") {
        setShuffledWords([...words].sort(() => Math.random() - 0.5))
      }
      return newOrder
    })
  }

  const handleAddWord = async (newWordData: { word: string; meaning: string; example?: string; pronunciation?: string }) => {
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
    updatedData: { word: string; meaning: string; example?: string; pronunciation?: string },
  ) => {
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

  const handleSaveWordbookInfo = async (data: { name: string; category: string }) => {
    if (!data.name) {
      alert("단어장 이름은 비워둘 수 없습니다.")
      return Promise.reject(new Error("이름이 비어있습니다."))
    }
    try {
      await fetchWithAuth(`/api/wordbooks/${wordbook.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: data.name, category: data.category }),
      })
      alert("단어장 정보가 수정되었습니다.")
      onUpdate()
      setIsEditingWordbookInfo(false)
    } catch (error) {
      console.error("단어장 정보 수정 실패:", error)
      alert("단어장 정보 수정에 실패했습니다.")
      throw error
    }
  }

  const toggleMastered = async (wordToToggle: Word) => {
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
    if (selectedWords.size === filteredAndSortedWords.length && filteredAndSortedWords.length > 0) {
      setSelectedWords(new Set())
    } else {
      setSelectedWords(new Set(filteredAndSortedWords.map((w) => w.id)))
    }
  }

  const handleToggleHideMode = () => {
    setFlippedCards(new Set())
    setHideMode((prevMode) => {
      if (prevMode === "none") return "word"
      else if (prevMode === "word") return "meaning"
      else return "none"
    })
  }

  const handleCardFlip = (wordId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev)
      newSet.has(wordId) ? newSet.delete(wordId) : newSet.add(wordId)
      return newSet
    })
  }

  // --- (사진/갤러리 핸들러) ---

  const handlePhotoCaptureClick = () => {
    setShowImageSelection(true)
  }

  // 네이티브/웹 공통: 사진 촬영
  const handleCameraSelect = async () => {
    setShowImageSelection(false) // 모달 닫기
    try {
      const isNative = Capacitor.isNativePlatform()

      // ✅ 네이티브(Capacitor)에서만 권한 API 사용
      if (isNative) {
        const permission = await Camera.checkPermissions()
        if (permission.camera !== "granted") {
          const request = await Camera.requestPermissions({ permissions: ["camera"] })
          if (request.camera !== "granted") {
            alert("카메라 권한이 필요합니다.")
            return
          }
        }
      }

      // ✅ 공통: 카메라 실행 (웹/네이티브 모두 지원)
      const image = await Camera.getPhoto({
        quality: 90, // 고화질
        allowEditing: false,
        resultType: CameraResultType.DataUrl, // base64 (DataUrl)로 받기
        source: CameraSource.Camera, // 카메라 실행
        width: 1920,
        height: 1080,
        correctOrientation: true, // 방향 자동 보정
      })

      if (image.dataUrl) {
        setSelectedImageData(image.dataUrl)
        setShowPhotoCapture(true)
      }
    } catch (error: any) {
      if (error?.message !== "User cancelled photos app") {
        console.error("카메라 오류:", error)
        alert("카메라를 여는 중 오류가 발생했습니다.")
      }
    }
  }

  // 네이티브/웹 공통: 갤러리 선택
  const handleGallerySelect = async () => {
    setShowImageSelection(false) // 모달 닫기
    try {
      const isNative = Capacitor.isNativePlatform()

      // ✅ 네이티브(Capacitor)에서만 photos 권한 체크
      if (isNative) {
        const permission = await Camera.checkPermissions()
        if (permission.photos !== "granted") {
          const request = await Camera.requestPermissions({ permissions: ["photos"] })
          if (request.photos !== "granted") {
            alert("갤러리 접근 권한이 필요합니다.")
            return
          }
        }
      }

      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos, // 갤러리 실행
        width: 1920,
        height: 1080,
        correctOrientation: true,
      })

      if (image.dataUrl) {
        setSelectedImageData(image.dataUrl)
        setShowPhotoCapture(true)
      }
    } catch (error: any) {
      if (error?.message !== "User cancelled photos app") {
        console.error("갤러리 오류:", error)
        alert("사진을 불러오는 중 오류가 발생했습니다.")
      }
    }
  }

  const handleWordsAdded = async (addedWords: DetectedWord[]) => {
    if (!wordbook || !wordbook.id || addedWords.length === 0) {
      setShowPhotoCapture(false)
      return
    }
    try {
      const wordsToAdd = addedWords.map((word) => ({
        word: word.text,
        meaning: word.meaning || "",
        example: "",
      }))

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

  // --- (페이지 렌더링) ---
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

  if (isEditingWordbookInfo)
    return (
      <WordbookEditScreen
        initialData={{ name: wordbook.name, category: wordbook.category }}
        onBack={() => setIsEditingWordbookInfo(false)}
        onSave={handleSaveWordbookInfo}
      />
    )

  if (showPhotoCapture)
    return (
      <PhotoWordCapture
        imageData={selectedImageData}
        onClose={() => setShowPhotoCapture(false)}
        onWordsAdded={handleWordsAdded}
      />
    )

  // --- (기본 UI 렌더링) ---
  return (
    <>
      <div className={cn("flex flex-col bg-background min-h-screen", "page-transition-enter-from-left")}>
        {/* 다이얼로그 및 모달들 */}
        <AlertDialog open={!!wordToDelete} onOpenChange={(open) => !open && setWordToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>단어 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                &apos;{wordToDelete?.word}&apos; 단어를 정말로 삭제하시겠습니까?
              </AlertDialogDescription>
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>단어장 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                &apos;{wordbook.name}&apos; 단어장을 정말로 삭제하시겠습니까?
              </AlertDialogDescription>
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

        <Drawer open={isMoveDrawerOpen} onOpenChange={setIsMoveDrawerOpen}>
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

        {/* 헤더 */}
        <header className="sticky top-0 z-40 w-full bg-background border-b">
          <div className="px-4 py-4">
            {isEditMode ? (
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
                              onClick={() => setIsEditingWordbookInfo(true)}
                            >
                              <BookCopy size={16} className="mr-2" />
                              단어장 정보 수정
                            </Button>
                          </DrawerClose>
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
                    <CameraIcon size={18} />
                    사진으로 추가
                  </Button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* 본문 (Scrollable Content Area) */}
        <div
          className={cn("flex-1 px-4 py-4 space-y-4 overflow-y-auto",
            // 🔥 isEditMode일 때 하단 플로팅 메뉴 높이만큼 패딩 추가 (Safe Area 지원)
            isEditMode ? "pb-[calc(20rem+env(safe-area-inset-bottom))]" : "pb-[calc(4rem+env(safe-area-inset-bottom))]"
          )}
        >
          {!isEditMode && (
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full flex-shrink-0"
                  onClick={handleFilterToggle}
                >
                  {filterMastered === "all" ? (
                    <Filter size={14} className="mr-1" />
                  ) : (
                    <X size={14} className="mr-1 text-red-500" />
                  )}
                  {filterMastered === "all" ? "전체" : "미암기"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full flex-shrink-0"
                  onClick={handleSortToggle}
                >
                  {sortOrder === "random" ? (
                    <Shuffle size={14} className="mr-1" />
                  ) : (
                    <ListFilter size={14} className="mr-1" />
                  )}
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

          {/* 단어 카드 목록 */}
          <div className="space-y-3">
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
                    {searchQuery
                      ? "검색 결과가 없습니다"
                      : filterMastered === "exclude"
                        ? "조건에 맞는 단어가 없습니다"
                        : "단어가 없습니다"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery
                      ? "다른 검색어를 시도해보세요"
                      : filterMastered === "exclude"
                        ? "필터를 변경하거나 단어를 추가하세요"
                        : "첫 번째 단어를 추가해보세요"}
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
                  className={cn(
                    "transition-all rounded-lg bg-card",
                    selectedWords.has(word.id) ? "border-primary ring-2 ring-primary" : "border border-border",
                  )}
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

      {/* 하단 편집 모드 버튼들 */}
      {isEditMode && (
        <div
          className="fixed right-0 left-0 mx-auto w-full max-w-md z-20 p-4"
          style={{
            // 🔥 Safe Area 및 하단 탭바 높이 반영
            bottom: `calc(${PROJECT_TAB_BAR_HEIGHT} + 0.5rem + env(safe-area-inset-bottom))`,
          }}
        >
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
    </>
  )
}

// 이거