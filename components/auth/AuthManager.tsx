// components/auth/AuthManager.tsx
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
import { CreateWordbookScreen } from "@/components/vocabulary/create-wordbook-screen";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { fetchWithAuth } from "@/lib/api"; // [수정됨] fetchWithAuth 임포트 확인

export default function AuthManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [authScreen, setAuthScreen] = useState<"main" | "email-login" | "signup">("main");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedWordbookForStudy, setSelectedWordbookForStudy] = useState<any>(null); // StudyScreen으로 전달될 wordbook 정보

  const [selectedWordbookForDetail, setSelectedWordbookForDetail] = useState<any>(null);
  const [vocabularyRefreshKey, setVocabularyRefreshKey] = useState(0); // 단어장 목록 새로고침 키
  const [isCreatingWordbook, setIsCreatingWordbook] = useState(false);

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
    setSelectedWordbookForDetail(null); // 상세 화면 상태 해제
    setVocabularyRefreshKey(prev => prev + 1); // 목록 새로고침 트리거
  };

  // [!!! 여기를 수정합니다 !!!]
  const handleWordbookUpdate = async () => {
    // 1. 단어장 목록(VocabularyScreen)을 위한 새로고침 키
    setVocabularyRefreshKey(prev => prev + 1);

    // 2. [추가됨] 현재 상세 보기 중인 단어장 정보를 API로 다시 불러와서
    //    state(selectedWordbookForDetail)를 갱신합니다.
    if (selectedWordbookForDetail) {
      try {
        // GET /api/wordbooks/[wordbookId] API는 progress가 포함된 단어장 정보를 반환합니다.
        const updatedWordbook = await fetchWithAuth(`/api/wordbooks/${selectedWordbookForDetail.id}`);
        setSelectedWordbookForDetail(updatedWordbook);
      } catch (error) {
        console.error("단어장 상세 정보 갱신 실패:", error);
        // 실패 시 목록으로 돌려보내서 데이터를 일치시킴
        handleBackToVocabularyList();
      }
    }
  };
  // [!!! 수정 끝 !!!]

  const handleCreateWordbook = async (newWordbookData: { name: string; description: string; category: string }) => {
    try {
      await fetchWithAuth('/api/wordbooks', { method: 'POST', body: JSON.stringify(newWordbookData) });
      alert("새로운 단어장이 생성되었습니다.");
      setIsCreatingWordbook(false);
      setVocabularyRefreshKey(prev => prev + 1);
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
    // 단어장 탭에서 상세 화면 보고 있을 때 다시 단어장 탭 누르면 목록으로
    if (tab === 'vocabulary' && activeTab === 'vocabulary' && selectedWordbookForDetail) {
      handleBackToVocabularyList();
      return;
    }

    if (tab !== 'vocabulary') {
      setSelectedWordbookForDetail(null);
    }
    setIsCreatingWordbook(false);
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
        if (isCreatingWordbook) {
          return <CreateWordbookScreen
            onBack={() => setIsCreatingWordbook(false)}
            onSave={handleCreateWordbook}
          />;
        }
        if (selectedWordbookForDetail) {
          return (
            <WordbookDetail
              wordbook={selectedWordbookForDetail}
              onBack={handleBackToVocabularyList}
              onUpdate={handleWordbookUpdate} // ✨ 수정된 함수가 여기로 전달됩니다 ✨
            />
          );
        }
        return (
          <VocabularyScreen
            onWordbookSelect={handleWordbookSelect}
            onStartCreate={() => setIsCreatingWordbook(true)}
            refreshKey={vocabularyRefreshKey}
            onNavigateToStudy={handleStartStudyWithWordbook} // 실제로는 VocabularyScreen 내부에 이 prop이 없음. 필요시 추가
          />
        );

      case "study":
        return <StudyScreen selectedWordbookId={selectedWordbookForStudy?.id ?? null} />;

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
      {!(activeTab === 'vocabulary' && isCreatingWordbook) &&
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      }
    </div>
  );
}