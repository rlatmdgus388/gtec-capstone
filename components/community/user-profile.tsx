"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, UserPlus, MessageCircle, Heart, BookOpen, Star, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// --- 인터페이스 정의 ---
interface UserProfileData {
  uid: string; name: string; email?: string; photoURL?: string; bio: string;
  followers: number; following: number;
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
        const response = await fetch(`/api/users/${userId}/profile`);
        if (!response.ok) throw new Error("Profile not found");
        const data = await response.json();
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

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return <div>사용자 정보를 찾을 수 없습니다.</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-900">프로필</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <Avatar className="w-20 h-20 mb-3">
              <AvatarImage src={profile.photoURL} />
              <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">
                {profile.name[0]}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-600 mb-3">@{profile.email?.split('@')[0]}</p>
            <p className="text-center text-sm text-gray-700 mb-4">{profile.bio || "소개가 없습니다."}</p>

            <div className="flex gap-3 mb-4">
              <Button onClick={handleFollow} className={`w-28 ${isFollowing ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-orange-500 hover:bg-orange-600"}`}>
                {isFollowing ? <><Check className="h-4 w-4 mr-1" /> 팔로잉</> : <><UserPlus className="h-4 w-4 mr-1" /> 팔로우</>}
              </Button>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{profile.followers}</div>
                <div className="text-xs text-gray-600">팔로워</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{profile.following}</div>
                <div className="text-xs text-gray-600">팔로잉</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{profile.sharedWordbooks.length}</div>
                <div className="text-xs text-gray-600">공유 단어장</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shared Wordbooks Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">공유 단어장 ({profile.sharedWordbooks.length})</h3>
          <div className="space-y-3">
            {profile.sharedWordbooks.map((wordbook: any) => (
              <Card key={wordbook.id} className="cursor-pointer hover:shadow-sm">
                <CardContent className="p-4">
                  <h4 className="font-medium text-black">{wordbook.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <span>{wordbook.wordCount}개 단어</span>
                    <span className="flex items-center gap-1"><Heart size={14} /> {wordbook.likes}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Discussions Section */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-3">작성한 게시글 ({profile.discussions.length})</h3>
          <div className="space-y-3">
            {profile.discussions.map((post: any) => (
              <Card key={post.id} className="cursor-pointer hover:shadow-sm">
                <CardContent className="p-4">
                  <h4 className="font-medium text-black truncate">{post.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">

                    <span className="flex items-center gap-1"><Heart size={14} /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={14} /> {post.replies}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
