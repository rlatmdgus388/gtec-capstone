"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Heart, MessageCircle, Send } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Author {
    uid: string;
    name: string;
    photoURL?: string;
}

interface Comment {
    id: string;
    content: string;
    author: Author;
    createdAt: string;
}

interface Post extends Comment {
    title: string;
    category: string;
    likes: number;
    comments: Comment[];
}

interface DiscussionDetailScreenProps {
    postId: string;
    onBack: () => void;
}

export function DiscussionDetailScreen({ postId, onBack }: DiscussionDetailScreenProps) {
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/community/discussions/${postId}`);
                if (!response.ok) throw new Error("Post not found");
                const data = await response.json();
                setPost(data);
            } catch (error) {
                console.error("Failed to fetch post details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const addedComment = await fetchWithAuth(`/api/community/discussions/${postId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ content: newComment }),
            });
            setPost(prevPost => prevPost ? { ...prevPost, comments: [...prevPost.comments, addedComment] } : null);
            setNewComment("");
        } catch (error) {
            console.error("Failed to submit comment:", error);
            alert("댓글 작성에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

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


    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    if (!post) {
        return <div>게시글을 찾을 수 없습니다.</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto pb-20 bg-gray-50">
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="flex items-center p-4">
                    <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="font-semibold text-gray-900 truncate">{post.title}</h1>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Post Content */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <Avatar>
                                <AvatarImage src={post.author.photoURL} />
                                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="font-semibold">{post.author.name}</div>
                                <div className="text-xs text-gray-500">{timeAgo(post.createdAt)}</div>
                            </div>
                            <Badge variant="outline">{post.category}</Badge>
                        </div>
                        <CardTitle className="pt-4">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-600"><Heart className="h-4 w-4 mr-2" />{post.likes}</Button>
                        <Button variant="ghost" size="sm" className="text-gray-600"><MessageCircle className="h-4 w-4 mr-2" />{post.comments.length}</Button>
                    </CardFooter>
                </Card>

                {/* Comment Form */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                            <Textarea
                                placeholder="댓글을 입력하세요..."
                                className="flex-1"
                                rows={1}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <Button onClick={handleCommentSubmit} disabled={isSubmitting}><Send className="h-4 w-4" /></Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-3">
                    {post.comments.map(comment => (
                        <Card key={comment.id} className="bg-white">
                            <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.author.photoURL} />
                                        <AvatarFallback className="text-xs">{comment.author.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-semibold text-sm">{comment.author.name}</span>
                                            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
