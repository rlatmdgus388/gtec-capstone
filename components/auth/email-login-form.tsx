"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
      console.warn("localStorage access failed", err)
    }
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

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
      if (error?.code === "auth/wrong-password" || error?.code === "auth/user-not-found" || error?.code === "auth/invalid-credential") {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBackToMain}
            className="pl-0 hover:bg-transparent hover:text-muted-foreground text-muted-foreground/80 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-foreground">이메일 로그인</h1>
          <p className="text-muted-foreground mt-2">이메일과 비밀번호를 입력해주세요.</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">이메일</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 text-base bg-card border-border text-foreground rounded-full px-4 placeholder:text-muted-foreground/50 focus-visible:ring-[#FF7A00]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">비밀번호</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 text-base bg-card border-border text-foreground rounded-full px-4 pr-12 placeholder:text-muted-foreground/50 focus-visible:ring-[#FF7A00]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveEmail"
                checked={saveEmail}
                onCheckedChange={(checked) => setSaveEmail(!!checked)}
                className="data-[state=checked]:bg-[#FF7A00] data-[state=checked]:border-[#FF7A00]"
              />
              <label
                htmlFor="saveEmail"
                className="text-sm font-medium text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
              >
                이메일 저장
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-[#FF7A00] hover:underline transition-colors"
            >
              비밀번호 찾기
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-base font-medium bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-full shadow-md hover:shadow-lg transition-all mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}