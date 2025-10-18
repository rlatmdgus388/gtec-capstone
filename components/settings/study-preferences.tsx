"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Volume2, Target, Repeat } from "lucide-react"

interface StudyPreferencesProps {
  onBack: () => void
}

export function StudyPreferences({ onBack }: StudyPreferencesProps) {
  const [preferences, setPreferences] = useState({
    autoPlayAudio: true,
    showPronunciation: true,
    studyReminder: true,
    reminderTime: "20:00",
    dailyGoal: 20,
    reviewInterval: 3,
    autoAdvance: false,
    shuffleCards: true,
    showHints: true,
    audioSpeed: 1.0,
  })

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-black hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-black">학습 설정</h1>
=======
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-foreground hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground">학습 설정</h1>
>>>>>>> db7745a (다크모드, 프로필 설정)
          <div></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Audio Settings */}
<<<<<<< HEAD
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="h-5 w-5 text-[#FF7A00]" />
              <h3 className="font-semibold text-black">음성 설정</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-black">자동 음성 재생</Label>
                  <p className="text-xs text-gray-600">단어 표시 시 자동으로 발음 재생</p>
=======
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">음성 설정</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">자동 음성 재생</Label>
                  <p className="text-xs text-muted-foreground">단어 표시 시 자동으로 발음 재생</p>
>>>>>>> db7745a (다크모드, 프로필 설정)
                </div>
                <Switch
                  checked={preferences.autoPlayAudio}
                  onCheckedChange={(checked) => handlePreferenceChange("autoPlayAudio", checked)}
<<<<<<< HEAD
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-black">발음 기호 표시</Label>
                  <p className="text-xs text-gray-600">단어와 함께 발음 기호 표시</p>
=======
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">발음 기호 표시</Label>
                  <p className="text-xs text-muted-foreground">단어와 함께 발음 기호 표시</p>
>>>>>>> db7745a (다크모드, 프로필 설정)
                </div>
                <Switch
                  checked={preferences.showPronunciation}
                  onCheckedChange={(checked) => handlePreferenceChange("showPronunciation", checked)}
<<<<<<< HEAD
=======
                  className="data-[state=checked]:bg-primary"
>>>>>>> db7745a (다크모드, 프로필 설정)
                />
              </div>

              <div>
<<<<<<< HEAD
                <Label className="text-sm font-medium mb-2 block text-black">음성 재생 속도</Label>
=======
                <Label className="text-sm font-medium mb-2 block text-foreground">음성 재생 속도</Label>
>>>>>>> db7745a (다크모드, 프로필 설정)
                <div className="px-3">
                  <Slider
                    value={[preferences.audioSpeed]}
                    onValueChange={(value) => handlePreferenceChange("audioSpeed", value[0])}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
<<<<<<< HEAD
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
=======
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
>>>>>>> db7745a (다크모드, 프로필 설정)
                    <span>0.5x</span>
                    <span>{preferences.audioSpeed}x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Goals */}
<<<<<<< HEAD
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-5 w-5 text-[#FF7A00]" />
              <h3 className="font-semibold text-black">학습 목표</h3>
=======
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">학습 목표</h3>
>>>>>>> db7745a (다크모드, 프로필 설정)
            </div>

            <div className="space-y-4">
              <div>
<<<<<<< HEAD
                <Label className="text-sm font-medium mb-2 block text-black">
=======
                <Label className="text-sm font-medium mb-2 block text-foreground">
>>>>>>> db7745a (다크모드, 프로필 설정)
                  일일 학습 목표: {preferences.dailyGoal}개 단어
                </Label>
                <div className="px-3">
                  <Slider
                    value={[preferences.dailyGoal]}
                    onValueChange={(value) => handlePreferenceChange("dailyGoal", value[0])}
                    max={100}
                    min={5}
                    step={5}
                    className="w-full"
                  />
<<<<<<< HEAD
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
=======
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
>>>>>>> db7745a (다크모드, 프로필 설정)
                    <span>5개</span>
                    <span>50개</span>
                    <span>100개</span>
                  </div>
                </div>
              </div>

<<<<<<< HEAD
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-black">학습 알림</Label>
                  <p className="text-xs text-gray-600">매일 정해진 시간에 학습 알림</p>
=======
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">학습 알림</Label>
                  <p className="text-xs text-muted-foreground">매일 정해진 시간에 학습 알림</p>
>>>>>>> db7745a (다크모드, 프로필 설정)
                </div>
                <Switch
                  checked={preferences.studyReminder}
                  onCheckedChange={(checked) => handlePreferenceChange("studyReminder", checked)}
<<<<<<< HEAD
=======
                  className="data-[state=checked]:bg-primary"
>>>>>>> db7745a (다크모드, 프로필 설정)
                />
              </div>

              {preferences.studyReminder && (
                <div>
<<<<<<< HEAD
                  <Label className="text-sm font-medium mb-2 block text-black">알림 시간</Label>
=======
                  <Label className="text-sm font-medium mb-2 block text-foreground">알림 시간</Label>
>>>>>>> db7745a (다크모드, 프로필 설정)
                  <input
                    type="time"
                    value={preferences.reminderTime}
                    onChange={(e) => handlePreferenceChange("reminderTime", e.target.value)}
<<<<<<< HEAD
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
=======
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
>>>>>>> db7745a (다크모드, 프로필 설정)
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Study Behavior */}
<<<<<<< HEAD
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Repeat className="h-5 w-5 text-[#FF7A00]" />
              <h3 className="font-semibold text-black">학습 방식</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-black">카드 섞기</Label>
                  <p className="text-xs text-gray-600">학습 시 단어 순서를 무작위로 섞기</p>
=======
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Repeat className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">학습 방식</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">카드 섞기</Label>
                  <p className="text-xs text-muted-foreground">학습 시 단어 순서를 무작위로 섞기</p>
>>>>>>> db7745a (다크모드, 프로필 설정)
                </div>
                <Switch
                  checked={preferences.shuffleCards}
                  onCheckedChange={(checked) => handlePreferenceChange("shuffleCards", checked)}
<<<<<<< HEAD
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-black">자동 넘기기</Label>
                  <p className="text-xs text-gray-600">일정 시간 후 자동으로 다음 카드</p>
=======
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">자동 넘기기</Label>
                  <p className="text-xs text-muted-foreground">일정 시간 후 자동으로 다음 카드</p>
>>>>>>> db7745a (다크모드, 프로필 설정)
                </div>
                <Switch
                  checked={preferences.autoAdvance}
                  onCheckedChange={(checked) => handlePreferenceChange("autoAdvance", checked)}
<<<<<<< HEAD
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-black">힌트 표시</Label>
                  <p className="text-xs text-gray-600">어려운 단어에 힌트 제공</p>
=======
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">힌트 표시</Label>
                  <p className="text-xs text-muted-foreground">어려운 단어에 힌트 제공</p>
>>>>>>> db7745a (다크모드, 프로필 설정)
                </div>
                <Switch
                  checked={preferences.showHints}
                  onCheckedChange={(checked) => handlePreferenceChange("showHints", checked)}
<<<<<<< HEAD
=======
                  className="data-[state=checked]:bg-primary"
>>>>>>> db7745a (다크모드, 프로필 설정)
                />
              </div>

              <div>
<<<<<<< HEAD
                <Label className="text-sm font-medium mb-2 block text-black">
=======
                <Label className="text-sm font-medium mb-2 block text-foreground">
>>>>>>> db7745a (다크모드, 프로필 설정)
                  복습 주기: {preferences.reviewInterval}일
                </Label>
                <div className="px-3">
                  <Slider
                    value={[preferences.reviewInterval]}
                    onValueChange={(value) => handlePreferenceChange("reviewInterval", value[0])}
                    max={14}
                    min={1}
                    step={1}
                    className="w-full"
                  />
<<<<<<< HEAD
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
=======
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
>>>>>>> db7745a (다크모드, 프로필 설정)
                    <span>1일</span>
                    <span>7일</span>
                    <span>14일</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
<<<<<<< HEAD
        <Button className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white">설정 저장</Button>
=======
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">설정 저장</Button>
>>>>>>> db7745a (다크모드, 프로필 설정)
      </div>
    </div>
  )
}
