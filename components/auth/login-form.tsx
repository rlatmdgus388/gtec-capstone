"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SnapVocaLogo } from "@/components/snap-voca-logo";
import { auth, db } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            {/* 로고 크기를 크게 표시 */}
            <SnapVocaLogo size="xl" />
          </div>
          {/* 글씨 더 크고 두껍게 */}
          <h1 className="text-5xl font-black text-black">담아보카</h1>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full h-13 text-base font-medium border-2 border-gray-200 hover:bg-gray-50 bg-white rounded-full text-black transition-all focus:ring-4 focus:ring-gray-200 focus:scale-[0.98] active:scale-95"
          >
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
            Google로 로그인
          </Button>

          <Button
            onClick={onShowEmailLogin}
            className="w-full h-13 text-base font-medium bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-full transition-all focus:ring-4 focus:ring-[#FF7A00]/30 focus:scale-[0.98] active:scale-95"
          >
            이메일로 로그인
          </Button>
        </div>

        <div className="text-center mt-5">
          <Button
            onClick={onShowSignup}
            variant="ghost"
            className="text-[#FF7A00] hover:text-[#FF7A00]/80 font-medium"
          >
            이메일로 간편하게 회원가입
          </Button>
        </div>
      </div>
    </div>
  );
}
