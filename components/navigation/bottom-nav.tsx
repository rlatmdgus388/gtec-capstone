"use client"

import { Home, BookOpen, Brain, Users, Settings } from "lucide-react"

// NavItem 인터페이스
interface NavItemProps {
  icon: React.ElementType
  label: string
  isActive: boolean
  onClick: () => void
}

// BottomNavProps 인터페이스
interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

// NavItem 컴포넌트
const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
    >
      <Icon size={24} className="mb-0.5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

// 내비게이션 아이템 데이터
const navItems = [
  { id: "home", icon: Home, label: "홈" },
  { id: "vocabulary", icon: BookOpen, label: "단어장" },
  { id: "study", icon: Brain, label: "학습" },
  { id: "community", icon: Users, label: "커뮤니티" },
  { id: "settings", icon: Settings, label: "설정" },
]

// BottomNav 컴포넌트
export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    // [수정] 바깥쪽 div에는 높이(h-16)가 없습니다.
    <div className="w-full max-w-md bg-background">
      {/*
        [수정] 안쪽 div가 실제 높이(h-16)와
        홈 인디케이터 여백(pb-[...])을 모두 가집니다.
      */}
      <div
        className="flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]"
      >
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </div>
    </div>
  )
}