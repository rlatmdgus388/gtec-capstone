// components/settings/import-screen.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, BookUp, Loader2, Upload, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { fetchWithAuth } from "@/lib/api"
import Papa from "papaparse"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Wordbook {
    id: string
    name: string
    wordCount: number
}

// API가 요구하는 W, M, D, P 구조
interface ParsedWord {
    W: string
    M: string
    D: string
    P: string
}

interface ImportScreenProps {
    onBack: () => void
}

export function ImportScreen({ onBack }: ImportScreenProps) {
    // 단어장 목록
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([])
    const [isLoadingWordbooks, setIsLoadingWordbooks] = useState(true)

    // 1단계: 파일 파싱
    const [isParsing, setIsParsing] = useState(false)
    const [wordsToImport, setWordsToImport] = useState<ParsedWord[] | null>(null)
    const [parsedFileInfo, setParsedFileInfo] = useState<{ count: number; fileName: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 2단계: 대상 선택
    const [destination, setDestination] = useState<"existing" | "new">("existing")
    const [selectedWordbookId, setSelectedWordbookId] = useState<string | null>(null)
    const [newWordbookName, setNewWordbookName] = useState("")

    // 3단계: 최종 임포트
    const [isImporting, setIsImporting] = useState(false)

    const { toast } = useToast()

    // 페이지 로드 시 단어장 목록을 미리 불러옵니다.
    useEffect(() => {
        setIsLoadingWordbooks(true)
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
                setIsLoadingWordbooks(false)
            }
        }
        loadWordbooks()
    }, [toast])

    // 1. '파일 선택' 버튼 클릭 시
    const handleFileSelectClick = () => {
        fileInputRef.current?.click()
    }

    // 2. 파일이 실제로 변경되었을 때 (파싱)
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsParsing(true)
        setWordsToImport(null) // 이전 파싱 결과 초기화
        setParsedFileInfo(null) // 이전 파싱 결과 초기화

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    // CSV 파싱 로직: W, M, D, P를 찾도록 변경
                    const words = results.data.map((row: any) => ({
                        W: row.W || '', // W (단어)
                        M: row.M || '', // M (뜻)
                        D: row.D || '', // D (메모)
                        P: row.P || '', // P (발음)
                    })).filter(word => word.W && word.M) // W와 M을 기준으로 필터링

                    if (words.length === 0) {
                        throw new Error("CSV에서 유효한 단어를 찾을 수 없습니다. (W, M 컬럼 확인)")
                    }

                    setWordsToImport(words as ParsedWord[])
                    setParsedFileInfo({ count: words.length, fileName: file.name })

                } catch (error: any) {
                    toast({
                        title: "파싱 실패",
                        description: error.message,
                        variant: "destructive",
                    })
                } finally {
                    setIsParsing(false)
                    if (event.target) event.target.value = "" // 인풋 리셋
                }
            },
            error: (error: any) => {
                toast({ title: "CSV 파싱 실패", description: error.message, variant: "destructive" })
                setIsParsing(false)
            }
        })
    }

    // 3. '불러오기 실행' 버튼 클릭 시 (최종)
    const handleFinalImport = async () => {
        if (!wordsToImport) {
            toast({ title: "오류", description: "파일이 선택되지 않았습니다." })
            return
        }

        setIsImporting(true)

        try {
            let targetWordbookId = selectedWordbookId

            // "새 단어장 생성" 선택 시
            if (destination === 'new') {
                if (!newWordbookName.trim()) {
                    throw new Error("새 단어장 이름을 입력하세요.")
                }
                const newBook = await fetchWithAuth("/api/wordbooks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newWordbookName, description: "CSV에서 가져옴" })
                })
                if (!newBook || !newBook.id) throw new Error("새 단어장 생성에 실패했습니다.")
                targetWordbookId = newBook.id
            }

            // "기존 단어장" 선택 시
            if (destination === 'existing' && !targetWordbookId) {
                throw new Error("기존 단어장을 선택하세요.")
            }

            // API 호출 (fetchWithAuth는 이미 JSON을 반환)
            const result = await fetchWithAuth(
                `/api/wordbooks/${targetWordbookId}/import`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(wordsToImport),
                }
            )

            toast({
                title: "불러오기 성공",
                description: `${result.importedCount}개의 단어를 추가했습니다.`,
            })
            onBack() // 성공 시 뒤로가기

        } catch (error: any) {
            toast({
                title: "불러오기 실패",
                description: error.message || "단어를 가져올 수 없습니다.",
                variant: "destructive",
            })
        } finally {
            setIsImporting(false)
        }
    }

    const isImportDisabled = isImporting ||
        !wordsToImport ||
        (destination === 'existing' && !selectedWordbookId) ||
        (destination === 'new' && !newWordbookName.trim())

    return (
        <div className="flex flex-col h-full bg-background page-transition-enter">
            {/* 헤더 */}
            <div className="flex items-center p-4 border-b border-border shrink-0">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0 mx-2">
                    <h1 className="text-lg font-semibold truncate">CSV 파일로 불러오기</h1>
                </div>
            </div>

            {/* 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">

                {/* 1단계: 파일 업로드 */}
                <Card className="border shadow-sm rounded-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-primary" />
                            1. 파일 업로드
                        </CardTitle>
                        <CardDescription>
                            불러올 단어가 포함된 CSV 파일을 선택하세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".csv, text/csv"
                            className="hidden"
                        />
                        <Button
                            onClick={handleFileSelectClick}
                            disabled={isParsing}
                            className="w-full"
                            variant="outline"
                        >
                            {isParsing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            {isParsing ? "파일 분석 중..." : "CSV 파일 선택"}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            * `W`, `M` 컬럼은 필수입니다. <br /> (W: 단어, M: 뜻, D: 메모, P: 발음)
                        </p>
                    </CardContent>
                </Card>

                {/* 2단계: 대상 선택 (파일이 업로드 되면 보임) */}
                {wordsToImport && parsedFileInfo && (
                    <Card className="border shadow-sm rounded-xl page-transition-enter">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookUp className="w-5 h-5 text-primary" />
                                2. 대상 단어장 선택
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 text-green-600 dark:text-green-500">
                                <FileCheck className="w-4 h-4" />
                                <span className="truncate">'{parsedFileInfo.fileName}'</span>
                                ({parsedFileInfo.count}개 단어 확인)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <RadioGroup
                                value={destination}
                                onValueChange={(value) => setDestination(value as "existing" | "new")}
                                className="space-y-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="existing" id="r-existing" />
                                    <Label htmlFor="r-existing">기존 단어장에 추가</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="new" id="r-new" />
                                    <Label htmlFor="r-new">새 단어장 생성</Label>
                                </div>
                            </RadioGroup>

                            {/* 기존 단어장 선택 */}
                            {destination === 'existing' && (
                                <div className="pl-6 space-y-2">
                                    {isLoadingWordbooks ? (
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
                                </div>
                            )}

                            {/* 새 단어장 생성 */}
                            {destination === 'new' && (
                                <div className="pl-6 space-y-2">
                                    <Input
                                        placeholder="새 단어장 이름 입력..."
                                        value={newWordbookName}
                                        onChange={(e) => setNewWordbookName(e.target.value)}
                                    />
                                </div>
                            )}

                            <Button
                                onClick={handleFinalImport}
                                disabled={isImportDisabled}
                                className="w-full"
                            >
                                {isImporting ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <BookUp className="w-4 h-4 mr-2" />
                                )}
                                {isImporting ? "불러오는 중..." : "불러오기 실행"}
                            </Button>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}