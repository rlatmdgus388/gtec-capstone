"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// [!!! 여기를 수정합니다 !!!] - Select 컴포넌트 import 추가
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Check } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// 컴포넌트가 받을 Props 정의
interface WordbookEditScreenProps {
    initialData: {
        name: string;
        category: string;
    };
    onBack: () => void;
    onSave: (data: { name: string; category: string }) => Promise<void>;
}

/**
 * 단어장 정보 (이름, 카테고리)를 수정하는 전체 화면 페이지
 */
export function WordbookEditScreen({ initialData, onBack, onSave }: WordbookEditScreenProps) {
    // 폼 필드를 위한 내부 상태
    const [name, setName] = useState(initialData.name);
    const [category, setCategory] = useState(initialData.category || ""); // null 또는 undefined 방지
    const [isSaving, setIsSaving] = useState(false);

    // 저장 버튼 클릭 시
    const handleSaveClick = async () => {
        if (!name.trim()) {
            alert("단어장 이름은 비워둘 수 없습니다.");
            return;
        }

        // [!!! 여기를 수정합니다 !!!] - 카테고리 선택 유효성 검사 추가
        if (!category) {
            alert("카테고리를 선택해주세요.");
            return;
        }
        // [!!! 수정 끝 !!!]

        setIsSaving(true);
        try {
            // 부모 컴포넌트로부터 받은 onSave 함수를 호출
            // category는 Select에서 오므로 trim()이 불필요합니다.
            await onSave({ name: name.trim(), category: category });
            // 성공 시 onSave가 onBack을 호출하므로 여기서는 별도 처리 안 함
        } catch (error) {
            // onSave에서 에러를 throw하면 여기서 catch
            setIsSaving(false); // 저장 실패 시 버튼 활성화
        }
    };

    return (
        // [수정 1] 'flex-1 overflow-y-auto pb-20' 제거, 'flex flex-col' 추가
        <div className={cn("flex flex-col bg-background", "page-transition-enter")}>
            {/* [수정 2] 'div' -> 'header'로 변경, 클래스 수정 */}
            <header className="sticky top-0 z-40 w-full bg-background">
                <div className="px-4 py-4">
                    <div className="flex items-center gap-3 h-10">
                        <Button variant="ghost" size="sm" onClick={onBack} disabled={isSaving} className="p-2 -ml-2">
                            <ArrowLeft size={20} className="text-foreground" />
                        </Button>
                        {/* [수정 3] 타이틀을 flex-1 div로 감싸기 */}
                        <div className="flex-1">
                            <h1 className="text-lg font-bold">단어장 정보 수정</h1>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveClick}
                            disabled={isSaving}
                            className="p-2 -mr-2"
                        >
                            {isSaving
                                ? <Skeleton className="h-5 w-5 rounded-full" />
                                : <Check size={20} className="text-primary" />
                            }
                        </Button>
                    </div>
                </div>
            </header>

            {/* [수정 4] 'flex-1' 및 하단 여백(pb)을 가진 래퍼 추가 */}
            <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))]">
                <div className="p-4 space-y-6 mt-4">
                    <div>
                        <label htmlFor="wb-name" className="block text-sm font-medium text-muted-foreground mb-1">
                            단어장 이름
                        </label>
                        <Input
                            id="wb-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 text-base" // h-11 -> h-12로 create-wordbook-screen과 통일
                            placeholder="단어장 이름"
                            disabled={isSaving}
                        />
                    </div>

                    {/* [!!! 여기를 수정합니다 !!!] - Input을 Select로 교체 */}
                    <div>
                        <label htmlFor="wb-category" className="block text-sm font-medium text-muted-foreground mb-1">
                            카테고리
                        </label>
                        <Select
                            onValueChange={setCategory} // Select의 값 변경 시 category 상태 업데이트
                            value={category}            // 현재 category 상태를 Select의 값으로 설정
                            disabled={isSaving}
                        >
                            <SelectTrigger id="wb-category" className="h-12 text-base">
                                <SelectValue placeholder="카테고리를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="일상">일상</SelectItem>
                                <SelectItem value="시험">시험</SelectItem>
                                <SelectItem value="여행">여행</SelectItem>
                                <SelectItem value="비즈니스">비즈니스</SelectItem>
                                <SelectItem value="기타">기타</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* [!!! 수정 끝 !!!] */}

                </div>
            </div>
        </div>
    );
}