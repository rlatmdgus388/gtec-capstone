"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Volume2,
  Target,
  Repeat,
  Save,
  Loader2
} from "lucide-react"
import { toast } from "sonner" // 프로젝트에 sonner가 없다면 일반 alert나 다른 toast로 대체 가능

interface StudyPreferencesProps {
  onBack: () => void
}

export function StudyPreferences({ onBack }: StudyPreferencesProps) {
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSave = async () => {
    setIsLoading(true)
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    toast.success("학습 설정이 저장되었습니다.")
    // 실제 연동 시 여기에 API 로직 추가
  }

  return (
    <div className="min-h-screen bg-muted/40 pb-10">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-20 px-4 h-14 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="-ml-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">학습 설정</h1>
        <div className="w-9" /> {/* 균형을 위한 빈 공간 */}
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Audio Settings */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">음성 및 재생</h2>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">자동 음성 재생</Label>
                  <p className="text-xs text-muted-foreground">단어 카드 전환 시 자동 재생</p>
                </div>
                <Switch
                  checked={preferences.autoPlayAudio}
                  onCheckedChange={(checked) => handlePreferenceChange("autoPlayAudio", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">발음 기호 표시</Label>
                  <p className="text-xs text-muted-foreground">단어와 함께 발음 기호 노출</p>
                </div>
                <Switch
                  checked={preferences.showPronunciation}
                  onCheckedChange={(checked) => handlePreferenceChange("showPronunciation", checked)}
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base">음성 재생 속도</Label>
                  <span className="text-sm font-medium text-primary">{preferences.audioSpeed}x</span>
                </div>
                <Slider
                  value={[preferences.audioSpeed]}
                  onValueChange={(value) => handlePreferenceChange("audioSpeed", value[0])}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>2.0x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Study Goals */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Target className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">목표 및 알림</h2>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base">일일 학습 목표</Label>
                  <span className="text-sm font-medium text-primary">{preferences.dailyGoal} 단어</span>
                </div>
                <Slider
                  value={[preferences.dailyGoal]}
                  onValueChange={(value) => handlePreferenceChange("dailyGoal", value[0])}
                  max={100}
                  min={5}
                  step={5}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>5개</span>
                  <span>100개</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">학습 알림 받기</Label>
                  <p className="text-xs text-muted-foreground">매일 정해진 시간에 알림 발송</p>
                </div>
                <Switch
                  checked={preferences.studyReminder}
                  onCheckedChange={(checked) => handlePreferenceChange("studyReminder", checked)}
                />
              </div>

              {preferences.studyReminder && (
                <div className="p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                  <Label className="text-base">알림 시간 설정</Label>
                  <Input
                    type="time"
                    value={preferences.reminderTime}
                    onChange={(e) => handlePreferenceChange("reminderTime", e.target.value)}
                    className="w-32 text-right"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Study Behavior */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Repeat className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">학습 방식</h2>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">카드 섞기</Label>
                  <p className="text-xs text-muted-foreground">학습 순서 무작위 섞기</p>
                </div>
                <Switch
                  checked={preferences.shuffleCards}
                  onCheckedChange={(checked) => handlePreferenceChange("shuffleCards", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">자동 넘기기</Label>
                  <p className="text-xs text-muted-foreground">정답 확인 후 자동 진행</p>
                </div>
                <Switch
                  checked={preferences.autoAdvance}
                  onCheckedChange={(checked) => handlePreferenceChange("autoAdvance", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">힌트 표시</Label>
                  <p className="text-xs text-muted-foreground">오답 시 힌트 버튼 활성화</p>
                </div>
                <Switch
                  checked={preferences.showHints}
                  onCheckedChange={(checked) => handlePreferenceChange("showHints", checked)}
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base">복습 주기</Label>
                  <span className="text-sm font-medium text-primary">{preferences.reviewInterval}일</span>
                </div>
                <Slider
                  value={[preferences.reviewInterval]}
                  onValueChange={(value) => handlePreferenceChange("reviewInterval", value[0])}
                  max={14}
                  min={1}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>매일</span>
                  <span>1주</span>
                  <span>2주</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            className="w-full h-12 text-base font-medium shadow-md"
            size="lg"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                설정 저장
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}