// components/settings/settings-screen.tsx
"use client"
import { Bell, Download, ChevronRight, User, Upload, LogOut, Settings, Palette } from "lucide-react"
import { useState } from "react"
import { ProfileSettings } from "./profile-settings"
import { NotificationSettings } from "./notification-settings"
import { ThemeSettings } from "./theme-settings"
import { ExportScreen } from "./export-screen"
// [!!!] 1. ImportDialog 대신 ImportScreen을 임포트합니다.
import { ImportScreen } from "./import-screen"

interface SettingsScreenProps {
  onLogout?: () => void
  // [!!!] AuthManager로부터 key를 받을 수 있도록 prop 추가
  refreshKey?: number
}

export function SettingsScreen({ onLogout, refreshKey }: SettingsScreenProps) {
  // [!!!] 2. currentView 상태에 "import" 추가
  const [currentView, setCurrentView] = useState<"main" | "profile" | "notifications" | "theme" | "export" | "import">("main")

  const handleViewProfile = () => setCurrentView("profile")
  const handleViewNotifications = () => setCurrentView("notifications")
  const handleViewTheme = () => setCurrentView("theme")
  const handleViewExport = () => setCurrentView("export")
  const handleBackToMain = () => setCurrentView("main")

  // [!!!] 4. 불러오기 버튼 클릭 시 'import' 뷰로 변경
  const handleImportClick = () => {
    setCurrentView("import")
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

  if (currentView === "export") {
    return <ExportScreen onBack={handleBackToMain} />
  }

  // [!!!] 5. ImportScreen 렌더링 블록 추가
  if (currentView === "import") {
    return <ImportScreen onBack={handleBackToMain} />
  }

  return (
    // 1. 루트 레이아웃: 화면 전체 높이 및 Flex 구조 적용
    <div className="h-full flex flex-col bg-background">

      {/* 2. 상단 헤더: 고정(shrink-0) 및 스타일 통일 */}
      <div className="bg-card shrink-0">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            {/* 아이콘 박스: w-10 h-10으로 정사각형 비율 맞춤 */}
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Settings size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">설정</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 컨텐츠 영역: 남은 공간 차지 및 스크롤 적용 */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* 여백: 홈 화면과 동일하게 px-4 py-6 적용 */}
        <div className="px-4 py-6 space-y-3">

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

          {/* [!!!] '불러오기' 버튼 */}
          <button
            onClick={handleImportClick}
            className="flex items-center justify-between p-3 w-full text-left hover:bg-accent transition-colors rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-4">
              <Upload size={24} className="text-foreground" />
              <span className="font-semibold text-foreground text-base">CSV 파일로 단어 불러오기</span>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>

          {/* '내보내기' 버튼 */}
          <button
            onClick={handleViewExport}
            className="flex items-center justify-between p-3 w-full text-left hover:bg-accent transition-colors rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-4">
              <Download size={24} className="text-foreground" />
              <span className="font-semibold text-foreground text-base">CSV 파일로 단어 내보내기</span>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>

          {/* 로그아웃 버튼 */}
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
    </div>
  )
}