"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Eye, EyeOff, ArrowLeft } from "lucide-react";

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
  const [emailSent, setEmailSent] = useState(false);

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
      // 1) Auth에 사용자 생성 (자동으로 로그인 상태가 됨)
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

      setEmailSent(true);
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

  // 재사용 가능한 인증메일 전송 함수
  const sendVerificationEmail = async (user: User) => {
    try {
      await sendEmailVerification(user);
    } catch (err) {
      console.error("인증 메일 전송 실패:", err);
      throw err;
    }
  };

  // 인증메일 재전송 (current user가 있어야 동작)
  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const current = auth.currentUser;
      if (!current) {
        alert("현재 인증 재전송을 수행할 수 있는 사용자가 없습니다. 로그인 상태를 확인해주세요.");
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

  const handleSignupComplete = () => {
    onSignupSuccess();
  };

  // Step 2: 인증메일 보냈습니다 화면
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="sm" onClick={onBackToLogin} className="p-2">
              <ArrowLeft size={20} className="text-[#FF7A00]" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">회원가입</h1>
            <div className="w-10" />
          </div>

          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">인증메일을 보내드렸어요 😊</h2>
              <div className="space-y-2">
                <p className="text-base font-medium text-gray-900">{formData.email}</p>
                <p className="text-sm text-gray-600">메일을 확인하고 가입을 완료하세요!</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 text-base font-medium border-2 border-gray-200 hover:bg-gray-50 bg-white rounded-full"
              >
                {isLoading ? "전송 중..." : "인증 메일 재발송"}
              </Button>

              <Button
                onClick={handleSignupComplete}
                className="w-full h-12 text-base font-medium bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-full"
              >
                가입완료
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: 폼 화면
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">회원가입</h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <Input
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full h-12 text-base bg-gray-50 border border-gray-200 rounded-full px-4 placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <div className="relative">
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full h-12 text-base bg-gray-50 border rounded-full px-4 pr-10 placeholder:text-gray-400 ${
                  emailValid === true
                    ? "border-green-500"
                    : emailValid === false
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
                required
              />
              {emailValid === true && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
            </div>
            {emailValid === true && <p className="text-sm text-green-600 mt-1">사용 가능한 이메일입니다</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`w-full h-12 text-base bg-gray-50 border rounded-full px-4 pr-10 placeholder:text-gray-400 ${
                  formData.password.length >= 6 && passwordMatch !== false ? "border-green-500" : "border-gray-200"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {formData.password.length >= 6 && passwordMatch !== false && (
                <Check className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              )}
            </div>
            {formData.password.length > 0 && formData.password.length < 6 && (
              <p className="text-sm text-gray-500 mt-1">비밀번호는 6자 이상 입력해주세요</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className={`w-full h-12 text-base bg-gray-50 border rounded-full px-4 pr-10 placeholder:text-gray-400 ${
                  passwordMatch === true
                    ? "border-green-500"
                    : passwordMatch === false
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {passwordMatch === true && <Check className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
            </div>
            {passwordMatch === false && <p className="text-sm text-red-600 mt-1">비밀번호가 일치하지 않습니다</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`w-full h-12 text-base font-medium rounded-full mt-6 ${
              isFormValid ? "bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "가입 중..." : "가입하기"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onBackToLogin} className="text-sm text-gray-500 hover:text-gray-700">
            ← 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
