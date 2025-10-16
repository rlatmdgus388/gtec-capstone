"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle, Heart, PlusCircle, Eye } from "lucide-react";
import { CreatePostDialog } from "./create-post-dialog"; // 글쓰기 팝업 import
import { DiscussionDetailScreen } from "./discussion-detail-screen";
import { fetchWithAuth } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface DiscussionPost {
    id: string;
    title: string;
    author: { uid: string; name: string; };
    replies: number;
    likes: number;
    views: number;
    createdAt: string;
    category: string;
}

const CATEGORIES = ["전체", "학습팁", "질문", "자유"];

export function DiscussionsScreen({ onBack }: { onBack: () => void }) {
    const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); // 글쓰기 팝업 상태
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    const fetchDiscussions = useCallback(async () => {
        setIsLoading(true);
        try {
            // 좋아요 순으로 정렬된 데이터를 가져옵니다.
            const data = await fetchWithAuth('/api/community/discussions?sortBy=likes');
            setDiscussions(data || []);
        } catch (error) {
            console.error("게시글 목록 조회 실패:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDiscussions();
    }, [fetchDiscussions]);

    const filteredDiscussions = discussions.filter(
        (post) => selectedCategory === "전체" || post.category === selectedCategory
    );

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "년 전";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "달 전";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "일 전";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "시간 전";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "분 전";
        return "방금 전";
    };

    if (selectedPostId) {
        return <DiscussionDetailScreen postId={selectedPostId} onBack={() => { setSelectedPostId(null); fetchDiscussions(); }} />;
    }

    return (
        <>
            <CreatePostDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onPostCreatedOrUpdated={() => {
                    setIsCreateDialogOpen(false);
                    fetchDiscussions();
                }}
            />

            <div className="flex-1 overflow-y-auto pb-20 bg-white">
                {/* Header */}
                <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                    <div className="flex items-center p-4">
                        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-semibold text-gray-900 text-lg">토론 게시판</h1>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            {CATEGORIES.map(category => (
                                <Badge
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "secondary"}
                                    onClick={() => setSelectedCategory(category)}
                                    className="cursor-pointer"
                                >
                                    {category}
                                </Badge>
                            ))}
                        </div>
                        <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                            <PlusCircle size={16} className="mr-2" />
                            글쓰기
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" />
                        </div>
                    ) : filteredDiscussions.length === 0 ? (
                        <Card className="text-center py-16 border-dashed"><CardContent><MessageCircle size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">게시글이 없습니다</h3><p className="text-sm text-gray-600">첫 번째 게시글을 작성해보세요.</p></CardContent></Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredDiscussions.map((discussion) => (
                                <Card key={discussion.id} onClick={() => setSelectedPostId(discussion.id)} className="cursor-pointer">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="w-8 h-8"><AvatarFallback>{discussion.author.name[0]}</AvatarFallback></Avatar>
                                            <div className="flex-1">
                                                <h3 className="font-medium">{discussion.title}</h3>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                    <span>{discussion.author.name}</span>
                                                    <span>{timeAgo(discussion.createdAt)}</span>
                                                    <span className="flex items-center gap-1"><Heart size={12} />{discussion.likes}</span>
                                                    <span className="flex items-center gap-1"><Eye size={12} />{discussion.views}</span>
                                                    <span className="flex items-center gap-1"><MessageCircle size={12} />{discussion.replies}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}