"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Bell, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

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
    // [수정 1] 'min-h-screen' 제거, 'flex flex-col' 추가
    <div className={cn("flex flex-col bg-background", "page-transition-enter")}>

      {/* [수정 2] 'header' 태그로 변경, 'sticky' 속성 추가 */}
      <header className="sticky top-0 z-40 w-full bg-background border-b">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={20} className="text-foreground" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">알림 설정</h1>
        </div>
      </header>

      {/* [수정 3] 'flex-1' 및 하단 여백(pb) 추가 */}
      <div className="flex-1 px-4 py-6 space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
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