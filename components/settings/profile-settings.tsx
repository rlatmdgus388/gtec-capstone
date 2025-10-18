"use client"

<<<<<<< HEAD
import { useState } from "react"
=======
import { useState, useEffect } from "react"
>>>>>>> db7745a (다크모드, 프로필 설정)
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Camera, Save } from "lucide-react"
<<<<<<< HEAD
=======
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
>>>>>>> db7745a (다크모드, 프로필 설정)

interface ProfileSettingsProps {
  onBack: () => void
}

export function ProfileSettings({ onBack }: ProfileSettingsProps) {
<<<<<<< HEAD
  const [profile, setProfile] = useState({
    name: "김영희",
    email: "younghee@example.com",
    username: "younghee_kim",
    bio: "영어 학습을 열심히 하고 있는 대학생입니다!",
=======
  const { toast } = useToast()
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
>>>>>>> db7745a (다크모드, 프로필 설정)
    avatar: "/placeholder.svg",
  })

  const [isEditing, setIsEditing] = useState(false)
<<<<<<< HEAD

  const handleSave = () => {
    setIsEditing(false)
    // Save profile logic here
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-black hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-black">프로필 설정</h1>
=======
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await fetchWithAuth("/api/user/profile")
        setProfile({
          name: data.name || "",
          email: data.email || "",
          username: data.username || "",
          bio: data.bio || "",
          avatar: data.photoURL || "/placeholder.svg",
        })
      } catch (error) {
        console.error("프로필 로딩 실패:", error)
        toast({
          title: "오류",
          description: "프로필을 불러올 수 없습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await fetchWithAuth("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name,
          username: profile.username,
          bio: profile.bio,
        }),
      })

      toast({
        title: "성공",
        description: "프로필이 업데이트되었습니다.",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("프로필 저장 실패:", error)
      toast({
        title: "오류",
        description: "프로필 저장에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-foreground hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground">프로필 설정</h1>
>>>>>>> db7745a (다크모드, 프로필 설정)
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
<<<<<<< HEAD
            className="text-[#FF7A00] hover:bg-[#FF7A00]/10"
=======
            className="text-primary hover:bg-primary/10"
>>>>>>> db7745a (다크모드, 프로필 설정)
          >
            {isEditing ? "취소" : "편집"}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Photo */}
<<<<<<< HEAD
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
=======
        <Card className="bg-card border border-border shadow-sm rounded-xl">
>>>>>>> db7745a (다크모드, 프로필 설정)
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
<<<<<<< HEAD
                  <AvatarFallback className="bg-[#FF7A00]/10 text-[#FF7A00] text-2xl">{profile.name[0]}</AvatarFallback>
=======
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {profile.name[0] || "U"}
                  </AvatarFallback>
>>>>>>> db7745a (다크모드, 프로필 설정)
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
<<<<<<< HEAD
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-[#FF7A00] hover:bg-[#FF7A00]/90"
=======
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-primary hover:bg-primary/90"
>>>>>>> db7745a (다크모드, 프로필 설정)
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="text-center">
<<<<<<< HEAD
                <h3 className="font-semibold text-black">{profile.name}</h3>
                <p className="text-sm text-gray-600">@{profile.username}</p>
=======
                <h3 className="font-semibold text-foreground">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
>>>>>>> db7745a (다크모드, 프로필 설정)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
<<<<<<< HEAD
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-black">
=======
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
>>>>>>> db7745a (다크모드, 프로필 설정)
                이름
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
<<<<<<< HEAD
                className="mt-1 border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
=======
                className="mt-1 border-border focus:border-primary focus:ring-primary bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground"
>>>>>>> db7745a (다크모드, 프로필 설정)
              />
            </div>

            <div>
<<<<<<< HEAD
              <Label htmlFor="username" className="text-sm font-medium text-black">
=======
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
>>>>>>> db7745a (다크모드, 프로필 설정)
                사용자명
              </Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile((prev) => ({ ...prev, username: e.target.value }))}
                disabled={!isEditing}
<<<<<<< HEAD
                className="mt-1 border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
=======
                className="mt-1 border-border focus:border-primary focus:ring-primary bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground"
>>>>>>> db7745a (다크모드, 프로필 설정)
              />
            </div>

            <div>
<<<<<<< HEAD
              <Label htmlFor="email" className="text-sm font-medium text-black">
=======
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
>>>>>>> db7745a (다크모드, 프로필 설정)
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
<<<<<<< HEAD
                onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
=======
                disabled
                className="mt-1 border-border bg-muted text-muted-foreground"
>>>>>>> db7745a (다크모드, 프로필 설정)
              />
            </div>

            <div>
<<<<<<< HEAD
              <Label htmlFor="bio" className="text-sm font-medium text-black">
=======
              <Label htmlFor="bio" className="text-sm font-medium text-foreground">
>>>>>>> db7745a (다크모드, 프로필 설정)
                소개
              </Label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
<<<<<<< HEAD
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00] disabled:bg-gray-50 disabled:text-gray-500"
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-gray-500 mt-1">{profile.bio.length}/150자</p>
            </div>

            {isEditing && (
              <Button onClick={handleSave} className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white">
                <Save className="h-4 w-4 mr-2" />
                저장하기
=======
                className="mt-1 w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted disabled:text-muted-foreground bg-background text-foreground"
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground mt-1">{profile.bio.length}/150자</p>
            </div>

            {isEditing && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "저장 중..." : "저장하기"}
>>>>>>> db7745a (다크모드, 프로필 설정)
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account Statistics */}
<<<<<<< HEAD
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-black mb-4">학습 통계</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-[#FF7A00]/10 rounded-lg">
                <div className="text-2xl font-bold text-[#FF7A00]">23</div>
                <div className="text-sm text-gray-600">연속 학습일</div>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-black">1,247</div>
                <div className="text-sm text-gray-600">총 학습 단어</div>
              </div>
              <div className="text-center p-3 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-black">15</div>
                <div className="text-sm text-gray-600">생성한 단어장</div>
              </div>
              <div className="text-center p-3 bg-[#FF7A00]/10 rounded-lg">
                <div className="text-2xl font-bold text-[#FF7A00]">89%</div>
                <div className="text-sm text-gray-600">평균 정답률</div>
=======
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">학습 통계</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">23</div>
                <div className="text-sm text-muted-foreground">연속 학습일</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">1,247</div>
                <div className="text-sm text-muted-foreground">총 학습 단어</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">15</div>
                <div className="text-sm text-muted-foreground">생성한 단어장</div>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">89%</div>
                <div className="text-sm text-muted-foreground">평균 정답률</div>
>>>>>>> db7745a (다크모드, 프로필 설정)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
