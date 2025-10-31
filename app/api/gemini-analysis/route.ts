// app/api/gemini-analysis/route.ts
import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ✅ 폴백 후보 (flash → pro → 1.5 라인)
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-pro-001",
  "gemini-1.5-flash-001",
] as const;

/** 긴 입력을 안전하게 분할 (토큰 찢김/출력 꼬리 방지) */
function splitTextByLength(s: string, max = 2000) {
  if (s.length <= max) return [s];
  const parts: string[] = [];
  for (let i = 0; i < s.length; i += max) parts.push(s.slice(i, i + max));
  return parts;
}

/** 문자열/이스케이프 인지하면서 첫 유효 JSON(객체/배열) 범위 찾기 */
function findFirstValidJsonSpan(s: string): { start: number; end: number } | null {
  const openers = ["[", "{"];
  const closers: Record<string, string> = { "[": "]", "{": "}" };
  let inStr = false, esc = false, stack: string[] = [], start = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else {
      if (ch === '"') { inStr = true; esc = false; continue; }
      if (openers.includes(ch)) { if (!stack.length) start = i; stack.push(ch); }
      else if (stack.length) {
        const top = stack[stack.length - 1];
        if (ch === closers[top]) {
          stack.pop();
          if (!stack.length && start !== -1) {
            const cand = s.slice(start, i + 1);
            try { JSON.parse(cand); return { start, end: i }; } catch {}
          }
        }
      }
    }
  }
  return null;
}

/** 안전 JSON 파서 (혹시 인자 문자열이 JSON이 아닐 때 마지막 방어선) */
function tryParseJSON(s: string) {
  let t = s
    .replace(/^\uFEFF/, "")
    .replace(/^```json\s*|\s*```$/g, "")
    .replace(/^```\s*|\s*```$/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();

  try { return JSON.parse(t); } catch {}
  const idx = findFirstValidJsonSpan(t);
  if (idx) return JSON.parse(t.slice(idx.start, idx.end + 1));
  throw new SyntaxError("Failed to parse tool arguments as JSON.");
}

// 도메인 스키마
const TermItemSchema = {
  type: "object",
  properties: {
    original: { type: "string" },
    text: { type: "string" },
    partOfSpeech: { type: "string" },
    meaning: { type: "string" },
  },
  required: ["original", "text", "partOfSpeech", "meaning"],
} as const;

// 함수 선언
const functionDeclarations = [
  {
    name: "return_terms",
    description:
      "Extract important English words from the input text and return them in a strict schema.",
    parameters: {
      type: "object",
      properties: {
        terms: { type: "array", items: TermItemSchema },
      },
      required: ["terms"],
    },
  },
] as const;

// ✅ 일시적 오류 판별 + 재시도 래퍼
function isTransient(err: any) {
  const st = Number(err?.status || err?.code || 0);
  const msg = String(err?.message || "").toLowerCase();
  if ([429, 500, 502, 503, 504].includes(st)) return true;
  return /overloaded|temporar|timeout|deadline|rate|quota|unavailable/i.test(msg);
}

async function callWithRetry<T>(
  fn: () => Promise<T>,
  { retries = 4, baseMs = 400, maxMs = 6000 }: { retries?: number; baseMs?: number; maxMs?: number } = {}
): Promise<T> {
  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === retries) break;
      const delay = Math.min(maxMs, baseMs * 2 ** attempt) + Math.floor(Math.random() * 250);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

/** 한 덩어리 텍스트에 대해 함수 호출로 결과 받기 (모델 폴백 + 타임아웃 + 백오프) */
async function analyzeChunk(genAI: GoogleGenerativeAI, text: string) {
  const prompt = `
다음 텍스트에서 중요한 영어 단어들을 추출해 아래 스키마에 맞춰 함수(return_terms)를 반드시 호출하세요.
- original: 원형
- text: 원문에 나온 그대로
- partOfSpeech: n|v|adj|adv 등
- meaning: 한국어 뜻

중요: 고유명사(사람 이름, 지명, 브랜드 등)는 제외하세요.
설명/주석/코드펜스 없이 함수 호출만 하세요.

텍스트:
"""
${text}
"""
  `.trim();

  const generationConfig = {
    temperature: 0.1,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  // ✅ 불필요 차단 최소화(원한다면 완화 수치 조정)
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE }, // ✅ 수정된 부분
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];
  

  let lastErr: any;
  for (const modelId of MODEL_CANDIDATES) {
    const model = genAI.getGenerativeModel({ model: modelId });

    // ✅ 타임아웃(예: 25초)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);

    try {
      const result = await callWithRetry(
        () =>
          model.generateContent(
            {
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              tools: [{ functionDeclarations }],
              // ✅ 함수 강제 + 허용 목록 지정
              toolConfig: {
                functionCallingConfig: {
                  mode: "ANY",
                  allowedFunctionNames: ["return_terms"],
                },
              },
              generationConfig,
              safetySettings,
            },
            // @ts-ignore: SDK가 signal 옵션 허용
            { signal: controller.signal }
          ),
        { retries: 4, baseMs: 400, maxMs: 6000 }
      );

      clearTimeout(timer);

      // ✅ 차단 피드백 로그(디버그용)
      const fb = result.response.promptFeedback;
      if (fb?.blockReason) {
        console.warn("Prompt blocked:", fb.blockReason, fb.safetyRatings);
      }

      const cand = result.response.candidates?.[0];
      if (!cand) throw new Error("No candidate returned.");

      const parts = cand.content?.parts ?? [];
      const call = parts.find((p: any) => p.functionCall);
      if (!call) {
        console.warn("Model did not return a function call for a chunk. Returning empty array.");
        return [];
      }

      const { name, args } = call.functionCall;
      if (name !== "return_terms") throw new Error(`Unexpected function call: ${name}`);

      const parsed = typeof args === "string" ? tryParseJSON(args) : args;
      const arr = parsed?.terms ?? [];

      const cleaned = arr
        .filter(
          (x: any) =>
            x &&
            typeof x.original === "string" &&
            typeof x.text === "string" &&
            typeof x.partOfSpeech === "string" &&
            typeof x.meaning === "string"
        )
        .map((x: any) => ({
          original: x.original.trim(),
          text: x.text.trim(),
          partOfSpeech: x.partOfSpeech.trim(),
          meaning: x.meaning.trim(),
        }));

      return cleaned;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (!isTransient(err)) break; // 비일시 오류면 즉시 중단
      // 일시 오류면 다음 모델로 폴백
    }
  }
  throw lastErr;
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ message: "텍스트가 필요합니다." }, { status: 400 });
    }

    const chunks = splitTextByLength(text, 2000);
    const all: any[] = [];

    // 순차 처리(503/429 완화)
    for (const chunk of chunks) {
      const part = await analyzeChunk(genAI, chunk);
      all.push(...part);
    }

    // 중복 제거
    const key = (t: any) => `${t.text}@@${t.original}`.toLowerCase();
    const dedup = Array.from(new Map(all.map((r) => [key(r), r])).values());

    return NextResponse.json(dedup);
  } catch (error: any) {
    console.error("Gemini API 오류:", error);
    return NextResponse.json(
      { message: "AI 단어 분석 중 오류가 발생했습니다.", detail: String(error?.message || error) },
      { status: 500 }
    );
  }
}
