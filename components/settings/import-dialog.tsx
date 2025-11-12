// components/settings/import-dialog.tsx
"use client"

import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react"
import { BookUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { fetchWithAuth } from "@/lib/api"
import Papa from "papaparse"

interface Wordbook {
    id: string
    name: string
    wordCount: number
}

interface ImportDialogProps {
    open: boolean
    onOpenChange: Dispatch<SetStateAction<boolean>>
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isImporting, setIsImporting] = useState(false)
    const [selectedWordbookId, setSelectedWordbookId] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    // 다이얼로그가 열릴 때만 단어장 목록을 불러옵니다.
    useEffect(() => {
        if (open) {
            setIsLoading(true)
            const loadWordbooks = async () => {
                try {
                    const data = await fetchWithAuth("/api/wordbooks")
                    setWordbooks(data || [])
                    if (data && data.length > 0) {
                        setSelectedWordbookId(data[0].id)
                    }
                } catch (error) {
                    toast({
                        title: "오류",
                        description: "단어장 목록을 불러오지 못했습니다.",
                        variant: "destructive",
                    })
                } finally {
                    setIsLoading(false)
                }
            }
            loadWordbooks()
        }
    }, [open, toast])

    // '파일 선택' 버튼 클릭 시 숨겨진 input 클릭
    const handleImportClick = () => {
        if (!selectedWordbookId) {
            toast({
                title: "단어장 선택",
                description: "단어를 불러올 단어장을 먼저 선택해주세요.",
            })
            return
        }
        fileInputRef.current?.click()
    }

    // 파일이 실제로 변경되었을 때 처리
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !selectedWordbookId) return

        setIsImporting(true)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const wordsToImport = results.data.map((row: any) => ({
                        original: row.original || row.text || '',
                        text: row.text || row.original || '',
                        partOfSpeech: row.partOfSpeech || 'n',
                        meaning: row.meaning || '',
                    })).filter(word => word.original && word.meaning)

                    if (wordsToImport.length === 0) {
                        throw new Error("CSV에서 유효한 단어를 찾을 수 없습니다. (original, meaning 컬럼 확인)")
                    }

                    const response = await fetchWithAuth(
                        `/api/wordbooks/${selectedWordbookId}/import`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(wordsToImport),
                        }
                    )

                    const result = await response.json()
                    if (!response.ok) throw new Error(result.message || "Import failed")

                    toast({
                        title: "불러오기 성공",
                        description: `${result.importedCount}개의 단어를 추가했습니다.`,
                    })
                    onOpenChange(false) // 성공 시 다이얼로그 닫기

                } catch (error: any) {
                    toast({
                        title: "불러오기 실패",
                        description: error.message || "단어를 가져올 수 없습니다.",
                        variant: "destructive",
                    })
                } finally {
                    setIsImporting(false)
                    if (event.target) event.target.value = "" // 인풋 리셋
                }
            },
            error: (error: any) => {
                toast({ title: "CSV 파싱 실패", description: error.message, variant: "destructive" })
                setIsImporting(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookUp className="w-5 h-5 text-primary" />
                        CSV로 불러오기
                    </DialogTitle>
                    <DialogDescription>
                        CSV 파일을 기존 단어장에 추가합니다.
                    </DialogDescription>
                </DialogHeader>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv, text/csv"
                    className="hidden"
                />

                <div className="space-y-4 pt-4">
                    <p className="text-sm font-medium">1. 단어장 선택</p>
                    {isLoading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <Select
                            value={selectedWordbookId || ""}
                            onValueChange={(value) => setSelectedWordbookId(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="단어장을 선택하세요..." />
                            </SelectTrigger>
                            <SelectContent>
                                {wordbooks.length > 0 ? (
                                    wordbooks.map((wb) => (
                                        <SelectItem key={wb.id} value={wb.id}>
                                            {wb.name} ({wb.wordCount} 단어)
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        단어장이 없습니다.
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    )}

                    <p className="text-sm font-medium">2. 파일 업로드</p>
                    <Button
                        onClick={handleImportClick}
                        disabled={isImporting || isLoading || !selectedWordbookId}
                        className="w-full"
                    >
                        {isImporting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <BookUp className="w-4 h-4 mr-2" />
                        )}
                        {isImporting ? "불러오는 중..." : "CSV 파일 선택"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        * `original`, `meaning` 컬럼은 필수입니다.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}