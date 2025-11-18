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
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider>
          {/* h-dvh(전체 화면 높이)를 가진 flex 컨테이너 */}
          <div className="flex h-dvh flex-col">
            {/*
              [핵심 수정]
              이 <main> 태그가 스크롤을 하지 않도록 수정합니다.
              'overflow-y-auto'와 'pb-[...]' 클래스를 제거합니다.
              
              이제 이 태그는 스크롤 없이,
              자식 컴포넌트(AuthManager -> VocabularyScreen)가
              높이를 100% 차지하도록 공간만(flex-1) 물려줍니다.
            */}
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
