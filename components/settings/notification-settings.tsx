"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Bell, Clock } from "lucide-react"

interface NotificationSettingsProps {
  onBack: () => void
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    studyReminder: true,
    weeklyReport: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">알림 설정</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <Card className="border border-border bg-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3 flex-1">
                <Clock size={18} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-card-foreground">학습 알림</p>
                  <p className="text-sm text-muted-foreground">매일 학습 시간을 알려드려요</p>
                </div>
              </div>
              <Switch
                checked={settings.studyReminder}
                onCheckedChange={() => handleToggle("studyReminder")}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
