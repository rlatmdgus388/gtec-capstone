"use client"

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchWithAuth } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Wordbook {
    id: number;
    name: string;
    wordCount: number;
    category: string;
    description?: string;
}

interface ShareWordbookDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onShared: () => void;
}

export function ShareWordbookDialog({ open, onOpenChange, onShared }: ShareWordbookDialogProps) {
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedWordbook, setSelectedWordbook] = useState<Wordbook | null>(null);

    useEffect(() => {
        if (open) {
            const fetchUserWordbooks = async () => {
                setIsLoading(true);
                try {
                    const data = await fetchWithAuth('/api/wordbooks');
                    setWordbooks(data || []);
                } catch (error) {
                    console.error("사용자 단어장 목록 조회 실패:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUserWordbooks();
        }
    }, [open]);

    const handleShare = async () => {
        if (!selectedWordbook) {
            alert("공유할 단어장을 선택해주세요.");
            return;
        }

        try {
            // 공유 전에 선택한 단어장의 모든 단어 정보를 가져옵니다.
            const wordbookDetails = await fetchWithAuth(`/api/wordbooks/${selectedWordbook.id}`);
            const words = wordbookDetails.words || [];

            // 단어 정보를 포함하여 공유 API를 호출합니다.
            await fetchWithAuth('/api/community/wordbooks', {
                method: 'POST',
                body: JSON.stringify({
                    wordbookId: selectedWordbook.id,
                    name: selectedWordbook.name,
                    description: selectedWordbook.description || '',
                    category: selectedWordbook.category,
                    wordCount: words.length,
                    words: words,
                }),
            });
            alert(`'${selectedWordbook.name}' 단어장이 공유되었습니다.`);
            onShared(); // 공유 성공 후 목록 새로고침
            onOpenChange(false); // 팝업 닫기
            setSelectedWordbook(null);
        } catch (error) {
            console.error("단어장 공유 실패:", error);
            alert("단어장 공유에 실패했습니다.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>단어장 공유하기</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-500 mb-4">공유할 단어장을 선택하세요.</p>
                    <ScrollArea className="h-72">
                        <div className="pr-4 space-y-2">
                            {isLoading ? (
                                <>
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </>
                            ) : wordbooks.length > 0 ? (
                                wordbooks.map((wb) => (
                                    <Card
                                        key={wb.id}
                                        className={`cursor-pointer transition-colors ${selectedWordbook?.id === wb.id ? "border-primary bg-primary/10" : ""
                                            }`}
                                        onClick={() => setSelectedWordbook(wb)}
                                    >
                                        <CardContent className="p-3">
                                            <h4 className="font-semibold">{wb.name}</h4>
                                            <p className="text-sm text-gray-500">{wb.wordCount} 단어</p>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-10">공유할 단어장이 없습니다.</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={() => setSelectedWordbook(null)}>취소</Button>
                    </DialogClose>
                    <Button onClick={handleShare} disabled={!selectedWordbook}>
                        선택한 단어장 공유
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
