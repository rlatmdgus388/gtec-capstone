"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Plus, Camera } from "lucide-react"
import { CreateWordbookDialog } from "./create-wordbook-dialog"
import { WordbookDetail } from "./wordbook-detail"
import { PhotoWordCapture } from "@/components/camera/photo-word-capture"
import { ImageSelectionModal } from "@/components/camera/image-selection-modal"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

// 단어장 타입 정의
interface Wordbook {
    id: string;
    name: string;
    description?: string;
    wordCount: number;
    progress: number;
    category: string;
    createdAt: string;
}

interface VocabularyScreenProps {
    selectedWordbookId?: string | null;
    onNavigateToStudy: (wordbook: Wordbook) => void;
}

export function VocabularyScreen({ selectedWordbookId, onNavigateToStudy }: VocabularyScreenProps) {
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedWordbook, setSelectedWordbook] = useState<Wordbook | null>(null);
    const [showPhotoCapture, setShowPhotoCapture] = useState(false);
    const [showImageSelection, setShowImageSelection] = useState(false);
    const [selectedImageData, setSelectedImageData] = useState<string | null>(null);

    // 단어장 목록을 불러오는 함수
    const fetchWordbooks = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchWithAuth('/api/wordbooks');
            setWordbooks(data);
        } catch (error) {
            console.error("단어장 목록을 불러오는데 실패했습니다:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWordbooks();
    }, [fetchWordbooks]);

    // AuthManager로부터 특정 단어장 ID를 받으면 해당 단어장 상세 화면으로 바로 이동
    useEffect(() => {
        if (selectedWordbookId && wordbooks.length > 0) {
            const wordbook = wordbooks.find((wb) => wb.id === selectedWordbookId);
            if (wordbook) {
                setSelectedWordbook(wordbook);
            }
        }
    }, [selectedWordbookId, wordbooks]);

    const filteredWordbooks = wordbooks.filter((wordbook) =>
        wordbook.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // 새 단어장 생성 핸들러
    const handleCreateWordbook = async (newWordbookData: { name: string; description: string; category: string }) => {
        try {
            await fetchWithAuth('/api/wordbooks', {
                method: 'POST',
                body: JSON.stringify(newWordbookData)
            });
            fetchWordbooks(); // 목록 새로고침
        } catch (error) {
            console.error("단어장 생성 실패:", error);
            alert("단어장 생성에 실패했습니다.")
        }
    };

    const handleWordbookClick = (wordbook: Wordbook) => {
        setSelectedWordbook(wordbook);
    };

    const handlePhotoCaptureClick = () => setShowImageSelection(true);

    const handleCameraSelect = () => {
        setShowImageSelection(false);
        setSelectedImageData(null);
        setShowPhotoCapture(true);
    };

    const handleGallerySelect = () => {
        setShowImageSelection(false);
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const imageData = readerEvent.target?.result as string;
                    setSelectedImageData(imageData);
                    setShowPhotoCapture(true);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleWordsAdded = (words: any[], wordbookId: number | string) => {
        console.log("Words added:", words, "to wordbook:", wordbookId);
        fetchWordbooks(); // 단어 추가 후 목록 새로고침
    };

    // 상세 화면 뷰
    if (selectedWordbook) {
        return <WordbookDetail wordbook={selectedWordbook} onBack={() => setSelectedWordbook(null)} onUpdate={fetchWordbooks} />;
    }

    // 사진 촬영 뷰
    if (showPhotoCapture) {
        return <PhotoWordCapture imageData={selectedImageData} onClose={() => setShowPhotoCapture(false)} onWordsAdded={handleWordsAdded} />;
    }

    // 기본 단어장 목록 뷰
    return (
        <div className="flex-1 overflow-y-auto pb-20 bg-white">
            <ImageSelectionModal
                open={showImageSelection}
                onClose={() => setShowImageSelection(false)}
                onCameraSelect={handleCameraSelect}
                onGallerySelect={handleGallerySelect}
            />

            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="px-4 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-xl flex items-center justify-center">
                            <BookOpen size={24} className="text-[#FF7A00]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-black">단어장</h1>
                            <p className="text-sm text-gray-600">나만의 단어장을 관리하세요</p>
                        </div>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            placeholder="단어장 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 bg-gray-50 border-0 rounded-full text-base placeholder:text-gray-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <CreateWordbookDialog onCreateWordbook={handleCreateWordbook} />
                        <Button
                            variant="outline"
                            className="h-12 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium"
                            onClick={handlePhotoCaptureClick}
                        >
                            <Camera size={18} />
                            사진으로 추가
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 space-y-3">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                ) : filteredWordbooks.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">단어장이 없습니다</h3>
                        <p className="text-sm text-gray-600 mb-6">첫 번째 단어장을 만들어보세요</p>
                        <CreateWordbookDialog onCreateWordbook={handleCreateWordbook} />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredWordbooks.map((wordbook) => (
                            <Card
                                key={wordbook.id}
                                className="bg-white border border-gray-200 hover:shadow-md transition-all cursor-pointer rounded-xl"
                                onClick={() => handleWordbookClick(wordbook)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 text-base">{wordbook.name}</h3>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs bg-[#FF7A00]/10 text-[#FF7A00] border-0 rounded-full"
                                                >
                                                    {wordbook.category}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">{wordbook.wordCount}개 단어</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 mr-4">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-600">학습 진도</span>
                                                <span className="font-semibold text-[#FF7A00]">{wordbook.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full">
                                                <div
                                                    className="h-full bg-[#FF7A00] rounded-full transition-all"
                                                    style={{ width: `${wordbook.progress}%` }}
                                                />
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
    )
}
