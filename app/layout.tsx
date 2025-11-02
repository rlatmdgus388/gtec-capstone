import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/lib/theme-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { SnapVocaIcon } from "@/components/icons/SnapVocaIcon" // <--- 1. 로고 아이콘 import 추가

export const metadata: Metadata = {
  title: "찍어보카 - Snap Voca",
  description: "AI-powered vocabulary learning app with photo text recognition",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider>
          {/* 2. 로고 아이콘을 여기에 추가했습니다. (크기, 위치 등은 수정 가능) */}
          <div className="p-4">
            <SnapVocaIcon className="w-12 h-12" />
          </div>

          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}