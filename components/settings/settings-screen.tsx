"use client"
import {
  Bell,
  Download,
  Shield,
  ChevronRight,
  BookOpen,
  User,
  Database,
  MessageCircle,
  LogOut,
  Upload,
  Settings,
} from "lucide-react"
import { useState } from "react"
import { ProfileSettings } from "./profile-settings"
import { StudyPreferences } from "./study-preferences"
import { NotificationSettings } from "./notification-settings"

interface SettingsScreenProps {
  onLogout?: () => void
}

export function SettingsScreen({ onLogout }: SettingsScreenProps) {
  const [currentView, setCurrentView] = useState<"main" | "profile" | "study" | "notifications">("main")

  const handleViewProfile = () => setCurrentView("profile")
  const handleViewStudy = () => setCurrentView("study")
  const handleViewNotifications = () => setCurrentView("notifications")
  const handleBackToMain = () => setCurrentView("main")

  const handleCSVImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log("Importing CSV file:", file.name)
        // TODO: Implement CSV import logic
        alert("CSV 파일을 가져오는 기능이 곧 추가됩니다.")
      }
    }
    input.click()
  }

  const handleCSVExport = () => {
    console.log("Exporting words to CSV")
    // TODO: Implement CSV export logic
    alert("CSV 파일로 내보내는 기능이 곧 추가됩니다.")
  }

  const handleContact = () => {
    // TODO: Navigate to contact page
    alert("문의하기 페이지로 이동합니다.")
  }

  const handlePrivacyPolicy = () => {
    // TODO: Navigate to privacy policy page
    alert("개인정보 방침 페이지로 이동합니다.")
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  if (currentView === "profile") {
    return <ProfileSettings onBack={handleBackToMain} />
  }

  if (currentView === "study") {
    return <StudyPreferences onBack={handleBackToMain} />
  }

  if (currentView === "notifications") {
    return <NotificationSettings onBack={handleBackToMain} />
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-xl flex items-center justify-center">
              <Settings size={24} className="text-[#FF7A00]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">설정</h1>
              <p className="text-sm text-gray-600">앱 설정을 관리하세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-2">
        <button
          onClick={handleViewProfile}
          className="flex items-center justify-between p-5 w-full text-left hover:bg-gray-50 transition-colors rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center gap-4">
            <User size={24} className="text-gray-700" />
            <span className="font-semibold text-black text-lg">프로필</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button
          onClick={handleViewNotifications}
          className="flex items-center justify-between p-5 w-full text-left hover:bg-gray-50 transition-colors rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center gap-4">
            <Bell size={24} className="text-gray-700" />
            <span className="font-semibold text-black text-lg">알림</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button
          onClick={handleViewStudy}
          className="flex items-center justify-between p-5 w-full text-left hover:bg-gray-50 transition-colors rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center gap-4">
            <BookOpen size={24} className="text-gray-700" />
            <span className="font-semibold text-black text-lg">학습</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button className="flex items-center justify-between p-5 w-full text-left hover:bg-gray-50 transition-colors rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <Database size={24} className="text-gray-700" />
            <span className="font-semibold text-black text-lg">단어 관리</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button
          onClick={handleCSVImport}
          className="flex items-center justify-between p-5 w-full text-left hover:bg-gray-50 transition-colors rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center gap-4">
            <Upload size={24} className="text-gray-700" />
            <span className="font-semibold text-black text-lg">CSV 파일로 단어 불러오기</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button
          onClick={handleCSVExport}
          className="flex items-center justify-between p-5 w-full text-left hover:bg-gray-50 transition-colors rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center gap-4">
            <Download size={24} className="text-gray-700" />
            <span className="font-semibold text-black text-lg">CSV 파일로 단어 내보내기</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button
          onClick={handleContact}
          className="flex items-center justify-between p-5 w-full text-left hover:bg-gray-50 transition-colors rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center gap-4">
            <MessageCircle size={24} className="text-gray-700" />
            <span className="font-semibold text-black text-lg">문의하기</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button
          onClick={handlePrivacyPolicy}
          className="flex items-center justify-between p-5 w-full text-left hover:bg-gray-50 transition-colors rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center gap-4">
            <Shield size={24} className="text-gray-700" />
            <span className="font-semibold text-black text-lg">개인정보 방침</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <div className="pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center justify-between p-5 w-full text-left hover:bg-red-50 transition-colors rounded-xl border border-gray-200 bg-white"
          >
            <div className="flex items-center gap-4">
              <LogOut size={24} className="text-red-600" />
              <span className="font-semibold text-red-600 text-lg">로그아웃</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
