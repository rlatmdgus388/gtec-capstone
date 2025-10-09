"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Camera, Save } from "lucide-react"

interface ProfileSettingsProps {
  onBack: () => void
}

export function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const [profile, setProfile] = useState({
    name: "김영희",
    email: "younghee@example.com",
    username: "younghee_kim",
    bio: "영어 학습을 열심히 하고 있는 대학생입니다!",
    avatar: "/placeholder.svg",
  })

  const [isEditing, setIsEditing] = useState(false)

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-[#FF7A00] hover:bg-[#FF7A00]/10"
          >
            {isEditing ? "취소" : "편집"}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Photo */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-[#FF7A00]/10 text-[#FF7A00] text-2xl">{profile.name[0]}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-[#FF7A00] hover:bg-[#FF7A00]/90"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-black">{profile.name}</h3>
                <p className="text-sm text-gray-600">@{profile.username}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-black">
                이름
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
              />
            </div>

            <div>
              <Label htmlFor="username" className="text-sm font-medium text-black">
                사용자명
              </Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile((prev) => ({ ...prev, username: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-black">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className="mt-1 border-gray-200 focus:border-[#FF7A00] focus:ring-[#FF7A00]"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-medium text-black">
                소개
              </Label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
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
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account Statistics */}
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
