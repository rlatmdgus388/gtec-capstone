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

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onWordbookSelect={handleWordbookSelect} />;
      case "vocabulary":
        // VocabularyScreen이 받는 props에 맞게 수정
        return (
          <VocabularyScreen
            selectedWordbookId={selectedWordbookForDetail?.id}
            onNavigateToStudy={handleStartStudyWithWordbook}
          />
        );
      case "study":
        return <StudyScreen selectedWordbookId={selectedWordbookForStudy?.id} />;
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

