// app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
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
  viewport: "initial-scale=1, width=device-width, viewport-fit=cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ⛔ body에 safe-area 패딩을 주면 높이 계산이 어긋나서 바운스/잘림이 생길 수 있음 */}
      {/* → 패딩은 main 쪽으로 옮깁니다. */}
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider>
          {/* 화면 전체 높이를 Flex로, 바디 스크롤은 막고 main만 스크롤 */}
          <div className="flex h-dvh flex-col">
            {/* 고정 헤더가 있다면 여기: <Header className="h-14 shrink-0" /> */}
            <main
              className="
                flex-1 min-h-0
                overflow-y-auto overscroll-contain
                pt-[env(safe-area-inset-top)]
                /* ▼ 하단바가 fixed로 64px(4rem)라고 가정하고, 
                   safe-area와 하단바 높이를 모두 더해줍니다. 
                   (하단바 높이가 다르면 4rem 부분을 수정하세요)
                */
                pb-[calc(4rem + env(safe-area-inset-bottom))]
              "
            >
              <Suspense fallback={null}>{children}</Suspense>
            </main>
            {/* 고정 탭바(하단 네비게이션)가 RootLayout이 아닌 
              (app)/(main)/layout.tsx 같은 하위 레이아웃에 있을 수 있습니다.
              어느 위치에 있든 <main> 태그의 padding-bottom 계산은 유효합니다.
            */}
          </div>

          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}