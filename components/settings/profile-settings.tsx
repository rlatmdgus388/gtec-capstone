"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Camera, Save } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ProfileSettingsProps {
  onBack: () => void
}

export function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const { toast } = useToast()
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    avatar: "/placeholder.svg",
  })

  const [isEditing, setIsEditing] = useState(false)
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary hover:bg-primary/10"
          >
            {isEditing ? "취소" : "편집"}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Photo */}
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {profile.name[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-primary hover:bg-primary/90"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                이름
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 border-border focus:border-primary focus:ring-primary bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground"
              />
            </div>

            <div>
              <Label htmlFor="username" className="text-sm font-medium text-foreground">
                사용자명
              </Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile((prev) => ({ ...prev, username: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 border-border focus:border-primary focus:ring-primary bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="mt-1 border-border bg-muted text-muted-foreground"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                소개
              </Label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
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
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account Statistics */}
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
