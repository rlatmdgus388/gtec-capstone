// components/settings/export-screen.tsx
"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, BookDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card" // [!!!] Card, CardContent 임포트

interface Wordbook {
    id: string
    name: string
    wordCount: number
}

interface ExportScreenProps {
    onBack: () => void
}

export function ExportScreen({ onBack }: ExportScreenProps) {
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        const loadWordbooks = async () => {
            setIsLoading(true);
            try {
                const data = await fetchWithAuth("/api/wordbooks");
                setWordbooks(data || []);
            } catch (error) {
                toast({
                    title: "오류",
                    description: "단어장 목록을 불러오지 못했습니다.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadWordbooks();
    }, [toast]);

    const handleExport = async (wordbookId: string, wordbookName: string) => {
        if (isExporting) return
        setIsExporting(wordbookId)

        try {
            const user = auth.currentUser
            if (!user) {
                throw new Error("로그인이 필요합니다.")
            }
            const idToken = await user.getIdToken(true)

            const response = await fetch(
                `/api/wordbooks/${wordbookId}/export`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            )

            if (!response.ok) {
                try {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "파일 다운로드에 실패했습니다.")
                } catch (jsonError) {
                    throw new Error(await response.text() || "파일 다운로드에 실패했습니다.")
                }
            }

            const safeFilename = wordbookName.replace(/[\\/:*?"<>|]/g, '_') + '.csv';

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = safeFilename
            document.body.appendChild(a)
            a.click()

            window.URL.revokeObjectURL(url)
            a.remove()

            toast({
                title: "내보내기 성공",
                description: `${wordbookName} 단어장이 ${safeFilename}로 저장되었습니다.`,
            })
        } catch (error: any) {
            console.error("Export failed:", error)
            toast({
                title: "내보내기 실패",
                description: error.message || "단어장을 내보낼 수 없습니다.",
                variant: "destructive",
            })
        } finally {
            setIsExporting(null)
        }
    }

    return (
        <div className="flex flex-col h-full bg-background page-transition-enter">
            {/* 헤더 (고정) */}
            <div className="flex items-center p-4 border-b border-border shrink-0">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0 mx-2">
                    <h1 className="text-lg font-semibold truncate">CSV로 내보내기</h1>
                </div>
            </div>

            {/* [!!!] 수정된 스크롤 영역 (study-screen.tsx 스타일 적용) */}
            <div className="flex-1 overflow-y-auto pb-20">
                {/* [!!!] px-4 pt-4 space-y-3 적용 */}
                <div className="px-4 pt-4 space-y-3">
                    {isLoading ? (
                        // [!!!] 스켈레톤 스타일 (study-screen 참조)
                        <div className="space-y-2">
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <Skeleton className="h-20 w-full rounded-xl" />
                        </div>
                    ) : wordbooks.length === 0 ? (
                        // [!!!] 빈 상태 (study-screen 참조)
                        <Card className="border border-border rounded-xl bg-card">
                            <CardContent className="p-6 text-center text-muted-foreground">
                                단어장이 없습니다.
                            </CardContent>
                        </Card>
                    ) : (
                        wordbooks.map((wb) => (
                            // [!!!] Card 스타일 적용 (study-screen 참조)
                            <Card
                                key={wb.id}
                                className="transition-all duration-200 border border-border shadow-sm bg-card rounded-xl"
                            >
                                {/* [!!!] CardContent 패딩 p-3 적용 */}
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground mb-0.5 text-base">{wb.name}</p>
                                            <p className="text-sm text-muted-foreground">{wb.wordCount} 단어</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport(wb.id, wb.name)}
                                            disabled={!!isExporting}
                                        >
                                            {isExporting === wb.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <BookDown className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}