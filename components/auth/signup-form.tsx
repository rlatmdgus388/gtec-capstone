"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Eye, EyeOff, ArrowLeft, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Firebase
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

interface SignupFormProps {
  onBackToLogin: () => void;
  onSignupSuccess: () => void;
}

export function SignupForm({ onBackToLogin, onSignupSuccess }: SignupFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  // 이메일 정규식 검사
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 핸들러들
  const handleEmailChange = (email: string) => {
    setFormData((prev) => ({ ...prev, email }));
    if (email.length > 0) {
      setEmailValid(validateEmail(email));
    } else {
      setEmailValid(null);
    }
  };

  const handlePasswordChange = (password: string) => {
    setFormData((prev) => ({ ...prev, password }));
    if (formData.confirmPassword.length > 0) {
      setPasswordMatch(password === formData.confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setFormData((prev) => ({ ...prev, confirmPassword }));
    if (confirmPassword.length > 0) {
      setPasswordMatch(formData.password === confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  };

  const isFormValid =
    formData.name.trim().length > 0 &&
    emailValid === true &&
    formData.password.length >= 6 &&
    passwordMatch === true;

  // 회원가입 핸들러: Firebase 연동
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      // 1) Auth에 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2) 인증 이메일 발송
      await sendVerificationEmail(user);

      // 3) Firestore에 사용자 정보 저장
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: formData.name || user.email?.split("@")[0],
        createdAt: serverTimestamp(),
      });

      setCurrentStep(2);
    } catch (error: any) {
      console.error("회원가입 에러:", error);
      if (error?.code === "auth/email-already-in-use") {
        alert("이미 사용 중인 이메일입니다.");
      } else if (error?.code === "auth/invalid-email") {
        alert("유효하지 않은 이메일 주소입니다.");
      } else {
        alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 인증메일 전송 함수
  const sendVerificationEmail = async (user: User) => {
    try {
      await sendEmailVerification(user);
    } catch (err) {
      console.error("인증 메일 전송 실패:", err);
      throw err;
    }
  };

  // 인증메일 재전송
  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const current = auth.currentUser;
      if (!current) {
        alert("로그인 상태를 확인해주세요.");
        return;
      }
      await sendVerificationEmail(current);
      alert("인증 이메일이 재전송되었습니다.");
    } catch (err) {
      console.error("재전송 에러:", err);
      alert("인증 이메일 재전송에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: 인증메일 확인 화면
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="icon" onClick={onBackToLogin} className="hover:bg-muted">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">회원가입 완료</h1>
            <div className="w-9" />
          </div>

          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-[#FF7A00]/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-10 h-10 text-[#FF7A00]" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">인증 메일 발송!</h2>
              <div className="space-y-1">
                <p className="text-base font-medium text-primary">{formData.email}</p>
                <p className="text-sm text-muted-foreground">
                  위 주소로 인증 메일을 보내드렸어요.<br />
                  메일 확인 후 가입을 완료해주세요.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isLoading}
                variant="outline"
                className="w-full h-14 text-base font-medium rounded-full border-border bg-background hover:bg-accent text-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  "인증 메일 재발송"
                )}
              </Button>

              <Button
                onClick={onSignupSuccess}
                className="w-full h-14 text-base font-medium bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-full shadow-md"
              >
                로그인하러 가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: 회원가입 폼 화면
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md animate-in fade-in duration-500">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBackToLogin}
            className="pl-0 hover:bg-transparent hover:text-muted-foreground text-muted-foreground/80 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-foreground">회원가입</h1>
          <p className="text-muted-foreground mt-2">서비스 이용을 위해 정보를 입력해주세요.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">이름</label>
            <Input
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full h-12 text-base bg-card border-border text-foreground rounded-full px-4 placeholder:text-muted-foreground/50 focus-visible:ring-[#FF7A00]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">이메일</label>
            <div className="relative">
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={cn(
                  "w-full h-12 text-base bg-card rounded-full px-4 pr-10 placeholder:text-muted-foreground/50 focus-visible:ring-[#FF7A00]",
                  emailValid === true && "border-green-500 focus-visible:ring-green-500",
                  emailValid === false && "border-red-500 focus-visible:ring-red-500",
                  emailValid === null && "border-border"
                )}
                required
              />
              {emailValid === true && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
              )}
            </div>
            {emailValid === true && (
              <p className="text-xs text-green-500 pl-2">사용 가능한 이메일입니다</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">비밀번호</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="6자 이상 입력"
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={cn(
                  "w-full h-12 text-base bg-card rounded-full px-4 pr-12 placeholder:text-muted-foreground/50 focus-visible:ring-[#FF7A00]",
                  formData.password.length >= 6 && passwordMatch !== false ? "border-green-500 focus-visible:ring-green-500" : "border-border"
                )}
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {formData.password.length >= 6 && passwordMatch !== false && (
                  <Check className="text-green-500" size={18} />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {formData.password.length > 0 && formData.password.length < 6 && (
              <p className="text-xs text-muted-foreground pl-2">비밀번호는 6자 이상이어야 합니다</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">비밀번호 확인</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호 재입력"
                value={formData.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className={cn(
                  "w-full h-12 text-base bg-card rounded-full px-4 pr-12 placeholder:text-muted-foreground/50 focus-visible:ring-[#FF7A00]",
                  passwordMatch === true && "border-green-500 focus-visible:ring-green-500",
                  passwordMatch === false && "border-red-500 focus-visible:ring-red-500",
                  passwordMatch === null && "border-border"
                )}
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {passwordMatch === true && (
                  <Check className="text-green-500" size={18} />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {passwordMatch === false && (
              <p className="text-xs text-red-500 pl-2">비밀번호가 일치하지 않습니다</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={cn(
              "w-full h-14 text-base font-medium rounded-full mt-8 shadow-md transition-all",
              isFormValid
                ? "bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white hover:shadow-lg"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                가입 처리 중...
              </>
            ) : (
              "가입하기"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}