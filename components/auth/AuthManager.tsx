"use client";

import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { EmailLoginForm } from "@/components/auth/email-login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { EmailVerificationScreen } from "@/components/auth/email-verification-screen";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { HomeScreen } from "@/components/home/home-screen";
import { VocabularyScreen } from "@/components/vocabulary/vocabulary-screen";
import { StudyScreen } from "@/components/study/study-screen";
import { CommunityScreen } from "@/components/community/community-screen";
import { SettingsScreen } from "@/components/settings/settings-screen";
import { WordbookDetail } from "@/components/vocabulary/wordbook-detail"; // 1. 상세 페이지 컴포넌트 import
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function AuthManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [authScreen, setAuthScreen] = useState<"main" | "email-login" | "signup">("main");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedWordbookForStudy, setSelectedWordbookForStudy] = useState<any>(null);
  const [selectedWordbookForDetail, setSelectedWordbookForDetail] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAuthenticated = !!user;
  const isGoogleUser = user?.providerData.some(provider => provider.providerId === 'google.com') ?? false;
  const isEmailVerified = user?.emailVerified || isGoogleUser;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    switch (authScreen) {
      case "email-login":
        return <EmailLoginForm onBackToMain={() => setAuthScreen("main")} onLoginSuccess={() => setAuthScreen("main")} />;
      case "signup":
        return <SignupForm onBackToLogin={() => setAuthScreen("main")} onSignupSuccess={() => setAuthScreen("main")} />;
      default:
        return (
          <LoginForm
            onShowEmailLogin={() => setAuthScreen("email-login")}
            onShowSignup={() => setAuthScreen("signup")}
          />
        );
    }
  }

  if (!isEmailVerified) {
    return <EmailVerificationScreen onLogout={() => auth.signOut()} />;
  }

  const handleLogout = () => {
    auth.signOut();
  };

  const handleWordbookSelect = (wordbook: any) => {
    setSelectedWordbookForDetail(wordbook);
    setActiveTab("vocabulary");
  };

  const handleStartStudyWithWordbook = (wordbook: any) => {
    setSelectedWordbookForStudy(wordbook);
    setActiveTab("study");
  };

  // 2. 상세 페이지에서 목록으로 돌아오기 위한 함수
  const handleBackToVocabularyList = () => {
    setSelectedWordbookForDetail(null);
  };

  // 3. 탭 변경 시 선택된 단어장 정보를 초기화하여 오류 방지
  const handleTabChange = (tab: string) => {
    if (tab !== 'vocabulary') {
      setSelectedWordbookForDetail(null);
    }
    setActiveTab(tab);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        // home-screen.tsx에 onStartStudy prop이 없으므로 제거
        return <HomeScreen onWordbookSelect={handleWordbookSelect} />;

      case "vocabulary":
        // 4. ✨ 핵심 수정 ✨: 선택된 단어장이 있으면 상세 페이지를, 없으면 목록을 보여줌
        if (selectedWordbookForDetail) {
          return (
            <WordbookDetail
              wordbook={selectedWordbookForDetail}
              onBack={handleBackToVocabularyList}
              // wordbook-detail.tsx는 onUpdate prop을 받으므로, 목록 새로고침을 위해 함수 전달
              onUpdate={handleBackToVocabularyList}
            />
          );
        }
        // vocabulary-screen.tsx의 props에 맞게 전달
        return <VocabularyScreen onNavigateToStudy={handleStartStudyWithWordbook} />;

      case "study":
        // study-screen.tsx의 props에 맞게 전달
        return <StudyScreen
          wordbook={selectedWordbookForStudy}
          onExit={() => {
            setSelectedWordbookForStudy(null)
            setActiveTab('home')
          }}
          onSelectWordbook={() => setActiveTab('vocabulary')}
        />;

      case "community":
        return <CommunityScreen />;

      case "settings":
        return <SettingsScreen onLogout={handleLogout} />;

      default:
        return <HomeScreen onWordbookSelect={handleWordbookSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto">
        {renderScreen()}
      </main>
      {/* 학습 중일 때는 하단 바 숨기기 */}
      {!(activeTab === 'study' && selectedWordbookForStudy) && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}