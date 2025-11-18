"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Monitor, Moon, Sun, Palette, Check } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

interface ThemeSettingsProps {
  onBack: () => void
}

export function ThemeSettings({ onBack }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    {
      value: "light" as const,
      label: "라이트 모드",
      description: "밝고 깨끗한 화면",
      icon: Sun
    },
    {
      value: "dark" as const,
      label: "다크 모드",
      description: "눈이 편안한 어두운 화면",
      icon: Moon
    },
    {
      value: "system" as const,
      label: "시스템 설정",
      description: "기기 설정에 따라 자동 변경",
      icon: Monitor
    },
  ]

  return (
    <div className="min-h-screen bg-muted/40 pb-10">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-20 px-4 h-14 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="-ml-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">테마 설정</h1>
        <div className="w-9" /> {/* 균형을 위한 빈 공간 */}
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">

        {/* Theme Selection Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">화면 모드</h2>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y">
              {themeOptions.map((option) => {
                const Icon = option.icon
                const isSelected = theme === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-muted/50",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className={cn(
                          "font-medium text-base",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {option.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {option.description}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="h-5 w-5 text-primary animate-in zoom-in duration-200" />
                    )}
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground px-2 leading-relaxed">
            시스템 설정을 선택하면 아이폰/안드로이드 기기의 다크 모드 설정에 따라 앱의 테마가 자동으로 변경됩니다.
          </p>
        </section>

      </div>
    </div>
  )
}