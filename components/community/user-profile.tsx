"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, UserPlus, MessageCircle, Heart, Check } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWithAuth } from "@/lib/api" // [추가] fetchWithAuth 사용
import { cn } from "@/lib/utils" // [추가] cn 유틸리티 사용

// --- 인터페이스 정의 ---
interface UserProfileData {
  uid: string;
  name: string;
  email?: string;
  photoURL?: string;
  bio: string;
  followers: number;
  following: number;
  sharedWordbooks: any[];
  discussions: any[];
}

interface UserProfileProps {
  userId: string
  onBack: () => void
}

export function UserProfile({ userId, onBack }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        // [수정] fetch -> fetchWithAuth 사용, API 경로 수정 (/api/user/...)
        const data = await fetchWithAuth(`/api/user/${userId}/profile`);
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);


  const handleFollow = () => {
    // TODO: 팔로우/언팔로우 API 연동
    setIsFollowing(!isFollowing)
  }

  // [수정] 로딩 스켈레톤 레이아웃 조정
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-background p-4 space-y-6">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-4 text-center text-muted-foreground">사용자 정보를 찾을 수 없습니다.</div>
  }

  return (
    // [수정 1] 'min-h-screen' 제거, 'flex flex-col' 및 배경색 수정
    <div className={cn("flex flex-col bg-background", "page-transition-enter-from-left")}>

      {/* [수정 2] 'header' 태그로 변경, 'sticky' 속성 추가 */}
      <header className="sticky top-0 z-40 w-full bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground">프로필</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* [수정 3] 콘텐츠 영역: 하단 여백 확보 (pb) */}
      <div className="flex-1 p-4 space-y-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">

        {/* Profile Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-6 flex flex-col items-center">
            <Avatar className="w-20 h-20 mb-3">
              <AvatarImage src={profile.photoURL} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.name[0]}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
            <p className="text-sm text-muted-foreground mb-3">@{profile.email?.split('@')[0]}</p>
            <p className="text-center text-sm text-foreground mb-4">{profile.bio || "소개가 없습니다."}</p>

            <div className="flex gap-3 mb-4">
              <Button
                onClick={handleFollow}
                className={cn(
                  "w-28",
                  isFollowing
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isFollowing ? <><Check className="h-4 w-4 mr-1" /> 팔로잉</> : <><UserPlus className="h-4 w-4 mr-1" /> 팔로우</>}
              </Button>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <div className="font-bold text-lg text-foreground">{profile.followers}</div>
                <div className="text-xs text-muted-foreground">팔로워</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-foreground">{profile.following}</div>
                <div className="text-xs text-muted-foreground">팔로잉</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-foreground">{profile.sharedWordbooks.length}</div>
                <div className="text-xs text-muted-foreground">공유 단어장</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shared Wordbooks Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-foreground">공유 단어장 ({profile.sharedWordbooks.length})</h3>
          <div className="space-y-3">
            {profile.sharedWordbooks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">공유한 단어장이 없습니다.</p>
            ) : (
              profile.sharedWordbooks.map((wordbook: any) => (
                <Card key={wordbook.id} className="cursor-pointer hover:shadow-sm bg-card border-border">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-card-foreground">{wordbook.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{wordbook.wordCount}개 단어</span>
                      <span className="flex items-center gap-1"><Heart size={14} /> {wordbook.likes}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Discussions Section */}
        <div className="pt-2">
          <h3 className="text-lg font-semibold mb-3 text-foreground">작성한 게시글 ({profile.discussions.length})</h3>
          <div className="space-y-3">
            {profile.discussions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">작성한 게시글이 없습니다.</p>
            ) : (
              profile.discussions.map((post: any) => (
                <Card key={post.id} className="cursor-pointer hover:shadow-sm bg-card border-border">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-card-foreground truncate">{post.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Heart size={14} /> {post.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={14} /> {post.replies}</span>
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