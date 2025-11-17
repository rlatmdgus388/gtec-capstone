"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, ArrowLeft } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface DetectedWord {
  text: string;
  original: string; // [추가]
  confidence?: number;
  meaning?: string;
  partOfSpeech?: string; // [추가]
  selected: boolean;
}

interface Wordbook {
  id: string;
  name: string;
  category: string;
}

interface AddToWordbookDialogProps {
  words: DetectedWord[]
  onAddToWordbook: (wordbookId: number) => void
  onBack: () => void
}

export function AddToWordbookDialog({ words, onAddToWordbook, onBack }: AddToWordbookDialogProps) {
  const [selectedWordbookId, setSelectedWordbookId] = useState<string>("")
  const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyWordbooks = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWithAuth('/api/wordbooks');
        setWordbooks(data || []);
      } catch (error) {
        console.error("내 단어장 목록 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyWordbooks();
  }, []);

  const handleConfirm = async () => {
    if (selectedWordbookId) {
      try {
        const POS_LABEL: Record<string, string> = {
          n: "명사",
          v: "동사",
          adj: "형용사",
          adv: "부사",
        };
        
        const wordsToAdd = words
          .filter((w) => w.selected)
          .map((w) => {
            const rawPos = w.partOfSpeech?.trim().toLowerCase();
            const posLabel = rawPos ? POS_LABEL[rawPos] || rawPos : "";
            const baseMeaning = w.meaning?.trim() || "";
        
            const meaningWithPos = posLabel
              ? `(${posLabel}) ${baseMeaning}`   // 예: (명사) 특징, 특색
              : baseMeaning;
        
            return {
              word: w.original,
              meaning: meaningWithPos,
              example: "",
            };
          });
        await fetchWithAuth(`/api/wordbooks/${selectedWordbookId}/words`, {
          method: 'POST',
          body: JSON.stringify(wordsToAdd)
        });
        alert(`${wordsToAdd.length}개의 단어가 추가되었습니다.`);
        onAddToWordbook(Number(selectedWordbookId));
      } catch (error) {
        console.error("사진 단어 추가 실패:", error);
        alert("단어 추가에 실패했습니다.");
      }
    }
  }

  const selectedWords = words.filter((word) => word.selected)

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">단어장에 추가</h1>
            <p className="text-sm text-muted-foreground">{selectedWords.length}개 단어를 추가합니다.</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">추가할 단어</CardTitle></CardHeader>
          <CardContent className="max-h-48 overflow-y-auto">
            {selectedWords.map((word, index) => (
              <div key={index} className="flex items-center justify-between p-2">
                <h3 className="font-medium text-foreground">{word.original}</h3>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">단어장 선택</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-12 w-full" /> : (
              <Select value={selectedWordbookId} onValueChange={setSelectedWordbookId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="단어장을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {wordbooks.map((wb) => (
                    <SelectItem key={wb.id} value={wb.id.toString()}>{wb.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-6">
          <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">이전</Button>
          <Button onClick={handleConfirm} disabled={!selectedWordbookId} className="flex-1 bg-primary hover:bg-primary/90">
            단어장에 추가
          </Button>
        </div>
      </div>
    </div>
  )
}
