// components/settings/settings-screen.tsx
"use client"
import { Bell, Download, ChevronRight, User, Upload, LogOut, Settings, Palette } from "lucide-react"
import { useState } from "react"
import { ProfileSettings } from "./profile-settings"
import { NotificationSettings } from "./notification-settings"
import { ThemeSettings } from "./theme-settings"
import { ExportScreen } from "./export-screen"
// [!!!] 1. ImportDialog 대신 ImportScreen을 임포트합니다.
// (파일 경로는 실제 파일 위치에 맞게 조정하세요.)
import { ImportScreen } from "./import-screen"

interface SettingsScreenProps {
  onLogout?: () => void
  // [!!!] AuthManager로부터 key를 받을 수 있도록 prop 추가 (선택 사항이지만 권장)
  refreshKey?: number
}

export function SettingsScreen({ onLogout, refreshKey }: SettingsScreenProps) {
  // [!!!] 2. currentView 상태에 "import" 추가
  const [currentView, setCurrentView] = useState<"main" | "profile" | "notifications" | "theme" | "export" | "import">("main")

  // [!!!] 3. ImportDialog 관련 상태 제거
  // const [showImportDialog, setShowImportDialog] = useState(false) // 이 줄 삭제

  // [!!!] (선택 사항) AuthManager의 key 변경 시 메인 뷰로 리셋
  // useEffect(() => {
  //   setCurrentView("main")
  // }, [refreshKey])

  const handleViewProfile = () => setCurrentView("profile")
  const handleViewNotifications = () => setCurrentView("notifications")
  const handleViewTheme = () => setCurrentView("theme")
  const handleViewExport = () => setCurrentView("export")
  const handleBackToMain = () => setCurrentView("main")

  // [!!!] 4. 불러오기 버튼 클릭 시 'import' 뷰로 변경
  const handleImportClick = () => {
    setCurrentView("import")
    // setShowImportDialog(true) // 이 줄 삭제
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
    // ImportScreen이 components/settings/import-screen.tsx에 정의되어 있어야 합니다.
    return <ImportScreen onBack={handleBackToMain} />
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-background">
      {/* ... (헤더 부분은 기존과 동일) ... */}
      <div className="bg-card">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 bg-primary/10 rounded-xl flex items-center justify-center">
              <Settings size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">설정</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-1.5">
        {/* ... (프로필, 테마, 알림 버튼은 기존과 동일) ... */}
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

        {/* [!!!] '불러오기' 버튼 -> 전용 페이지로 이동 (핸들러 변경됨) */}
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

        {/* '내보내기' 버튼 -> 전용 페이지로 이동 */}
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

        {/* ... (로그아웃 버튼은 기존과 동일) ... */}
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

      {/* [!!!] 6. 다이얼로그 렌더링 부분 삭제 */}
      {/* <ImportDialog open={showImportDialog} onOpenChange={setShowImportDialog} /> */}
    </div>
  )
}