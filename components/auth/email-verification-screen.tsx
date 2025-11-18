"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { sendEmailVerification } from "firebase/auth"
import { Mail, LogOut, Loader2, RefreshCw } from "lucide-react"

export function EmailVerificationScreen({ onLogout }: { onLogout: () => void }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleResendEmail = async () => {
        if (!auth.currentUser) return

        setIsLoading(true)
        try {
            await sendEmailVerification(auth.currentUser)
            alert("인증 이메일을 다시 보냈습니다. 받은 편지함을 확인해주세요.")
        } catch (error) {
            console.error("Email resend error:", error)
            alert("이메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 transition-colors duration-300">
            <div className="w-full max-w-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Icon & Title */}
                <div className="mb-8 space-y-4">
                    <div className="w-20 h-20 bg-[#FF7A00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-[#FF7A00]" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">이메일 인증 필요</h1>
                    <div className="space-y-2 text-muted-foreground">
                        <p>
                            서비스를 이용하려면 이메일 인증이 필요합니다.
                        </p>
                        <p className="text-sm bg-card p-3 rounded-lg border border-border text-foreground font-medium break-all">
                            {auth.currentUser?.email}
                        </p>
                        <p className="text-sm">
                            위 주소로 발송된 인증 링크를 클릭해주세요.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={handleResendEmail}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-14 text-base font-medium rounded-full border-border bg-card hover:bg-accent text-foreground"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                전송 중...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                인증 이메일 재전송
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={onLogout}
                        className="w-full h-14 text-base font-medium bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-full shadow-md"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-8">
                    이메일을 받지 못하셨나요? <br />
                    스팸 편지함을 확인하거나 재전송 버튼을 눌러주세요.
                </p>
            </div>
        </div>
    )
}