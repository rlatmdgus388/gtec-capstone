"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

interface ThemeSettingsProps {
  onBack: () => void
}

export function ThemeSettings({ onBack }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { value: "light" as const, label: "라이트 모드", icon: Sun },
    { value: "dark" as const, label: "다크 모드", icon: Moon },
    { value: "system" as const, label: "시스템 설정", icon: Monitor },
  ]

  return (
    // 1. 최상위 div를 flex-col로 변경
    <div className={cn("min-h-screen bg-background flex flex-col", "page-transition-enter")}>
      {/* Header */}
      <div className="bg-card sticky top-0 z-10">
        <div className="flex items-center p-4 gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-foreground hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-foreground">테마</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* 2. 헤더 아래 콘텐츠 전체를 스크롤 가능한 div로 감싸기 */}
      {/* (pb-20은 하단 여백) */}
      <div className="flex-1 overflow-y-auto pb-20">
        
        <div className="p-4 space-y-3">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = theme === option.value

            return (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all ${
                  isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent"
                }`}
                onClick={() => setTheme(option.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <Icon size={20} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                      </div>
                      <span className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {option.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="px-4 py-6">
          <Card className="bg-muted/50 border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                시스템 설정을 선택하면 기기의 테마 설정에 따라 자동으로 변경됩니다.
              </p>
            </CardContent>
          </Card>
        </div>

      </div> {/* 스크롤 영역 div 끝 */}
    </div>
  )
}