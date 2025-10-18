"use client"

import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { sendEmailVerification } from "firebase/auth"

export function EmailVerificationScreen({ onLogout }: { onLogout: () => void }) {
    const handleResendEmail = async () => {
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
            alert("인증 이메일을 다시 보냈습니다. 받은 편지함을 확인해주세요.");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">이메일 인증 필요</h1>
                <p className="text-gray-600 mb-6">
                    회원가입을 완료하려면, 회원님의 이메일 주소로 발송된 인증 링크를 클릭해주세요.
                </p>
                <div className="space-y-3">
                    <Button
                        onClick={handleResendEmail}
                        variant="outline"
                        className="w-full h-12 text-base font-medium border-2"
                    >
                        인증 이메일 재전송
                    </Button>
                    <Button
                        onClick={onLogout}
                        className="w-full h-12 text-base font-medium bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white"
                    >
                        로그아웃
                    </Button>
                </div>
                <p className="text-xs text-gray-500 mt-6">
                    이메일을 받지 못하셨나요? 스팸 편지함도 확인해보세요.
                </p>
            </div>
        </div>
    )
<<<<<<< HEAD
}
=======
}
>>>>>>> db7745a (다크모드, 프로필 설정)
