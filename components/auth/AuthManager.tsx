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
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function AuthManager() {
  // 👇 *** 상태 관리 로직을 아래와 같이 수정했습니다 ***
  const [isLoading, setIsLoading] = useState(true); // 1. 로딩 상태를 true로 시작합니다.
  const [user, setUser] = useState<User | null>(null); // 2. 사용자 정보 자체를 상태로 관리합니다.

  const [authScreen, setAuthScreen] = useState<"main" | "email-login" | "signup">("main");
  const [activeTab, setActiveTab] = useState("home");
  const [selectedWordbookForStudy, setSelectedWordbookForStudy] = useState<any>(null);
  const [selectedWordbookForDetail, setSelectedWordbookForDetail] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // 사용자 정보를 업데이트하고,
      setIsLoading(false);  // 로딩 상태를 종료합니다.
    });
    return () => unsubscribe();
  }, []);

  // 👇 *** 렌더링 로직도 새로운 상태에 맞게 수정했습니다 ***
  const isAuthenticated = !!user; // user 객체가 있으면 true, 없으면 false
  const isGoogleUser = user?.providerData.some(provider => provider.providerId === 'google.com') ?? false;
  const isEmailVerified = user?.emailVerified || isGoogleUser;

  // 1. Firebase가 응답할 때까지 로딩 화면을 보여줍니다.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  // 2. 로그아웃 상태일 때 로그인 화면을 보여줍니다.
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

  // 3. 로그인했지만 이메일 인증이 안 됐을 때 인증 화면을 보여줍니다.
  if (!isEmailVerified) {
    return <EmailVerificationScreen onLogout={() => auth.signOut()} />;
  }
  
  // (나머지 홈 화면 렌더링 로직은 기존과 동일)
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

  const handleBackToVocabularyList = () => {
    setSelectedWordbookForDetail(null);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onWordbookSelect={handleWordbookSelect} />;
      case "vocabulary":
        return (
          <VocabularyScreen
            onStartStudy={handleStartStudyWithWordbook}
            selectedWordbook={selectedWordbookForDetail}
            onBackToList={handleBackToVocabularyList}
          />
        );
      case "study":
        return <StudyScreen selectedWordbook={selectedWordbookForStudy} />;
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
      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

