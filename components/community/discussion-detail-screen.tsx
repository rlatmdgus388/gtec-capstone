"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Heart, MessageCircle, Send, MoreVertical, Edit, Trash2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { CreatePostDialog } from "./create-post-dialog";

// --- 인터페이스 정의 ---
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
    likedBy?: string[];
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
    const [isLiked, setIsLiked] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
    const [isMyPost, setIsMyPost] = useState(false);

    const currentUserId = auth.currentUser?.uid;

    const fetchPost = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/community/discussions/${postId}`);
            if (!response.ok) throw new Error("Post not found");
            const data = await response.json();
            setPost(data);
            setIsLiked(data.likedBy?.includes(currentUserId) ?? false);
            setIsMyPost(data.author.uid === currentUserId);
        } catch (error) {
            console.error("Failed to fetch post details:", error); setPost(null);
        } finally {
            setIsLoading(false);
        }
    }, [postId, currentUserId]);

    useEffect(() => { fetchPost(); }, [fetchPost]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const addedComment = await fetchWithAuth(`/api/community/discussions/${postId}/comments`, {
                method: 'POST', body: JSON.stringify({ content: newComment }),
            });
            setPost(prevPost => prevPost ? { ...prevPost, comments: [...prevPost.comments, addedComment] } : null);
            setNewComment("");
        } catch (error) {
            console.error("Failed to submit comment:", error); alert("댓글 작성에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async () => {
        if (!post) return;
        try {
            const response = await fetchWithAuth(`/api/community/discussions/${post.id}/like`, { method: 'POST' });
            if (response) {
                setPost(prev => prev ? { ...prev, likes: response.likes, likedBy: response.likedBy } : null);
                setIsLiked(response.likedBy?.includes(currentUserId) ?? false);
            }
        } catch (error) { console.error("'좋아요' 처리 실패:", error); }
    };

    const handleDeletePost = async () => {
        try {
            await fetchWithAuth(`/api/community/discussions/${postId}`, { method: 'DELETE' });
            alert('게시글이 삭제되었습니다.');
            onBack();
        } catch (error) {
            console.error('게시글 삭제 실패:', error); alert('게시글 삭제에 실패했습니다.');
        }
    };

    const handleCommentUpdate = async () => {
        if (!editingComment) return;
        setIsSubmitting(true);
        try {
            const updatedComment = await fetchWithAuth(`/api/community/discussions/${postId}/comments/${editingComment.id}`, {
                method: 'PUT', body: JSON.stringify({ content: editingComment.content }),
            });
            setPost(prevPost => prevPost ? { ...prevPost, comments: prevPost.comments.map(c => c.id === editingComment.id ? updatedComment : c) } : null);
            setEditingComment(null);
        } catch (error) {
            console.error("댓글 수정 실패:", error); alert("댓글 수정에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCommentDelete = async (commentId: string) => {
        try {
            await fetchWithAuth(`/api/community/discussions/${postId}/comments/${commentId}`, { method: 'DELETE' });
            setPost(prevPost => prevPost ? { ...prevPost, comments: prevPost.comments.filter(c => c.id !== commentId) } : null);
            alert("댓글이 삭제되었습니다.");
        } catch (error) {
            console.error("댓글 삭제 실패:", error); alert("댓글 삭제에 실패했습니다.");
        }
    };

    const timeAgo = (dateString: string) => {
        const now = new Date(); const past = new Date(dateString);
        const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
        let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + "년 전";
        interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + "달 전";
        interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + "일 전";
        interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + "시간 전";
        interval = seconds / 60; if (interval > 1) return Math.floor(interval) + "분 전";
        return "방금 전";
    };

    if (isLoading) return <div className="p-4 space-y-4"><Skeleton className="h-10 w-20" /><Skeleton className="h-40 w-full" /><Skeleton className="h-24 w-full" /></div>;
    if (!post) return <div className="flex flex-col items-center justify-center h-full"><p className="mb-4">게시글을 찾을 수 없습니다.</p><Button onClick={onBack}>목록으로</Button></div>;

    return (
        <div className="flex-1 overflow-y-auto pb-20 bg-gray-50">
            {isMyPost && <CreatePostDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} onPostCreatedOrUpdated={fetchPost} postToEdit={post} />}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="flex items-center p-4"><Button variant="ghost" size="sm" onClick={onBack} className="mr-2"><ArrowLeft className="h-5 w-5" /></Button><h1 className="font-semibold text-gray-900 truncate">{post.title}</h1></div>
            </div>
            <div className="p-4 space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <Avatar><AvatarImage src={post.author.photoURL} /><AvatarFallback>{post.author.name[0]}</AvatarFallback></Avatar>
                            <div className="flex-1"><div className="font-semibold">{post.author.name}</div><div className="text-xs text-gray-500">{timeAgo(post.createdAt)}</div></div>
                            <div className="flex items-center gap-2"><Badge variant="outline">{post.category}</Badge>
                                {isMyPost && (
                                    <Drawer>
                                        <DrawerTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DrawerTrigger>
                                        <DrawerContent><div className="mx-auto w-full max-w-sm">
                                            <div className="p-2">
                                                <DrawerClose asChild><Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => setIsEditDialogOpen(true)}><Edit className="mr-2 h-4 w-4" />수정</Button></DrawerClose>
                                                <DrawerClose asChild><Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm text-destructive hover:text-destructive" onClick={handleDeletePost}><Trash2 className="mr-2 h-4 w-4" />삭제</Button></DrawerClose>
                                            </div>
                                            <DrawerFooter className="pt-2"><DrawerClose asChild><Button variant="outline">취소</Button></DrawerClose></DrawerFooter>
                                        </div></DrawerContent>
                                    </Drawer>
                                )}
                            </div>
                        </div>
                        <CardTitle className="pt-4">{post.title}</CardTitle>
                    </CardHeader>
                    {/* --- 게시글 본문 수정 --- */}
                    <CardContent><p className="text-gray-700 whitespace-pre-wrap">{post.content}</p></CardContent>
                    <CardFooter className="flex gap-4">
                        <Button variant="ghost" size="sm" className={`text-gray-600 ${isLiked ? 'text-red-500' : ''}`} onClick={handleLike}><Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />{post.likes}</Button>
                        <Button variant="ghost" size="sm" className="text-gray-600"><MessageCircle className="h-4 w-4 mr-2" />{post.comments.length}</Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardContent className="p-4"><div className="flex items-start gap-2">
                        <Textarea placeholder="댓글을 입력하세요..." className="flex-1" rows={1} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                        <Button onClick={handleCommentSubmit} disabled={isSubmitting}><Send className="h-4 w-4" /></Button>
                    </div></CardContent>
                </Card>
                <div className="space-y-3">
                    {post.comments.map(comment => (
                        <Card key={comment.id} className="bg-white">
                            <CardContent className="p-3"><div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8"><AvatarImage src={comment.author.photoURL} /><AvatarFallback className="text-xs">{comment.author.name[0]}</AvatarFallback></Avatar>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between">
                                        <div className="flex items-baseline gap-2"><span className="font-semibold text-sm">{comment.author.name}</span><span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span></div>
                                        {comment.author.uid === currentUserId && (
                                            <Drawer>
                                                <DrawerTrigger asChild><Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreVertical className="h-4 w-4" /></Button></DrawerTrigger>
                                                <DrawerContent><div className="mx-auto w-full max-w-sm">
                                                    <div className="p-2">
                                                        <DrawerClose asChild><Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => setEditingComment({ id: comment.id, content: comment.content })}><Edit className="mr-2 h-4 w-4" />수정</Button></DrawerClose>
                                                        <DrawerClose asChild><Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm text-destructive hover:text-destructive" onClick={() => handleCommentDelete(comment.id)}><Trash2 className="mr-2 h-4 w-4" />삭제</Button></DrawerClose>
                                                    </div>
                                                    <DrawerFooter className="pt-2"><DrawerClose asChild><Button variant="outline">취소</Button></DrawerClose></DrawerFooter>
                                                </div></DrawerContent>
                                            </Drawer>
                                        )}
                                    </div>
                                    {editingComment?.id === comment.id ? (
                                        <div className="mt-2 space-y-2">
                                            <Textarea value={editingComment.content} onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })} rows={2} />
                                            <div className="flex gap-2 justify-end"><Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>취소</Button><Button size="sm" onClick={handleCommentUpdate} disabled={isSubmitting}>저장</Button></div>
                                        </div>
                                    ) : (
                                        /* --- 댓글 내용 수정 --- */
                                        <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{comment.content}</p>
                                    )}
                                </div>
                            </div></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}