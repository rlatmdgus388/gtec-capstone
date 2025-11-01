"use client"
import { Bell, Download, ChevronRight, User, Upload, LogOut, Settings, Palette } from "lucide-react"
import { useState } from "react"
import { ProfileSettings } from "./profile-settings"
import { NotificationSettings } from "./notification-settings"
import { ThemeSettings } from "./theme-settings"

interface SettingsScreenProps {
  onLogout?: () => void
}

export function SettingsScreen({ onLogout }: SettingsScreenProps) {
  const [currentView, setCurrentView] = useState<"main" | "profile" | "notifications" | "theme">("main")

  const handleViewProfile = () => setCurrentView("profile")
  const handleViewNotifications = () => setCurrentView("notifications")
  const handleViewTheme = () => setCurrentView("theme")
  const handleBackToMain = () => setCurrentView("main")

  const handleCSVImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log("Importing CSV file:", file.name)
        alert("CSV 파일을 가져오는 기능이 곧 추가됩니다.")
      }
    }
    input.click()
  }

  const handleCSVExport = () => {
    console.log("Exporting words to CSV")
    alert("CSV 파일로 내보내는 기능이 곧 추가됩니다.")
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  if (currentView === "profile") {
    return <ProfileSettings onBack={handleBackToMain} />
  }

  if (currentView === "notifications") {
    return <NotificationSettings onBack={handleBackToMain} />
  }

  if (currentView === "theme") {
    return <ThemeSettings onBack={handleBackToMain} />
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-background">
      <div className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Settings size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">설정</h1>
              <p className="text-sm text-muted-foreground">앱 설정을 관리하세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-1.5">
        <button
          onClick={handleViewProfile}
          className="flex items-center justify-between p-3 w-full text-left hover:bg-accent transition-colors rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-4">
            <User size={24} className="text-foreground" />
            <span className="font-semibold text-foreground text-base">프로필</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        <button
          onClick={handleViewTheme}
          className="flex items-center justify-between p-3 w-full text-left hover:bg-accent transition-colors rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-4">
            <Palette size={24} className="text-foreground" />
            <span className="font-semibold text-foreground text-base">테마</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        <button
          onClick={handleViewNotifications}
          className="flex items-center justify-between p-3 w-full text-left hover:bg-accent transition-colors rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-4">
            <Bell size={24} className="text-foreground" />
            <span className="font-semibold text-foreground text-base">알림</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        <button
          onClick={handleCSVImport}
          className="flex items-center justify-between p-3 w-full text-left hover:bg-accent transition-colors rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-4">
            <Upload size={24} className="text-foreground" />
            <span className="font-semibold text-foreground text-base">CSV 파일로 단어 불러오기</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        <button
          onClick={handleCSVExport}
          className="flex items-center justify-between p-3 w-full text-left hover:bg-accent transition-colors rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-4">
            <Download size={24} className="text-foreground" />
            <span className="font-semibold text-foreground text-base">CSV 파일로 단어 내보내기</span>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        <div className="pt-4 mt-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center justify-between p-3 w-full text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-4">
              <LogOut size={24} className="text-red-600" />
              <span className="font-semibold text-red-600 text-base">로그아웃</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
