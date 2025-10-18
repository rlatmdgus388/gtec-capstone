"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchWithAuth } from "@/lib/api"
import { PlusCircle, Edit } from "lucide-react"

interface PostData {
    id?: string;
    title: string;
    content: string;
    category: string;
}

interface CreatePostDialogProps {
    onPostCreatedOrUpdated: () => void;
    postToEdit?: PostData | null;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const CATEGORIES = ["학습팁", "질문", "자유"];

export function CreatePostDialog({
    onPostCreatedOrUpdated,
    postToEdit,
    children,
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: CreatePostDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
    const isEditMode = !!postToEdit;

    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    useEffect(() => {
        if (open && isEditMode) {
            setTitle(postToEdit.title);
            setContent(postToEdit.content);
            setCategory(postToEdit.category);
        }
    }, [postToEdit, isEditMode, open]);

    const resetForm = () => {
        setTitle("");
        setContent("");
        setCategory("");
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetForm();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || !category) {
            alert("모든 필드를 입력해주세요.");
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
            handleOpenChange(false); // 성공 시 다이얼로그 닫기
        } catch (error) {
            console.error("게시글 처리 실패:", error);
            alert(`게시글 ${isEditMode ? '수정' : '등록'}에 실패했습니다.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEditMode ? <Edit className="text-primary" /> : <PlusCircle className="text-primary" />}
                        {isEditMode ? "게시글 수정" : "새로운 게시글 작성"}
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
                        <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>취소</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? '저장 중...' : (isEditMode ? '수정하기' : '등록하기')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
