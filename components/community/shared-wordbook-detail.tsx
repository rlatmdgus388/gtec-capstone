// hahaha5/components/community/shared-wordbook-detail.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Heart, Download, Share2, MessageCircle, Star, Play } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase" // 현재 사용자 ID를 가져오기 위함
import { Skeleton } from "@/components/ui/skeleton"

// ... (인터페이스 정의는 그대로 유지)
interface WordbookAuthor {
  uid: string;
  name: string;
  photoURL: string;
}

interface SampleWord {
  word: string;
  meaning: string;
  pronunciation?: string;
}

interface WordbookDetailData {
  id: string
  name: string
  description: string
  author: WordbookAuthor
  wordCount: number
  likes: number;
  downloads: number;
  likedBy?: string[]; // '좋아요' 누른 사용자 목록
  rating: number
  reviews: number
  category: string
  difficulty: string
  createdAt: string
  tags: string[]
  words: SampleWord[]
}


interface SharedWordbookDetailProps {
  wordbookId: string
  onBack: () => void
}

export function SharedWordbookDetail({ wordbookId, onBack }: SharedWordbookDetailProps) {
  const [wordbook, setWordbook] = useState<WordbookDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!wordbookId) return;
      setIsLoading(true);
      try {
        const data = await fetch(`/api/community/wordbooks/${wordbookId}`);
        const fetchedWordbook = await data.json();

        if (fetchedWordbook) {
          setWordbook(fetchedWordbook);
          // 현재 사용자가 '좋아요'를 눌렀는지 확인
          const currentUser = auth.currentUser;
          if (currentUser && fetchedWordbook.likedBy?.includes(currentUser.uid)) {
            setIsLiked(true);
          }
        }
      } catch (error) {
        console.error("단어장 상세 정보 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [wordbookId]);

  const handleLike = async () => {
    if (!wordbook) return;
    try {
      const response = await fetchWithAuth(`/api/community/wordbooks/${wordbook.id}/like`, {
        method: 'POST',
      });
      if (response) {
        setIsLiked(!isLiked);
        setWordbook(prev => prev ? { ...prev, likes: response.likes } : null);
      }
    } catch (error) {
      console.error("'좋아요' 처리 실패:", error);
      alert("'좋아요' 처리에 실패했습니다.");
    }
  };

  const handleDownload = async () => {
    if (!wordbook || isDownloaded) return;
    try {
      await fetchWithAuth(`/api/community/wordbooks/${wordbook.id}/download`, {
        method: 'POST',
      });
      alert(`'${wordbook.name}' 단어장을 다운로드했습니다! '내 단어장'에서 확인하세요.`);
      setIsDownloaded(true);
      setWordbook(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : null);
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("단어장 다운로드에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!wordbook) {
    return <div>단어장 정보를 불러올 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-900 truncate max-w-xs">{wordbook.name}</h1>
          <Button variant="ghost" size="sm">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Wordbook Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-orange-100 text-orange-600">{wordbook.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{wordbook.name}</h2>
                <p className="text-sm text-gray-600">by {wordbook.author.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{wordbook.category}</Badge>
                </div>
              </div>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed mb-4">{wordbook.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {/* ... 기존 Stats UI ... */}
              <div className="text-center">
                <div className="font-bold text-gray-900">{wordbook.wordCount}</div>
                <div className="text-xs text-gray-600">단어</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{wordbook.likes}</div>
                <div className="text-xs text-gray-600">좋아요</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{wordbook.downloads}</div>
                <div className="text-xs text-gray-600">다운로드</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                className={`flex-1 ${isDownloaded ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"}`}
                disabled={isDownloaded}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloaded ? "다운로드 완료" : "내 단어장에 추가"}
              </Button>
              <Button
                variant="outline"
                onClick={handleLike}
                className={`${isLiked ? "bg-red-50 border-red-200 text-red-600" : ""}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sample Words Preview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">미리보기 (상위 5개)</h3>
            <div className="space-y-3">
              {(wordbook.words || []).slice(0, 5).map((word, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="font-semibold text-gray-900">{word.word}</div>
                  <div className="text-sm text-gray-600 mt-1">{word.meaning}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}