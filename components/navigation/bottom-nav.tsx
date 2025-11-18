// components/navigation/bottom-nav.tsx
"use client"

// [수정] 'GraduationCap' 아이콘을 import합니다.
import { Home, BookOpen, GraduationCap, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

// [수정] 탭 목록을 새 스타일에 맞게 변경합니다.
const tabs = [
  { id: "home", label: "홈", icon: Home },
  { id: "vocabulary", label: "단어장", icon: BookOpen },
  { id: "study", label: "학습", icon: GraduationCap },
  { id: "community", label: "커뮤니티", icon: Users },
  { id: "settings", label: "설정", icon: Settings },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    // [수정] 'fixed' 스타일을 적용합니다.
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      {/*
        [핵심 수정]
        'py-2'를 'pt-2' (위쪽 여백)와
        'pb-[calc(0.5rem+env(safe-area-inset-bottom))]' (아래쪽 여백 + 안전 영역)
        으로 분리합니다. 'py-2'는 0.5rem입니다.
      */}
      <div className="flex items-center justify-around px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            // [수정] 새로운 버튼 스타일을 적용합니다.
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {/* [수정] Icon size={20}, mb-1 */}
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}