"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Bell, Clock, Trophy, BookOpen } from "lucide-react"

interface NotificationSettingsProps {
  onBack: () => void
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    studyReminder: true,
    dailyGoal: true,
    achievements: false,
    newWords: true,
    weeklyReport: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft size={18} className="text-gray-600" />
          </Button>
          <h1 className="text-xl font-bold text-black">알림 설정</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <Card className="border border-gray-200 bg-white rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
              <Bell size={20} className="text-[#FF7A00]" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-gray-600" />
                <div>
                  <p className="font-medium text-black">학습 알림</p>
                  <p className="text-sm text-gray-600">매일 학습 시간을 알려드려요</p>
                </div>
              </div>
              <Switch checked={settings.studyReminder} onCheckedChange={() => handleToggle("studyReminder")} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Trophy size={18} className="text-gray-600" />
                <div>
                  <p className="font-medium text-black">목표 달성</p>
                  <p className="text-sm text-gray-600">일일 목표 달성 시 알림</p>
                </div>
              </div>
              <Switch checked={settings.dailyGoal} onCheckedChange={() => handleToggle("dailyGoal")} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-gray-600" />
                <div>
                  <p className="font-medium text-black">새 단어 추가</p>
                  <p className="text-sm text-gray-600">새로운 단어가 추가될 때 알림</p>
                </div>
              </div>
              <Switch checked={settings.newWords} onCheckedChange={() => handleToggle("newWords")} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
