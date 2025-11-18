"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SnapVocaLogo } from "@/components/snap-voca-logo";
import { auth, db } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || user.email?.split("@")[0],
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Google 로그인 에러:", error);
      alert("Google 로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
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
                {/* absolute left-6 제거하고 mr-3만 남김 -> 텍스트 바로 옆에 위치 */}
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