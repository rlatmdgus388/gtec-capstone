"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "../ui/skeleton"
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react"

// 이 파일 내부에서 사용할 Word 인터페이스 (mastered 포함)
interface Word {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  pronunciation?: string;
  mastered: boolean; // 암기 여부
}

interface Wordbook {
    id: string;
    name: string;
    wordCount: number;
}

interface StudyOptionsScreenProps {
  modeId: string;
  modeName: string;
  onBack: () => void;
  onStartStudy: (options: {
    words: Word[], // `mastered`가 포함된 Word 객체 배열
    modeId: string,
    wordbookId: string,
    wordbookName: string,
    writingType?: 'word' | 'meaning'
  }) => void;
}

type MasteryFilter = "all" | "unmastered" | "mastered";

export function StudyOptionsScreen({ modeId, modeName, onBack, onStartStudy }: StudyOptionsScreenProps) {
  
  const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
  const [selectedWordbook, setSelectedWordbook] = useState<Wordbook | null>(null);
  
  const [allWords, setAllWords] = useState<Word[]>([]); // 선택한 단어장의 모든 단어
  const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>("unmastered"); // 기본값 '암기 미완료'
  const [wordCount, setWordCount] = useState(10); // 학습할 단어 개수
  const [writingModeType, setWritingModeType] = useState<'word' | 'meaning'>('word');

  const [isLoading, setIsLoading] = useState({ wordbooks: true, words: false });
  const [error, setError] = useState<string | null>(null);


  // 1. 단어장 목록 불러오기
  useEffect(() => {
    const fetchWordbooks = async () => {
      setIsLoading(prev => ({ ...prev, wordbooks: true }));
      try {
        const data = await fetchWithAuth('/api/wordbooks');
        setWordbooks(data || []);
      } catch (error) {
        console.error("단어장 목록 로딩 실패:", error);
        setError("단어장 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(prev => ({ ...prev, wordbooks: false }));
      }
    };
    fetchWordbooks();
  }, []);

  // 2. 단어장 선택 시 단어 불러오기
  useEffect(() => {
    const fetchWords = async () => {
      if (!selectedWordbook) {
        setAllWords([]);
        return;
      };
      setIsLoading(prev => ({ ...prev, words: true }));
      setError(null);
      try {
        // API에서 'mastered'를 포함한 단어 목록을 가져옴
        const data = await fetchWithAuth(`/api/wordbooks/${selectedWordbook.id}`);
        setAllWords(data.words || []); 
      } catch (error) {
        console.error("단어 목록 로딩 실패:", error);
        setAllWords([]);
        setError("단어 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(prev => ({ ...prev, words: false }));
      }
    };
    fetchWords();
  }, [selectedWordbook]);

  // 3. 필터링된 단어 목록 계산
  const filteredWords = useMemo(() => {
    if (masteryFilter === 'all') {
      return allWords;
    }
    if (masteryFilter === 'mastered') {
      return allWords.filter(w => w.mastered);
    }
    // 'unmastered'
    return allWords.filter(w => !w.mastered);
  }, [allWords, masteryFilter]);

  // 4. 필터나 단어장 변경 시, 단어 개수 기본값 업데이트
  useEffect(() => {
    if (!isLoading.words) {
      if (filteredWords.length > 0) {
        setWordCount(filteredWords.length);
      } else {
        setWordCount(0);
      }
    }
  }, [filteredWords, isLoading.words]);

  const handleWordbookSelect = (wordbook: Wordbook) => {
    setSelectedWordbook(wordbook);
  };

  const handleCountChange = (value: number) => {
    const max = filteredWords.length;
    if (max === 0) {
      setWordCount(0);
      return;
    }
    if (value < 1) setWordCount(1);
    else if (value > max) setWordCount(max);
    else setWordCount(value);
  };

  // 학습 시작 버튼 클릭
  const handleStartClick = () => {
    if (!selectedWordbook || filteredWords.length === 0 || wordCount === 0) {
        alert("학습할 단어를 선택해주세요.");
        return;
    }

    // 1. 필터된 단어 복사
    let wordsToStudy = [...filteredWords];
    
    // 2. 랜덤 셔플
    for (let i = wordsToStudy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordsToStudy[i], wordsToStudy[j]] = [wordsToStudy[j], wordsToStudy[i]];
    }

    // 3. 개수만큼 자르기
    wordsToStudy = wordsToStudy.slice(0, wordCount);

    // 4. study-screen으로 옵션 전달
    onStartStudy({
        words: wordsToStudy,
        modeId: modeId,
        wordbookId: selectedWordbook.id,
        wordbookName: selectedWordbook.name,
        writingType: modeId === 'writing' ? writingModeType : undefined
    });
  };

  const selectedWordbookName = selectedWordbook?.name || "단어장을 선택하세요";
  const maxWords = filteredWords.length;
  const canStart = selectedWordbook && !isLoading.words && maxWords > 0 && wordCount > 0;

  return (
    // ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼
    <div className="flex-1 overflow-y-auto pb-20 bg-white dark:bg-zinc-900">
      {/* 1. Header */}
      {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
            <ArrowLeft size={20} className="text-black dark:text-white" />
          </Button>
          {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
          <h1 className="text-xl font-bold text-black dark:text-white">{modeName} 설정</h1>
        </div>
      </div>

      {/* 2. Options Content */}
      <div className="p-4 space-y-6">
        
        {/* 2.1. 단어장 선택 */}
        {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
        <Card className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl">
          <CardHeader>
            {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
            <CardTitle className="text-lg text-black dark:text-white">1. 단어장 선택</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading.wordbooks ? <Skeleton className="h-12 w-full rounded-lg" /> : (
              <Drawer>
                <DrawerTrigger asChild>
                  {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                  <Button variant="outline" className="h-12 w-full justify-start text-left font-normal border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700">
                    <BookOpen size={18} className="text-[#FF7A00] mr-3" />
                    <span className="truncate">{selectedWordbookName}</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm">
                    <div className="p-2 max-h-[50vh] overflow-y-auto">
                      {wordbooks.length === 0 ? (
                        // ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼
                        <p className="text-center text-gray-500 dark:text-gray-400 p-4">단어장이 없습니다.</p>
                      ) : wordbooks.map((wordbook) => (
                        <DrawerClose asChild key={wordbook.id}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start p-2 h-12 text-sm"
                            onClick={() => handleWordbookSelect(wordbook)}
                          >
                            <div className="flex items-center justify-between w-full">
                                <span>{wordbook.name}</span>
                                {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{wordbook.wordCount}개</span>
                            </div>
                          </Button>
                        </DrawerClose>
                      ))}
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
            {isLoading.words && (
                <div className="flex items-center justify-center pt-4">
                    {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                    <Loader2 className="animate-spin h-5 w-5 text-gray-400 dark:text-gray-500" />
                    {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                    <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">단어 불러오는 중...</span>
                </div>
            )}
            {error && (
                // ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼
                <p className="text-red-600 dark:text-red-500 text-sm pt-2">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* 2.2. 학습 범위 (암기 여부) */}
        {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
        <Card className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl">
            <CardHeader>
                {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                <CardTitle className="text-lg text-black dark:text-white">2. 학습 범위</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup 
                    value={masteryFilter} 
                    onValueChange={(value: string) => setMasteryFilter(value as MasteryFilter)}
                    disabled={!selectedWordbook || isLoading.words}
                    // ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼
                    className="text-black dark:text-white"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="filter-all" />
                        <Label htmlFor="filter-all" className="flex-1">전체</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unmastered" id="filter-unmastered" />
                        <Label htmlFor="unmastered" className="flex-1">암기 미완료</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mastered" id="filter-mastered" />
                        <Label htmlFor="mastered" className="flex-1">암기 완료</Label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>

        {/* 2.3. 학습할 단어 개수 */}
        {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
        <Card className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl">
            <CardHeader>
                {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                <CardTitle className="text-lg text-black dark:text-white">3. 학습할 단어 개수</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Input 
                            type="number" 
                            value={wordCount}
                            onChange={(e) => handleCountChange(parseInt(e.target.value) || 0)}
                            // ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼
                            className="w-20 text-center text-lg font-bold border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                            disabled={!selectedWordbook || isLoading.words || maxWords === 0}
                        />
                        {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                        <span className="text-gray-500 dark:text-gray-400 text-sm">/ {maxWords}개</span>
                    </div>
                    <Slider
                        value={[wordCount]}
                        onValueChange={(value) => handleCountChange(value[0])}
                        max={maxWords}
                        min={maxWords > 0 ? 1 : 0}
                        step={1}
                        disabled={!selectedWordbook || isLoading.words || maxWords === 0}
                    />
                </div>
            </CardContent>
        </Card>

        {/* 2.4. (조건부) 받아쓰기 타입 */}
        {modeId === 'writing' && (
             // ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼
             <Card className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl">
                <CardHeader>
                    {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                    <CardTitle className="text-lg text-black dark:text-white">4. 받아쓰기 타입</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup 
                        value={writingModeType} 
                        onValueChange={(value: string) => setWritingModeType(value as 'word' | 'meaning')}
                        // ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼
                        className="text-black dark:text-white"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="word" id="write-word" />
                            <Label htmlFor="write-word" className="flex-1">뜻 보고 단어 쓰기</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="meaning" id="write-meaning" />
                            <Label htmlFor="write-meaning" className="flex-1">단어 보고 뜻 쓰기</Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>
        )}

      </div>

      {/* 3. Footer (하단 고정 버튼) */}
      {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10 max-w-md mx-auto" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <Button
          size="lg"
          className="w-full h-12 text-base bg-[#FF7A00] hover:bg-[#FF8C00] text-white"
          disabled={!canStart}
          onClick={handleStartClick}
        >
          {canStart ? `학습 시작 (${wordCount}개)` : 
           !selectedWordbook ? "단어장을 선택하세요" : 
           isLoading.words ? "단어 로딩 중..." :
           "학습할 단어가 없습니다"}
        </Button>
      </div>
    </div>
  )
}