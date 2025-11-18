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
          {/*
            [핵심 수정]
            <div className="flex h-dvh flex-col"> 와
            <main className="flex-1 min-h-0"> 를 제거했습니다.
            
            Suspense와 children이 ThemeProvider 바로 밑에 와서
            자식 컴포넌트가 body에서 직접 렌더링되도록 합니다.
          */}
          <Suspense fallback={null}>{children}</Suspense>

          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}