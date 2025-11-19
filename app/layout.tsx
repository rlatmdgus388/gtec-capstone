// app/layout.tsx

import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/lib/theme-context"
import { Toaster } from "@/components/ui/toaster"
import { NativeStatusBar } from "@/components/NativeStatusBar"  // ⬅️ 추가
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
        <NativeStatusBar /> {/* ⬅️ 네이티브용 상태바/세이프에어리어 처리 */}

        <ThemeProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  )
}
