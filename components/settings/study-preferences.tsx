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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-foreground hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground">학습 설정</h1>
          <div></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Audio Settings */}
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
                </div>
                <Switch
                  checked={preferences.autoPlayAudio}
                  onCheckedChange={(checked) => handlePreferenceChange("autoPlayAudio", checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">발음 기호 표시</Label>
                  <p className="text-xs text-muted-foreground">단어와 함께 발음 기호 표시</p>
                </div>
                <Switch
                  checked={preferences.showPronunciation}
                  onCheckedChange={(checked) => handlePreferenceChange("showPronunciation", checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block text-foreground">음성 재생 속도</Label>
                <div className="px-3">
                  <Slider
                    value={[preferences.audioSpeed]}
                    onValueChange={(value) => handlePreferenceChange("audioSpeed", value[0])}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
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
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">학습 목표</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block text-foreground">
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
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5개</span>
                    <span>50개</span>
                    <span>100개</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">학습 알림</Label>
                  <p className="text-xs text-muted-foreground">매일 정해진 시간에 학습 알림</p>
                </div>
                <Switch
                  checked={preferences.studyReminder}
                  onCheckedChange={(checked) => handlePreferenceChange("studyReminder", checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {preferences.studyReminder && (
                <div>
                  <Label className="text-sm font-medium mb-2 block text-foreground">알림 시간</Label>
                  <input
                    type="time"
                    value={preferences.reminderTime}
                    onChange={(e) => handlePreferenceChange("reminderTime", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Study Behavior */}
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
                </div>
                <Switch
                  checked={preferences.shuffleCards}
                  onCheckedChange={(checked) => handlePreferenceChange("shuffleCards", checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">자동 넘기기</Label>
                  <p className="text-xs text-muted-foreground">일정 시간 후 자동으로 다음 카드</p>
                </div>
                <Switch
                  checked={preferences.autoAdvance}
                  onCheckedChange={(checked) => handlePreferenceChange("autoAdvance", checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">힌트 표시</Label>
                  <p className="text-xs text-muted-foreground">어려운 단어에 힌트 제공</p>
                </div>
                <Switch
                  checked={preferences.showHints}
                  onCheckedChange={(checked) => handlePreferenceChange("showHints", checked)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block text-foreground">
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
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
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
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">설정 저장</Button>
      </div>
    </div>
  )
}
