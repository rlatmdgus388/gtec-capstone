"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SnapVocaLogo } from "@/components/snap-voca-logo";
import { auth, db } from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export function LoginForm({
  onShowEmailLogin,
  onShowSignup,
}: {
  onShowEmailLogin?: () => void;
  onShowSignup?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  // [공통 로직] 유저 정보를 Firestore에 확인하고 저장하는 함수
  const checkUserAndCreateFirestore = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: user.email,
        name: user.displayName || user.email?.split("@")[0],
        createdAt: serverTimestamp(),
      });
    }
  };

  // [Redirect 처리] AuthManager에서 처리하므로 여기서는 제거함
  useEffect(() => {
    // 필요한 경우 여기에 추가 로직 작성
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    // 모바일 기기인지 체크 (간단한 UserAgent 검사)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      // 로그인 상태 유지를 위해 로컬 지속성 설정
      await setPersistence(auth, browserLocalPersistence);

      if (isMobile) {
        // [모바일] 리다이렉트 방식
        await signInWithRedirect(auth, provider);
      } else {
        // [PC] 팝업 방식
        const result = await signInWithPopup(auth, provider);
        await checkUserAndCreateFirestore(result.user);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Google 로그인 에러:", error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
      alert(`Google 로그인 오류: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">

        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex justify-center transition-transform hover:scale-105 duration-300">
            <SnapVocaLogo size="xl" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            담아보카
          </h1>
          <p className="text-muted-foreground text-sm">
            나만의 단어장으로 시작하는 언어 공부
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full h-14 text-base font-medium rounded-full border-border bg-card hover:bg-accent text-foreground transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 시작하기
              </>
            )}
          </Button>

          <Button
            onClick={onShowEmailLogin}
            disabled={isLoading}
            className="w-full h-14 text-base font-medium bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            이메일로 로그인
          </Button>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-2">계정이 없으신가요?</p>
          <Button
            onClick={onShowSignup}
            variant="ghost"
            className="text-[#FF7A00] hover:text-[#FF7A00]/80 hover:bg-[#FF7A00]/10 font-semibold"
          >
            이메일로 간편하게 회원가입
          </Button>
        </div>
      </div>
    </div>
  );
}