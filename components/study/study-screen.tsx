"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image" // Image 컴포넌트를 사용하기 위해 import
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// Drawer 관련 import 제거
import { GraduationCap, Clock } from "lucide-react" // Play, BookOpen, PenTool, Brain 제거
import { FlashcardMode } from "./flashcard-mode"
import { QuizMode } from "./quiz-mode"
import { WritingMode } from "./writing-mode"
import { AutoplayMode } from "./autoplay-mode"
import { StudyResults } from "./study-results"
import { StudyHistoryScreen } from "./study-history-screen"
import { StudySessionDetailScreen } from "./study-session-detail"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "../ui/skeleton"
import { Loader2 } from "lucide-react"
import { StudyOptionsScreen } from "./study-options-screen" // StudyOptionsScreen 임포트

// Word 인터페이스 수정 (mastered 옵셔널 추가)
interface Word {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  pronunciation?: string;
  mastered?: boolean; // 옵션 화면 또는 리뷰 화면에서 오는 단어 타입 맞추기
}

// 이 인터페이스는 study-options-screen.tsx에서만 사용됨
// interface Wordbook {
//     id: string;
//     name: string;
//     wordCount: number;
// }

// 학습 기록 표시에 필요하므로 유지
interface StudySession {
    id: string;
    wordbookName: string;
    mode: string;
    score: number;
    duration: number; // 초 단위
    completedAt: string;
}

// 학습 기록 상세에서 리뷰시 사용되므로 유지
interface WordResult {
  id: string; // 타입을 string으로 통일
  word: string;
  meaning: string;
}

interface StudyScreenProps {
  selectedWordbookId?: string | null; // 이 prop은 이제 사용되지 않지만, 유지
}

export function StudyScreen({ selectedWordbookId }: StudyScreenProps) {
  const [selectedModeInfo, setSelectedModeInfo] = useState<{ id: string, name: string } | null>(null) // selectedMode -> selectedModeInfo
  const [writingModeType, setWritingModeType] = useState<'word' | 'meaning'>('word');
  
  // 단어장 선택, 단어 목록 관련 state 제거
  // const [selectedWordbook, setSelectedWordbook] = useState<string>("")
  // const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
  // const [words, setWords] = useState<Word[]>([]);

  // 새 학습 세션을 위한 state 추가
  const [studyWords, setStudyWords] = useState<Word[]>([]);
  const [studyContext, setStudyContext] = useState<{ wordbookId: string, wordbookName: string } | null>(null);

  const [studyResults, setStudyResults] = useState<any>(null)
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [reviewWords, setReviewWords] = useState<any[] | null>(null);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);

  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState({ sessions: true }); // wordbooks, words 로딩 제거

  // fetchWordbooks 제거
  
  const fetchRecentSessions = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, sessions: true }));
    try {
      const data = await fetchWithAuth('/api/study-sessions');
      setRecentSessions(data || []);
    } catch (error) {
      console.error("최근 학습 기록 로딩 실패:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, sessions: false }));
    }
  }, []);

  useEffect(() => {
    // fetchWordbooks(); // 제거
    fetchRecentSessions();
  }, [fetchRecentSessions]); // fetchWordbooks 의존성 제거

  // fetchWords useEffect 제거

  // ▼▼▼ [수정됨] icon 속성을 src 속성(이미지 경로)으로 변경 ▼▼▼
  const studyModes = [
    {
      id: "flashcard", name: "플래시카드", description: "카드를 넘기며 단어 학습", src: "/icons/flash.svg", color: "bg-white-500"
    },
    {
      id: "autoplay", name: "자동재생", description: "자동으로 단어와 뜻 재생", src: "/icons/auto.svg", color: "bg-white-500"
    },
    {
      id: "writing", name: "받아쓰기", description: "직접 단어를 입력하여 학습", src: "/icons/write.svg", color: "bg-white-500"
    },
    {
      id: "quiz", name: "객관식 퀴즈", description: "객관식 문제로 실력 테스트", src: "/icons/quiz.svg", color: "bg-white-500"
    },
  ]

  // handleModeSelect 수정
  const handleModeSelect = (mode: { id: string, name: string }) => {
    // 단어장 선택 및 단어 개수 확인 로직 제거
    setSelectedModeInfo(mode)
  }

  // StudyOptionsScreen에서 호출할 함수
  const handleStartStudy = (options: {
    words: Word[],
    modeId: string,
    wordbookId: string,
    wordbookName: string,
    writingType?: 'word' | 'meaning'
  }) => {
    setStudyWords(options.words);
    setStudyContext({ wordbookId: options.wordbookId, wordbookName: options.wordbookName });
    setSelectedModeInfo({ id: options.modeId, name: studyModes.find(m => m.id === options.modeId)!.name });
    if (options.modeId === 'writing' && options.writingType) {
        setWritingModeType(options.writingType);
    }
    setReviewWords(null); // 리뷰 세션이 아님을 확인
  };

  const handleStudyComplete = async (results: {
    correct: number;
    total: number;
    timeSpent: number;
    correctWords?: string[];
    incorrectWords?: string[];
  }) => {
    const isReviewSession = !!reviewWords;
    if (isReviewSession) {
        setStudyResults({ ...results, mode: selectedModeInfo?.id, isReview: true, reviewWords: reviewWords });
        setSelectedModeInfo(null);
        setReviewWords(null);
        return;
    }

    const currentWordbook = studyContext; // selectedWordbook 대신 studyContext 사용
    const modeName = selectedModeInfo?.name || "학습";

    setStudyResults({ ...results, mode: selectedModeInfo?.id, isReview: false });
    setSelectedModeInfo(null);
    setStudyWords([]); // 학습 단어 초기화
    setStudyContext(null); // 학습 컨텍스트 초기화

    if (currentWordbook && results.total > 0) {
      try {
        await fetchWithAuth('/api/study-sessions', {
          method: 'POST',
          body: JSON.stringify({
            wordbookId: currentWordbook.wordbookId, // studyContext 값 사용
            wordbookName: currentWordbook.wordbookName, // studyContext 값 사용
            mode: modeName,
            score: Math.round((results.correct / results.total) * 100),
            duration: results.timeSpent,
            correctWords: results.correctWords || [],
            incorrectWords: results.incorrectWords || [],
          }),
        });
        fetchRecentSessions();
      } catch (error) {
        console.error("학습 기록 저장 실패:", error);
      }
    }
  }

  const handleAutoplayComplete = async () => {
    const wordsToUse = reviewWords || studyWords; // words 대신 studyWords 사용
    const timeSpent = wordsToUse.length * 3;
    const isReviewSession = !!reviewWords;

    if (isReviewSession) {
        setStudyResults({ correct: wordsToUse.length, total: wordsToUse.length, timeSpent, mode: "autoplay", isReview: true, reviewWords: reviewWords });
        setSelectedModeInfo(null);
        setReviewWords(null);
        return;
    }

    const currentWordbook = studyContext; // selectedWordbook 대신 studyContext 사용
    const modeName = "자동재생";

    setStudyResults({ correct: wordsToUse.length, total: wordsToUse.length, timeSpent, mode: "autoplay", isReview: false });
    setSelectedModeInfo(null);
    setStudyWords([]); // 학습 단어 초기화
    setStudyContext(null); // 학습 컨텍스트 초기화

    if (currentWordbook) {
        try {
            await fetchWithAuth('/api/study-sessions', {
                method: 'POST',
                body: JSON.stringify({
                    wordbookId: currentWordbook.wordbookId, // studyContext 값 사용
                    wordbookName: currentWordbook.wordbookName, // studyContext 값 사용
                    mode: modeName,
                    score: 100,
                    duration: timeSpent,
                    correctWords: wordsToUse.map(w => w.id),
                    incorrectWords: [],
                }),
            });
            fetchRecentSessions();
        } catch (error) {
            console.error("학습 기록 저장 실패:", error);
        }
    }
  }

  const handleRestart = () => {
    const results = studyResults;
    setStudyResults(null)
    if(results.isReview) {
        setReviewWords(results.reviewWords);
    }
    // isReview가 아닐 경우, studyWords와 studyContext는 이미 state에 남아있음
    setSelectedModeInfo({ id: results.mode, name: studyModes.find(m => m.id === results.mode)!.name });
  }

  const handleHomeFromResults = () => {
    const wasReviewing = studyResults?.isReview;
    setStudyResults(null);
    if (wasReviewing) {
      setIsHistoryVisible(true);
    } else {
      // 새 학습 세션이었 경우, state 초기화
      setStudyWords([]);
      setStudyContext(null);
    }
    fetchRecentSessions();
    window.scrollTo(0, 0);
  };
  
  const handleBackFromStudy = () => {
    setSelectedModeInfo(null);
    setReviewWords(null);
    setStudyWords([]); // 학습 단어 초기화
    setStudyContext(null); // 학습 컨텍스트 초기화
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "방금 전";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "어제";
    return `${diffInDays}일 전`;
  }

  const handleStartReview = (mode: string, wordsToReview: WordResult[], writingType?: 'word' | 'meaning') => {
    if (mode === 'writing' && writingType) {
      setWritingModeType(writingType);
    }
    setReviewWords(wordsToReview);
    setSelectedModeInfo({ id: mode, name: studyModes.find(m => m.id === mode)!.name }); // selectedModeInfo 설정
    setStudyWords([]); // 새 학습 state 초기화
    setStudyContext(null); // 새 학습 state 초기화
  };
  
  const wordsForSession = reviewWords || studyWords; // words 대신 studyWords 사용

  // --- 뷰 렌더링 로직 ---

  // 1. 학습 옵션 화면
  if (selectedModeInfo && !reviewWords && studyWords.length === 0) {
    return <StudyOptionsScreen 
      modeId={selectedModeInfo.id}
      modeName={selectedModeInfo.name}
      onBack={() => setSelectedModeInfo(null)}
      onStartStudy={handleStartStudy}
    />
  }

  // 2. 학습 진행 화면
  if (selectedModeInfo && wordsForSession && wordsForSession.length > 0) {
    // isLoading.words 체크 제거
    switch (selectedModeInfo.id) {
      case "flashcard": return <FlashcardMode words={wordsForSession} onComplete={handleStudyComplete} onBack={handleBackFromStudy} />
      case "quiz": return <QuizMode words={wordsForSession} onComplete={handleStudyComplete} onBack={handleBackFromStudy} />
      case "writing": return <WritingMode words={wordsForSession} onComplete={handleStudyComplete} onBack={handleBackFromStudy} type={writingModeType} />
      case "autoplay": return <AutoplayMode words={wordsForSession} onComplete={handleAutoplayComplete} onBack={handleBackFromStudy} />
      default:
        // 혹시 모를 오류 방지
        handleBackFromStudy();
        return null;
    }
  }

  // 3. 학습 결과 화면
  if (studyResults) {
    const modeName = studyModes.find((m) => m.id === studyResults.mode)?.name || "학습"
    return <StudyResults results={studyResults} mode={modeName} onRestart={handleRestart} onHome={handleHomeFromResults} />
  }

  // 4. 학습 기록 상세 화면
  if (selectedSession) {
      return <StudySessionDetailScreen session={selectedSession} onBack={() => setSelectedSession(null)} onStartReview={handleStartReview} />;
  }

  // 5. 전체 학습 기록 화면
  if (isHistoryVisible) {
    return <StudyHistoryScreen onBack={() => setIsHistoryVisible(false)} onStartReview={handleStartReview} />;
  }

  // 6. 메인 학습 화면 (기본)
  // selectedWordbookName 제거

  return (
    // ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼
    <div className="flex-1 overflow-y-auto pb-20 bg-white dark:bg-zinc-900">
      {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-xl flex items-center justify-center">
              <GraduationCap size={24} className="text-[#FF7A00]" />
            </div>
            <div>
              {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
              <h1 className="text-2xl font-bold text-black dark:text-white">학습하기</h1>
              {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
              <p className="text-sm text-gray-600 dark:text-gray-400">다양한 방법으로 단어를 학습하세요</p>
            </div>
          </div>

          {/* === 단어장 선택 섹션 제거 === */}
          
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        <div>
          {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
          <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">학습 모드</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* ▼▼▼ [수정됨] studyModes.map() 렌더링 로직 변경 ▼▼▼ */}
            {studyModes.map((mode) => (
                <button
                  key={mode.id}
                  className="aspect-square bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl hover:shadow-md transition-all duration-200 p-4 flex flex-col items-center justify-center text-center space-y-2 group"
                  onClick={() => handleModeSelect(mode)}
                >
                  <div className={`w-14 h-14 ${mode.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 p-2`}>
                    {/* Image 컴포넌트로 변경 */}
                    <Image
                      src={mode.src}
                      alt={`${mode.name} 아이콘`}
                      width={34}
                      height={34}
                      className="text-white" // SVG fill="currentColor" 일 경우를 대비
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-black dark:text-white mb-0.5 text-base">{mode.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight">{mode.description}</p>
                  </div>
                </button>
              )
            )}
            {/* ▲▲▲ [수정됨] studyModes.map() 렌더링 로직 변경 ▲▲▲ */}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
            <h2 className="text-base font-semibold text-black dark:text-white">최근 학습 기록</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsHistoryVisible(true)}>
              더보기
            </Button>
          </div>
          <div className="space-y-2">
            {isLoading.sessions ? ( // isLoading.sessions 사용
                <div className="space-y-2">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            ) : recentSessions.length === 0 ? (
                // ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼
                <Card className="border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800">
                    {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                    <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
                        최근 학습 기록이 없습니다.
                    </CardContent>
                </Card>
            ) : (
                recentSessions.slice(0, 5).map((session) => (
                  <Card
                    key={session.id}
                    // ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼
                    className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-zinc-700 shadow-sm bg-white dark:bg-zinc-800 rounded-xl"
                    onClick={() => setSelectedSession(session)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                          <h3 className="font-medium text-black dark:text-white mb-0.5 text-base">{session.wordbookName}</h3>
                          {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span>{session.mode}</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {session.duration < 60 ? `${session.duration}초` : `${Math.floor(session.duration / 60)}분`}
                            </span>
                            <span>{formatRelativeTime(session.completedAt)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#FF7A00]">{session.score}%</div>
                          {/* ▼▼▼ [수정됨] dark: 클래스 추가 ▼▼▼ */}
                          <div className="text-[16px] text-gray-500 dark:text-gray-400">점수</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}