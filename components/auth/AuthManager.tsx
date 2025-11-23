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
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User, getRedirectResult } from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
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
  const [settingsRefreshKey, setSettingsRefreshKey] = useState(0)

  const [debugLog, setDebugLog] = useState<string[]>([])

  const addLog = (msg: string) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      addLog(`AuthStateChanged: ${currentUser ? currentUser.email : 'null'}`)
      setUser(currentUser)
      setIsLoading(false)
    })

    // [Redirect 처리] 앱 로드 시 리다이렉트 결과 확인 (AuthManager에서 처리)
    addLog(`Hostname: ${window.location.hostname}`)
    addLog(`AuthDomain: ${auth.app.options.authDomain}`)
    addLog("getRedirectResult 호출 시작")
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        addLog(`리다이렉트 성공: ${result.user.email}`)
        // Firestore 유저 생성 로직
        const userDocRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: result.user.email,
            name: result.user.displayName || result.user.email?.split("@")[0],
            createdAt: serverTimestamp(),
          });
        }
      } else {
        addLog("리다이렉트 결과 없음 (null)")
      }
    }).catch((error) => {
      addLog(`리다이렉트 에러: ${error.message}`)
      console.error("리다이렉트 확인 에러:", error);
    });

    return () => unsubscribe()
  }, [])

  const isAuthenticated = !!user
  const isGoogleUser = user?.providerData.some((provider) => provider.providerId === "google.com") ?? false
  const isEmailVerified = user?.emailVerified || isGoogleUser

  // 디버그용 오버레이 렌더링
  const renderDebugOverlay = () => (
    <div className="fixed top-0 left-0 w-full bg-black/80 text-white p-2 text-xs z-50 max-h-40 overflow-y-auto pointer-events-none">
      <p>User: {user ? user.email : 'null'}</p>
      <p>Loading: {isLoading ? 'true' : 'false'}</p>
      {debugLog.map((log, i) => <p key={i}>{log}</p>)}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p>로딩 중...</p>
        {renderDebugOverlay()}
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        {renderDebugOverlay()}
        {(() => {
          switch (authScreen) {
            case "email-login":
              return <EmailLoginForm onBackToMain={() => setAuthScreen("main")} onLoginSuccess={() => setAuthScreen("main")} />
            case "signup":
              return <SignupForm onBackToLogin={() => setAuthScreen("main")} onSignupSuccess={() => setAuthScreen("main")} />
            default:
              return <LoginForm onShowEmailLogin={() => setAuthScreen("email-login")} onShowSignup={() => setAuthScreen("signup")} />
          }
        })()}
      </>
    )
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
    if (tab === "vocabulary" && activeTab === "vocabulary" && (selectedWordbookForDetail || isCreatingWordbook)) {
      setSelectedWordbookForDetail(null)
      setIsCreatingWordbook(false)
      setVocabularyRefreshKey((prev) => prev + 1)
      return
    }

    if (tab === "community" && activeTab === "community") {
      setCommunityRefreshKey((prev) => prev + 1)
      setSelectedWordbookForDetail(null)
      setIsCreatingWordbook(false)
      return
    }

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

    if (tab === "settings" && activeTab === "settings") {
      setSettingsRefreshKey((prev) => prev + 1);
      setSelectedWordbookForDetail(null)
      setIsCreatingWordbook(false)
      return;
    }

    if (tab !== "vocabulary") {
      setSelectedWordbookForDetail(null)
    }

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
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <main className="flex-1">
        {renderScreen()}
      </main>

      {!(activeTab === "vocabulary" && isCreatingWordbook) && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  )
}