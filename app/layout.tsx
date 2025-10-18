import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
<<<<<<< HEAD
=======
import { ThemeProvider } from "@/lib/theme-context"
import { Toaster } from "@/components/ui/toaster"
>>>>>>> db7745a (다크모드, 프로필 설정)
import "./globals.css"

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
<<<<<<< HEAD
        <Suspense fallback={null}>{children}</Suspense>
=======
        <ThemeProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </ThemeProvider>
>>>>>>> db7745a (다크모드, 프로필 설정)
        <Analytics />
      </body>
    </html>
  )
}
