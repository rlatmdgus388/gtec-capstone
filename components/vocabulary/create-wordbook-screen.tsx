"use client"

<<<<<<< HEAD
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CreateWordbookScreenProps {
    onBack: () => void;
    onSave: (data: { name: string; description: string; category: string }) => Promise<void>;
}

// '학술' 제거 및 .sort() 삭제
const CATEGORIES = ["기초", "시험", "회화", "비즈니스", "여행", "전문", "기타"];

export function CreateWordbookScreen({ onBack, onSave }: CreateWordbookScreenProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = name.trim() !== "" && category.trim() !== ""

    const handleSubmit = async () => {
        if (!canSubmit) {
            alert("단어장 이름과 카테고리는 필수입니다.");
            return;
        }
        setIsSubmitting(true);
        try {
            await onSave({ name, description, category });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="flex items-center justify-between px-2 py-2 h-16">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
                        <ArrowLeft size={22} className="text-gray-700" />
                    </Button>
                    <h1 className="text-xl font-bold text-gray-900">새 단어장</h1>
                    <Button
                        variant="ghost"
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className="text-[#FF7A00] font-bold hover:bg-[#FF7A00]/10 text-base px-4"
                    >
                        {isSubmitting ? "저장중..." : "저장"}
                    </Button>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="wordbook-name" className="text-sm font-medium text-gray-600 px-1">단어장 이름</Label>
                    <Input
                        id="wordbook-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="예: 토익 필수 단어"
                        className="h-12 text-base rounded-lg border-0 bg-gray-100 focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-white shadow-none"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="wordbook-category" className="text-sm font-medium text-gray-600 px-1">카테고리</Label>
                    <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger id="wordbook-category" className="h-12 text-base rounded-lg border-0 bg-gray-100 focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-white shadow-none">
                            <SelectValue placeholder="카테고리를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-base">{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="wordbook-description" className="text-sm font-medium text-gray-600 px-1">설명 (선택)</Label>
                    <Textarea
                        id="wordbook-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="이 단어장에 대한 간단한 설명을 입력하세요."
                        className="text-base rounded-lg border-0 bg-gray-100 focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-white shadow-none"
                        rows={4}
                    />
                </div>
            </div>
        </div>
    );
}
=======
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface CreateWordbookScreenProps {
  onBack: () => void
  onSave: (data: { name: string; description: string; category: string }) => Promise<void>
}

// '학술' 제거 및 .sort() 삭제
const CATEGORIES = ["기초", "시험", "회화", "비즈니스", "여행", "전문", "기타"]

export function CreateWordbookScreen({ onBack, onSave }: CreateWordbookScreenProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = name.trim() !== "" && category.trim() !== ""

  const handleSubmit = async () => {
    if (!canSubmit) {
      alert("단어장 이름과 카테고리는 필수입니다.")
      return
    }
    setIsSubmitting(true)
    try {
      await onSave({ name, description, category })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between px-2 py-2 h-16">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
            <ArrowLeft size={22} className="text-foreground" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">새 단어장</h1>
          <Button
            variant="ghost"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="text-primary font-bold hover:bg-primary/10 text-base px-4"
          >
            {isSubmitting ? "저장중..." : "저장"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="wordbook-name" className="text-sm font-medium text-muted-foreground px-1">
            단어장 이름
          </Label>
          <Input
            id="wordbook-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 토익 필수 단어"
            className="h-12 text-base rounded-lg border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card shadow-none"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wordbook-category" className="text-sm font-medium text-muted-foreground px-1">
            카테고리
          </Label>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger
              id="wordbook-category"
              className="h-12 text-base rounded-lg border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card shadow-none"
            >
              <SelectValue placeholder="카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-base">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="wordbook-description" className="text-sm font-medium text-muted-foreground px-1">
            설명 (선택)
          </Label>
          <Textarea
            id="wordbook-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 단어장에 대한 간단한 설명을 입력하세요."
            className="text-base rounded-lg border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card shadow-none"
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
>>>>>>> db7745a (다크모드, 프로필 설정)
