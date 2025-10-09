"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

// Firebase
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

interface EmailLoginFormProps {
  onBackToMain: () => void;
  onLoginSuccess: () => void;
}

export function EmailLoginForm({ onBackToMain, onLoginSuccess }: EmailLoginFormProps) {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [saveEmail, setSaveEmail] = useState<boolean>(false)

  // 초기 로드 시 localStorage에 저장된 이메일이 있으면 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem("snapvoca_saved_email")
      if (saved) {
        setEmail(saved)
        setSaveEmail(true)
      }
    } catch (err) {
      // localStorage 접근 에러는 무시
      console.warn("localStorage access failed", err)
    }
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Test account (로컬 시뮬레이션)
    if (email === "test@test.com" && password === "123456") {
      setTimeout(() => {
        setIsLoading(false)
        persistEmailIfNeeded()
        onLoginSuccess()
      }, 800)
      return
    }

    try {
      // Firebase Authentication 시도
      await signInWithEmailAndPassword(auth, email, password)

      // 로그인 성공: 이메일 저장 처리 후 콜백
      persistEmailIfNeeded()
      onLoginSuccess()
    } catch (error: any) {
      // Firebase 에러 코드에 따른 처리
      if (error?.code === "auth/wrong-password" || error?.code === "auth/user-not-found") {
        alert("이메일 또는 비밀번호가 올바르지 않습니다.")
      } else if (error?.code === "auth/too-many-requests") {
        alert("시도로 인해 일시적으로 차단되었습니다. 잠시 후 다시 시도해주세요.")
      } else {
        console.error("로그인 에러:", error)
        alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const persistEmailIfNeeded = () => {
    try {
      if (saveEmail) {
        localStorage.setItem("snapvoca_saved_email", email)
      } else {
        localStorage.removeItem("snapvoca_saved_email")
      }
    } catch (err) {
      console.warn("localStorage write failed", err)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">로그인</h1>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <Input
              type="email"
              placeholder="login@naver.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 text-base bg-gray-50 border border-gray-200 rounded-full px-4 placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 text-base bg-gray-50 border border-gray-200 rounded-full px-4 pr-12 placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="saveEmail"
                checked={saveEmail}
                onCheckedChange={(checked) => setSaveEmail(!!checked)}
              />
              <label htmlFor="saveEmail" className="text-sm text-gray-700 cursor-pointer">
                이메일 저장
              </label>
            </div>
            <button type="button" className="text-sm text-gray-500 hover:text-gray-700">
              비밀번호 찾기
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-medium bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-full mt-6"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onBackToMain} className="text-sm text-gray-500 hover:text-gray-700">
            ← 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
