// components/community/create-post-dialog.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchWithAuth } from "@/lib/api"
import { PlusCircle } from "lucide-react"

interface CreatePostDialogProps {
    onPostCreated: () => void; // 글 작성 성공 시 호출될 함수
    children: React.ReactNode;
}

const CATEGORIES = ["학습팁", "질문", "자유"];

export function CreatePostDialog({ onPostCreated, children }: CreatePostDialogProps) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || !category) {
            alert("모든 필드를 입력해주세요.");
            return;
        }
        setIsLoading(true);
        try {
            await fetchWithAuth('/api/community/discussions', {
                method: 'POST',
                body: JSON.stringify({ title, content, category }),
            });
            alert("게시글이 성공적으로 등록되었습니다.");
            // 상태 초기화 및 팝업 닫기
            setTitle("");
            setContent("");
            setCategory("");
            setOpen(false);
            onPostCreated(); // 부모 컴포넌트에 알림
        } catch (error) {
            console.error("게시글 등록 실패:", error);
            alert("게시글 등록에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PlusCircle className="text-primary" />
                        새로운 게시글 작성
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">제목</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">카테고리</Label>
                        <Select onValueChange={setCategory} value={category} required>
                            <SelectTrigger>
                                <SelectValue placeholder="카테고리를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">내용</Label>
                        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" required rows={5} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">취소</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>{isLoading ? '등록 중...' : '등록하기'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}