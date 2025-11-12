// components/settings/export-screen.tsx
"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, BookDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { auth } from "@/lib/firebase"

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
        // ... (단어장 로드 로직은 동일) ...
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

    // ... (handleExport 함수는 동일) ...
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
        // [!!!] 수정된 레이아웃:
        // study-screen.tsx, home-screen.tsx와 동일한 구조
        // (flex flex-col h-full)
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

            {/* [!!!] 수정된 스크롤 영역 */}
            {/* flex-1: 남은 공간을 모두 차지
              overflow-y-auto: 이 영역만 스크롤
              pb-20: 하단 네비게이션 바(h-20)에 가려지지 않도록 패딩 추가
            */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
                <Card className="border shadow-sm rounded-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookDown className="w-5 h-5 text-primary" />
                            단어장 백업
                        </CardTitle>
                        <CardDescription>
                            백업할 단어장을 선택하여 CSV 파일로 내보냅니다.
                        </CardDescription>
                    </CardHeader>
                    {/* (이전 '카드 스타일' 수정은 일단 되돌렸습니다. 
                       레이아웃 문제부터 해결하는 것이 우선입니다.)
                    */}
                    <CardContent className="space-y-2">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </>
                        ) : wordbooks.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center">
                                단어장이 없습니다.
                            </p>
                        ) : (
                            wordbooks.map((wb) => (
                                <div
                                    key={wb.id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{wb.name}</p>
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
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}