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
      {/*
        body 태그는 이제 globals.css를 통해 
        @apply h-dvh overflow-hidden 을 갖게 됩니다.
      */}
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider>
          {/*
            [핵심 수정]
            부모(body)가 h-dvh이므로, 이 div는 h-full로 변경하여
            부모의 동적 높이를 100% 채우도록 합니다.
          */}
          <div className="flex h-full flex-col">
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