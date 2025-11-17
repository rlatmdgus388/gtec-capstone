// app/layout.tsx

import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/lib/theme-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

// ✅ viewport는 metadata 밖으로 분리 (경고 해결)
export const metadata: Metadata = {
  title: "찍어보카 - Snap Voca",
  description: "AI-powered vocabulary learning app with photo text recognition",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ✅ body 자체는 화면 높이 + 바디 스크롤 막기 (모바일 주소창 튀는 현상 완화) */}
      <body
        className={`min-h-dvh overflow-hidden font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {/* ✅ 실제 레이아웃 컨테이너: 전체 높이 flex 컬럼 */}
          <div className="flex min-h-dvh flex-col">
            {/* 이 main은 스크롤 X, 자식에게 flex-1 공간만 넘겨줌 */}
            <main className="flex-1 min-h-0">
              <Suspense fallback={null}>{children}</Suspense>
            </main>
          </div>

          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
