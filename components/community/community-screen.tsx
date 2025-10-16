"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MessageCircle, Heart, BookOpen, Search, Download, PlusCircle, MoreVertical, Edit, Trash2 } from "lucide-react"
import { UserProfile } from "./user-profile"
import { SharedWordbookDetail } from "./shared-wordbook-detail"
import { DiscussionDetailScreen } from "./discussion-detail-screen"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { CreatePostDialog } from "./create-post-dialog"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

// --- 인터페이스 정의 ---
interface SharedWordbook {
  id: string;
  name: string;
  author: { uid: string; name: string; };
  wordCount: number;
  likes: number;
  downloads: number;
  category: string;
}

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  author: { uid: string; name: string; };
  replies: number;
  likes: number;
  createdAt: string;
  category: string;
}

const ALL_CATEGORIES = ["기초", "시험", "회화", "비즈니스", "여행", "학술", "전문", "기타"].sort();
const FILTER_CATEGORIES = [{ label: "전체", value: "all" }, ...ALL_CATEGORIES.map(c => ({ label: c, value: c }))];

export function CommunityScreen() {
  const [currentView, setCurrentView] = useState<"main" | "profile" | "wordbook" | "discussion">("main");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedWordbookId, setSelectedWordbookId] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [sharedWordbooks, setSharedWordbooks] = useState<SharedWordbook[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [isLoading, setIsLoading] = useState({ wordbooks: true, discussions: true });

  const [postToEdit, setPostToEdit] = useState<DiscussionPost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const currentUserId = auth.currentUser?.uid;

  const fetchSharedWordbooks = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, wordbooks: true }));
    try {
      const response = await fetch('/api/community/wordbooks');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSharedWordbooks(data);
    } catch (error) {
      console.error("공유 단어장 목록 조회 실패:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, wordbooks: false }));
    }
  }, []);

  const fetchDiscussions = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, discussions: true }));
    try {
      const data = await fetchWithAuth('/api/community/discussions');
      setDiscussions(data || []);
    } catch (error) {
      console.error("게시글 목록 조회 실패:", error);
      setDiscussions([]);
    } finally {
      setIsLoading(prev => ({ ...prev, discussions: false }));
    }
  }, []);

  useEffect(() => {
    if (currentView === "main") {
      fetchSharedWordbooks();
      fetchDiscussions();
    }
  }, [currentView, fetchSharedWordbooks, fetchDiscussions]);

  const filteredWordbooks = sharedWordbooks.filter((wordbook) => {
    const matchesSearch = wordbook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wordbook.author && wordbook.author.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || wordbook.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleViewProfile = (userId: string) => { setSelectedUserId(userId); setCurrentView("profile"); };
  const handleViewWordbook = (wordbookId: string) => { setSelectedWordbookId(wordbookId); setCurrentView("wordbook"); };
  const handleViewDiscussion = (postId: string) => { setSelectedPostId(postId); setCurrentView("discussion"); };
  const handleBackToMain = () => { setCurrentView("main"); setSelectedPostId(""); setSelectedUserId(""); setSelectedWordbookId(""); };

  const handleEditClick = (post: DiscussionPost) => {
    setPostToEdit(post);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (postId: string) => {
    try {
      await fetchWithAuth(`/api/community/discussions/${postId}`, { method: 'DELETE' });
      alert('게시글이 삭제되었습니다.');
      fetchDiscussions(); // 목록 새로고침
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  if (currentView === "profile") return <UserProfile userId={selectedUserId} onBack={handleBackToMain} />
  if (currentView === "wordbook") return <SharedWordbookDetail wordbookId={selectedWordbookId} onBack={handleBackToMain} />
  if (currentView === "discussion") return <DiscussionDetailScreen postId={selectedPostId} onBack={handleBackToMain} />;

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-white">
      {/* --- Dialogs --- */}
      <CreatePostDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        postToEdit={postToEdit}
        onPostCreatedOrUpdated={() => { setIsEditDialogOpen(false); setPostToEdit(null); fetchDiscussions(); }}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-xl flex items-center justify-center"><Users size={24} className="text-[#FF7A00]" /></div>
            <div><h1 className="text-2xl font-bold text-black">커뮤니티</h1><p className="text-sm text-gray-600">다른 사용자들과 단어장을 공유하세요</p></div>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input placeholder="단어장 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-11 h-11 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500" />
          </div>
          <ScrollArea className="w-full whitespace-nowrap pb-2"><div className="flex w-max space-x-2">
            {FILTER_CATEGORIES.map((category) => (<Badge key={category.value} variant={selectedCategory === category.value ? "default" : "secondary"} onClick={() => setSelectedCategory(category.value)} className={`cursor-pointer transition-colors text-sm px-3 py-1 ${selectedCategory === category.value ? "bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white border-0" : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"}`}>{category.label}</Badge>))}
          </div><ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Shared Wordbooks */}
        <div>
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold flex items-center gap-2"><BookOpen size={20} className="text-[#FF7A00]" /> 공유 단어장 ({filteredWordbooks.length}개)</h2></div>
          {isLoading.wordbooks ? <div className="space-y-3"><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-24 w-full rounded-xl" /></div> : filteredWordbooks.length === 0 ? <Card className="text-center py-12 border border-gray-200 rounded-xl"><CardContent><Search size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">결과가 없습니다</h3><p className="text-sm text-gray-600">검색어나 필터를 변경해보세요.</p></CardContent></Card> : <div className="space-y-3">{filteredWordbooks.map((wordbook) => <Card key={wordbook.id} className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-gray-200 rounded-xl" onClick={() => handleViewWordbook(wordbook.id)}><CardContent className="p-4"><div className="flex items-start justify-between mb-3"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><h3 className="font-medium text-black">{wordbook.name}</h3><Badge variant="secondary" className="text-xs bg-[#FF7A00]/10 text-[#FF7A00] border-0">{wordbook.category}</Badge></div><p className="text-sm text-gray-600 cursor-pointer hover:text-[#FF7A00]" onClick={(e) => { e.stopPropagation(); handleViewProfile(wordbook.author.uid); }}>by {wordbook.author.name}</p><p className="text-sm text-gray-600">{wordbook.wordCount}개 단어</p></div></div><div className="flex items-center gap-4 text-sm text-gray-600"><span className="flex items-center gap-1"><Heart size={14} />{wordbook.likes}</span><span className="flex items-center gap-1"><Download size={14} />{wordbook.downloads}</span></div></CardContent></Card>)}</div>}
        </div>

        {/* Discussion Board */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MessageCircle size={20} className="text-[#FF7A00]" /> 토론 게시판</h2>
            <CreatePostDialog onPostCreatedOrUpdated={fetchDiscussions}><Button variant="ghost" size="sm" className="text-[#FF7A00] hover:bg-[#FF7A00]/10"><PlusCircle size={16} className="mr-2" />글쓰기</Button></CreatePostDialog>
          </div>
          {isLoading.discussions ? <div className="space-y-3"><Skeleton className="h-20 w-full rounded-xl" /><Skeleton className="h-20 w-full rounded-xl" /></div> : discussions.length === 0 ? <Card className="text-center py-12 border border-gray-200 rounded-xl"><CardContent><MessageCircle size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">게시글이 없습니다</h3><p className="text-sm text-gray-600">첫 번째 게시글을 작성해보세요!</p></CardContent></Card> : <div className="space-y-3">
            {discussions.map((discussion) => (
              <Card key={discussion.id} className="bg-white border border-gray-200 rounded-xl">
                <div className="flex items-start gap-3 p-4" onClick={() => handleViewDiscussion(discussion.id)}>
                  <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-[#FF7A00]/10 text-[#FF7A00]">{discussion.author.name[0]}</AvatarFallback></Avatar>
                  <div className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1"><h3 className="font-medium text-black text-sm">{discussion.title}</h3><Badge variant="outline" className="text-xs border-gray-200">{discussion.category}</Badge></div>
                    <div className="flex items-center gap-4 text-xs text-gray-600"><span>{discussion.author.name}</span><span>{timeAgo(discussion.createdAt)}</span><span className="flex items-center gap-1"><MessageCircle size={12} />{discussion.replies}</span><span className="flex items-center gap-1"><Heart size={12} />{discussion.likes}</span></div>
                  </div>
                  {currentUserId === discussion.author.uid && (
                    <Drawer>
                      <DrawerTrigger asChild onClick={(e) => e.stopPropagation()}><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DrawerTrigger>
                      <DrawerContent><div className="mx-auto w-full max-w-sm">
                        <div className="p-2">
                          <DrawerClose asChild><Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm" onClick={() => handleEditClick(discussion)}><Edit className="mr-2 h-4 w-4" />수정</Button></DrawerClose>
                          <DrawerClose asChild><Button variant="ghost" className="w-full justify-start p-2 h-12 text-sm text-destructive hover:text-destructive" onClick={() => handleDeleteClick(discussion.id)}><Trash2 className="mr-2 h-4 w-4" />삭제</Button></DrawerClose>
                        </div>
                        <DrawerFooter className="pt-2"><DrawerClose asChild><Button variant="outline">취소</Button></DrawerClose></DrawerFooter>
                      </div></DrawerContent>
                    </Drawer>
                  )}
                </div>
              </Card>
            ))}
          </div>}
        </div>
      </div>
    </div>
  )
}