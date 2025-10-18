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
import { WordbookDetail } from "@/components/vocabulary/wordbook-detail";
import { CreateWordbookScreen } from "@/components/vocabulary/create-wordbook-screen"; // 새로 만든 화면 import
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { fetchWithAuth } from "@/lib/api"; // API 호출을 위해 import

export default function AuthManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [authScreen, setAuthScreen] = useState<"main" | "email-login" | "signup">("main");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedWordbookForStudy, setSelectedWordbookForStudy] = useState<any>(null);

  const [selectedWordbookForDetail, setSelectedWordbookForDetail] = useState<any>(null);
  const [vocabularyRefreshKey, setVocabularyRefreshKey] = useState(0);
  const [isCreatingWordbook, setIsCreatingWordbook] = useState(false); // 새 단어장 만들기 화면 상태

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
    return <div className="min-h-screen flex items-center justify-center"><p>로딩 중...</p></div>;
  }

  if (!isAuthenticated) {
    switch (authScreen) {
      case "email-login":
        return <EmailLoginForm onBackToMain={() => setAuthScreen("main")} onLoginSuccess={() => setAuthScreen("main")} />;
      case "signup":
        return <SignupForm onBackToLogin={() => setAuthScreen("main")} onSignupSuccess={() => setAuthScreen("main")} />;
      default:
        return <LoginForm onShowEmailLogin={() => setAuthScreen("email-login")} onShowSignup={() => setAuthScreen("signup")} />;
    }
  }

  if (!isEmailVerified) {
    return <EmailVerificationScreen onLogout={() => auth.signOut()} />;
  }

  const handleLogout = () => { auth.signOut(); };

  const handleWordbookSelect = (wordbook: any) => {
    setSelectedWordbookForDetail(wordbook);
  };

  const handleBackToVocabularyList = () => {
    setSelectedWordbookForDetail(null);
    setVocabularyRefreshKey(prev => prev + 1);
  };

  // 단어장 생성 API를 호출하는 함수
  const handleCreateWordbook = async (newWordbookData: { name: string; description: string; category: string }) => {
    try {
      await fetchWithAuth('/api/wordbooks', { method: 'POST', body: JSON.stringify(newWordbookData) });
      alert("새로운 단어장이 생성되었습니다.");
      setIsCreatingWordbook(false); // 목록으로 돌아가기
      setVocabularyRefreshKey(prev => prev + 1); // 목록 새로고침
    } catch (error) {
      console.error("단어장 생성 실패:", error);
      alert("단어장 생성에 실패했습니다.");
    }
  };

  const handleStartStudyWithWordbook = (wordbook: any) => {
    setSelectedWordbookForStudy(wordbook);
    setActiveTab("study");
  };

  const handleTabChange = (tab: string) => {
    if (tab !== 'vocabulary') {
      setSelectedWordbookForDetail(null);
    }
    setIsCreatingWordbook(false); // 다른 탭 이동 시 만들기 모드 해제
    setActiveTab(tab);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onWordbookSelect={(wordbook) => {
          handleWordbookSelect(wordbook);
          setActiveTab("vocabulary");
        }} activeTab={activeTab} />;

      case "vocabulary":
        if (isCreatingWordbook) { // 만들기 모드일 때
          return <CreateWordbookScreen
            onBack={() => setIsCreatingWordbook(false)}
            onSave={handleCreateWordbook}
          />;
        }
        if (selectedWordbookForDetail) { // 상세 화면 모드일 때
          return (
            <WordbookDetail
              wordbook={selectedWordbookForDetail}
              onBack={handleBackToVocabularyList}
              onUpdate={handleBackToVocabularyList}
            />
          );
        }
        return ( // 기본 목록 화면
          <VocabularyScreen
            onWordbookSelect={handleWordbookSelect}
            onStartCreate={() => setIsCreatingWordbook(true)} // 만들기 모드 시작 함수 전달
            refreshKey={vocabularyRefreshKey}
            onNavigateToStudy={handleStartStudyWithWordbook}
          />
        );

      case "study":
        return <StudyScreen selectedWordbook={selectedWordbookForStudy} onExit={() => { setSelectedWordbookForStudy(null); setActiveTab('home'); }} onSelectWordbook={() => setActiveTab('vocabulary')} />;
      case "community":
        return <CommunityScreen />;
      case "settings":
        return <SettingsScreen onLogout={handleLogout} />;
      default:
        return <HomeScreen onWordbookSelect={(wordbook) => {
          handleWordbookSelect(wordbook);
          setActiveTab("vocabulary");
        }} activeTab={activeTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto">{renderScreen()}</main>
      {/* 단어장 생성 페이지에서는 하단 네비게이션 숨김 */}
      {!(activeTab === 'vocabulary' && (isCreatingWordbook || selectedWordbookForDetail)) &&
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      }
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> db7745a (다크모드, 프로필 설정)
