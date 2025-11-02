// rlatmdgus388/gtec-capstone/gtec-capstone-main/app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/lib/theme-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
// import { SnapVocaIcon } from "@/components/icons/SnapVocaIcon" // <-- 1. 로고 import를 삭제 (또는 주석 처리)

export const metadata: Metadata = {
  title: "찍어보카 - Snap Voca",
  description: "AI-powered vocabulary learning app with photo text recognition",
  generator: "v0.app",
  // 2. 모바일 기기 전체 화면 사용 및 상단바(노치) 대응을 위해 viewport 추가
  viewport: "initial-scale=1, width=device-width, viewport-fit=cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // 3. Hydration 에러를 방지하기 위해 suppressHydrationWarning 추가
    <html lang="en" suppressHydrationWarning>
      {/* 4. 상단바(노치)와 하단 홈바 영역에 패딩을 줘서 콘텐츠가 가려지지 않게 함 */}
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}
      >
        <ThemeProvider>
          {/* 5. '네모난 거'와 '여백'의 원인이었던 이 블록을 완전히 삭제합니다.
            <div className="p-4">
              <SnapVocaIcon className="w-12 h-12" />
            </div>
          */}

          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}