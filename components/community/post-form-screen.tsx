"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchWithAuth } from "@/lib/api"
import { PlusCircle, Edit, ArrowLeft } from "lucide-react"

interface PostData {
    id?: string;
    title: string;
    content: string;
    category: string;
}

interface PostFormScreenProps {
    onPostCreatedOrUpdated: () => void;
    onBack: () => void;
    postToEdit?: PostData | null;
}

const CATEGORIES = ["학습팁", "질문", "자유"];

export function PostFormScreen({
    onPostCreatedOrUpdated,
    onBack,
    postToEdit,
}: PostFormScreenProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isEditMode = !!postToEdit;

    // create-wordbook-screen과 동일한 'canSubmit' 로직 추가
    const canSubmit = title.trim() !== "" && category.trim() !== "" && content.trim() !== "";

    useEffect(() => {
        if (isEditMode) {
            setTitle(postToEdit.title);
            setContent(postToEdit.content);
            setCategory(postToEdit.category);
        }
    }, [postToEdit, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // form 태그의 onSubmit을 대비
        if (!canSubmit) {
            alert("제목, 카테고리, 내용은 필수입니다.");
            return;
        }
        setIsLoading(true);
        try {
            if (isEditMode && postToEdit?.id) {
                await fetchWithAuth(`/api/community/discussions/${postToEdit.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ title, content, category }),
                });
                alert("게시글이 성공적으로 수정되었습니다.");
            } else {
                await fetchWithAuth('/api/community/discussions', {
                    method: 'POST',
                    body: JSON.stringify({ title, content, category }),
                });
                alert("게시글이 성공적으로 등록되었습니다.");
            }
            onPostCreatedOrUpdated();
        } catch (error) {
            console.error("게시글 처리 실패:", error);
            alert(`게시글 ${isEditMode ? '수정' : '등록'}에 실패했습니다.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background">
            {/* [수정] Header: create-wordbook-screen과 동일한 구조 */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="flex items-center justify-between px-2 py-2 h-16">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
                        <ArrowLeft size={22} className="text-foreground" />
                    </Button>
                    <h1 className="text-xl font-bold text-foreground">
                        {isEditMode ? "게시글 수정" : "새 게시글"}
                    </h1>
                    <Button
                        variant="ghost"
                        onClick={handleSubmit}
                        disabled={!canSubmit || isLoading}
                        className="text-primary font-bold hover:bg-primary/10 text-base px-4"
                    >
                        {isLoading ? "저장중..." : (isEditMode ? "수정" : "저장")}
                    </Button>
                </div>
            </div>

            {/* [수정] Form: create-wordbook-screen과 동일한 구조 및 스타일 */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="post-title" className="text-sm font-medium text-muted-foreground px-1">
                        제목
                    </Label>
                    <Input
                        id="post-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className="h-12 text-base rounded-lg border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card shadow-none"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="post-category" className="text-sm font-medium text-muted-foreground px-1">
                        카테고리
                    </Label>
                    <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger
                            id="post-category"
                            className="h-12 text-base rounded-lg border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card shadow-none"
                        >
                            <SelectValue placeholder="카테고리를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-base">{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="post-content" className="text-sm font-medium text-muted-foreground px-1">
                        내용
                    </Label>
                    <Textarea
                        id="post-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 입력하세요"
                        className="text-base rounded-lg border-0 bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card shadow-none"
                        rows={10}
                        required
                    />
                </div>
            </form>

            {/* [수정] 하단 고정 버튼 삭제 */}
        </div>
    );
}