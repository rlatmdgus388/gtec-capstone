"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea" // '설명'이 없어졌으므로 Textarea import 제거
import { ArrowLeft, BookPlus } from "lucide-react"
import { cn } from "@/lib/utils"


// '설명(description)' 필드를 스키마에서 제거했습니다.
const formSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  // description: z.string().optional(), // '설명' 필드 제거
  category: z.string().min(1, "카테고리를 선택해주세요."),
})

// 부모 컴포넌트(AuthManager)의 onSave 타입과 맞추기 위해
// onSave의 타입을 유지하고, onSubmit에서 description을 추가합니다.
interface CreateWordbookScreenProps {
  onBack: () => void
  onSave: (data: { name: string; description: string; category: string }) => void
}

export function CreateWordbookScreen({ onBack, onSave }: CreateWordbookScreenProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
    },
  })

  // '설명'이 빠진 폼 데이터에 description: ""을 추가하여 onSave로 전달
  function onSubmit(data: z.infer<typeof formSchema>) {
    onSave({
      ...data,
      description: "", // '설명' 필드를 항상 빈 문자열로 전달
    })
  }

  return (
    <div className={cn("flex-1 overflow-y-auto pb-20", "page-transition-enter")}>
      <div className="bg-background sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2 -ml-2">
              <ArrowLeft size={20} className="text-foreground" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">새 단어장 만들기</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">단어장 이름</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 토익 필수 단어"
                      {...field}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- '설명' FormField가 여기서 삭제되었습니다 --- */}

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">카테고리</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="일상">일상</SelectItem>
                      <SelectItem value="시험">시험</SelectItem>
                      <SelectItem value="여행">여행</SelectItem>
                      <SelectItem value="비즈니스">비즈니스</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold"
              disabled={form.formState.isSubmitting}
            >
              <BookPlus size={18} className="mr-2" />
              단어장 생성
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
