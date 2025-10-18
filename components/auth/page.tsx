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
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"

export default function HomePage() {
  const [authScreen, setAuthScreen] = useState<"main" | "email-login" | "signup">("main")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

  const [selectedWordbookForStudy, setSelectedWordbookForStudy] = useState<any>(null)
  const [selectedWordbookForDetail, setSelectedWordbookForDetail] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      console.log("----------[인증 상태 변경 감지]----------"); // 디버깅용 로그
      if (user) {
        console.log("✅ 로그인된 사용자 정보:", user); // 1. 전체 user 객체 확인
        console.log("🔍 사용자의 로그인 방식(providerData):", user.providerData); // 2. providerData 배열 확인

        setIsAuthenticated(true)
        
        const isGoogleUser = user.providerData.some(
          (provider) => provider.providerId === 'google.com'
        );
        
        console.log("🤔 구글 사용자인가?:", isGoogleUser); // 3. isGoogleUser 값 확인
        console.log("✉️ 이메일 인증 여부(Firebase):", user.emailVerified); // 4. Firebase의 emailVerified 값 확인

        setIsEmailVerified(user.emailVerified || isGoogleUser);
        console.log("➡️ 최종 인증 상태로 설정:", user.emailVerified || isGoogleUser); // 5. 최종 결과 확인

      } else {
        console.log("❌ 로그아웃 상태입니다.");
        setIsAuthenticated(false)
        setIsEmailVerified(false)
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setAuthScreen("main")
  }

  const handleSignupSuccess = () => {
    setAuthScreen("main")
  }

  const handleLogout = () => {
    auth.signOut();
  }

  const handleWordbookSelect = (wordbook: any) => {
    setSelectedWordbookForDetail(wordbook)
    setActiveTab("vocabulary")
  }

  const handleStartStudyWithWordbook = (wordbook: any) => {
    setSelectedWordbookForStudy(wordbook)
    setActiveTab("study")
  }

  const handleBackToVocabularyList = () => {
    setSelectedWordbookForDetail(null)
  }

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center"><p>로딩 중...</p></div>
  }

  if (!isAuthenticated) {
    switch (authScreen) {
      case "email-login":
        return <EmailLoginForm onBackToMain={() => setAuthScreen("main")} onLoginSuccess={handleLoginSuccess} />
      case "signup":
        return <SignupForm onBackToLogin={() => setAuthScreen("main")} onSignupSuccess={handleSignupSuccess} />
      default:
        return (
          <LoginForm
            onShowEmailLogin={() => setAuthScreen("email-login")}
            onShowSignup={() => setAuthScreen("signup")}
          />
        )
    }
  }

  // 이 로직 덕분에 구글 로그인 후 바로 홈 화면으로 진입합니다.
  if (!isEmailVerified) {
    return <EmailVerificationScreen onLogout={handleLogout} />
  }

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onWordbookSelect={handleWordbookSelect} />
      case "vocabulary":
        return (
          <VocabularyScreen
            onStartStudy={handleStartStudyWithWordbook}
            selectedWordbook={selectedWordbookForDetail}
            onBackToList={handleBackToVocabularyList}
          />
        )
      case "study":
        return <StudyScreen selectedWordbook={selectedWordbookForStudy} />
      case "community":
        return <CommunityScreen />
      case "settings":
        return <SettingsScreen onLogout={handleLogout} />
      default:
        return <HomeScreen onWordbookSelect={handleWordbookSelect} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
<<<<<<< HEAD


=======
>>>>>>> db7745a (다크모드, 프로필 설정)
