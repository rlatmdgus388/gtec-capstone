// components/auth/AuthManager.tsx
"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { EmailLoginForm } from "@/components/auth/email-login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { EmailVerificationScreen } from "@/components/auth/email-verification-screen"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { HomeScreen } from "@/components/home/home-screen"
import { VocabularyScreen } from "@/components/vocabulary/vocabulary-screen"
import { StudyScreen } from "@/components/study/study-screen"
import { CommunityScreen } from "@/components/community/community-screen"
import { SettingsScreen } from "@/components/settings/settings-screen"
import { WordbookDetail } from "@/components/vocabulary/wordbook-detail"
import { CreateWordbookScreen } from "@/components/vocabulary/create-wordbook-screen"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { fetchWithAuth } from "@/lib/api"

export default function AuthManager() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const [authScreen, setAuthScreen] = useState<"main" | "email-login" | "signup">("main")
  const [activeTab, setActiveTab] = useState("home")
  const [selectedWordbookForStudy, setSelectedWordbookForStudy] = useState<any>(null)

  const [selectedWordbookForDetail, setSelectedWordbookForDetail] = useState<any>(null)
  const [vocabularyRefreshKey, setVocabularyRefreshKey] = useState(0)
  const [isCreatingWordbook, setIsCreatingWordbook] = useState(false)

  const [communityRefreshKey, setCommunityRefreshKey] = useState(0)
  const [studyRefreshKey, setStudyRefreshKey] = useState(0)
  const [homeRefreshKey, setHomeRefreshKey] = useState(0)
  const [settingsRefreshKey, setSettingsRefreshKey] = useState(0) // [!!!] 설정 탭 refreshKey 추가

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const isAuthenticated = !!user
  const isGoogleUser = user?.providerData.some((provider) => provider.providerId === "google.com") ?? false
  const isEmailVerified = user?.emailVerified || isGoogleUser

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    switch (authScreen) {
      case "email-login":
        return <EmailLoginForm onBackToMain={() => setAuthScreen("main")} onLoginSuccess={() => setAuthScreen("main")} />
      case "signup":
        return <SignupForm onBackToLogin={() => setAuthScreen("main")} onSignupSuccess={() => setAuthScreen("main")} />
      default:
        return <LoginForm onShowEmailLogin={() => setAuthScreen("email-login")} onShowSignup={() => setAuthScreen("signup")} />
    }
  }

  if (!isEmailVerified) {
    return <EmailVerificationScreen onLogout={() => auth.signOut()} />
  }

  const handleLogout = () => {
    auth.signOut()
  }

  const handleWordbookSelect = (wordbook: any) => {
    setSelectedWordbookForDetail(wordbook)
  }

  const handleBackToVocabularyList = () => {
    setSelectedWordbookForDetail(null)
    setVocabularyRefreshKey((prev) => prev + 1)
  }

  const handleWordbookUpdate = async () => {
    setVocabularyRefreshKey((prev) => prev + 1)
    if (selectedWordbookForDetail) {
      try {
        const updatedWordbook = await fetchWithAuth(`/api/wordbooks/${selectedWordbookForDetail.id}`)
        setSelectedWordbookForDetail(updatedWordbook)
      } catch (error) {
        console.error("단어장 상세 정보 갱신 실패:", error)
        handleBackToVocabularyList()
      }
    }
  }

  const handleCreateWordbook = async (newWordbookData: { name: string; description: string; category: string }) => {
    try {
      await fetchWithAuth("/api/wordbooks", { method: "POST", body: JSON.stringify(newWordbookData) })
      alert("새로운 단어장이 생성되었습니다.")
      setIsCreatingWordbook(false)
      setVocabularyRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("단어장 생성 실패:", error)
      alert("단어장 생성에 실패했습니다.")
    }
  }

  const handleStartStudyWithWordbook = (wordbook: any) => {
    setSelectedWordbookForStudy(wordbook)
    setActiveTab("study")
  }


  const handleTabChange = (tab: string) => {
    // 단어장 탭에서 상세 화면 보고 있을 때 다시 단어장 탭 누르면 목록으로
    if (tab === "vocabulary" && activeTab === "vocabulary" && (selectedWordbookForDetail || isCreatingWordbook)) {
      setSelectedWordbookForDetail(null)
      setIsCreatingWordbook(false)
      setVocabularyRefreshKey((prev) => prev + 1) // 목록 새로고침
      return
    }

    // 커뮤니티 탭을 다시 눌렀을 때 메인으로
    if (tab === "community" && activeTab === "community") {
      setCommunityRefreshKey((prev) => prev + 1)
      setSelectedWordbookForDetail(null) // (다른 탭에서 왔을 때처럼)
      setIsCreatingWordbook(false)
      return
    }

    // 학습 탭을 다시 눌렀을 때 메인으로 (결과 화면 등에서 복귀)
    if (tab === "study" && activeTab === "study") {
      setStudyRefreshKey((prev) => prev + 1)
      setSelectedWordbookForDetail(null)
      setIsCreatingWordbook(false)
      return
    }


    if (tab === "home" && activeTab === "home") {
      setHomeRefreshKey((prev) => prev + 1);
      setSelectedWordbookForDetail(null)
      setIsCreatingWordbook(false)
      return;
    }

    // [!!!] 설정 탭을 다시 눌렀을 때 메인으로 (하위 메뉴에서 복귀)
    if (tab === "settings" && activeTab === "settings") {
      setSettingsRefreshKey((prev) => prev + 1); // 설정 탭 key 업데이트
      setSelectedWordbookForDetail(null)
      setIsCreatingWordbook(false)
      return;
    }

    if (tab !== "vocabulary") {
      setSelectedWordbookForDetail(null)
    }

    // 다른 탭으로 이동 시 모든 refreshKey를 리셋할 필요는 없지만,
    // (탭 이동 시 컴포넌트가 unmount/mount 되므로)
    // vocabulary 관련 상태는 초기화
    setIsCreatingWordbook(false)
    setActiveTab(tab)
  }

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            key={homeRefreshKey}
            onWordbookSelect={(wordbook) => {
              handleWordbookSelect(wordbook)
              setActiveTab("vocabulary")
            }}
            activeTab={activeTab}
          />
        )

      case "vocabulary":
        if (isCreatingWordbook) {
          return <CreateWordbookScreen onBack={() => setIsCreatingWordbook(false)} onSave={handleCreateWordbook} />
        }
        if (selectedWordbookForDetail) {
          return (
            <WordbookDetail
              wordbook={selectedWordbookForDetail}
              onBack={handleBackToVocabularyList}
              onUpdate={handleWordbookUpdate}
            />
          )
        }
        return (
          <VocabularyScreen
            onWordbookSelect={handleWordbookSelect}
            onStartCreate={() => setIsCreatingWordbook(true)}
            refreshKey={vocabularyRefreshKey}
            onNavigateToStudy={handleStartStudyWithWordbook}
          />
        )

      case "study":
        return <StudyScreen selectedWordbookId={selectedWordbookForStudy?.id ?? null} refreshKey={studyRefreshKey} />

      case "community":
        return <CommunityScreen refreshKey={communityRefreshKey} />

      case "settings":
        // [!!!] SettingsScreen에 key={settingsRefreshKey} 추가
        return <SettingsScreen key={settingsRefreshKey} onLogout={handleLogout} />
      default:
        return (
          <HomeScreen
            key={homeRefreshKey}
            onWordbookSelect={(wordbook) => {
              handleWordbookSelect(wordbook)
              setActiveTab("vocabulary")
            }}
            activeTab={activeTab}
          />
        )
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col max-w-md mx-auto">
      <main className="flex-1 overflow-hidden">{renderScreen()}</main>
      {!(activeTab === "vocabulary" && isCreatingWordbook) && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  )
}

// 이거