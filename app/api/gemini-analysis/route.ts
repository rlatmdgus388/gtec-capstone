// app/api/gemini-analysis/route.ts
import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-pro-001",
  "gemini-1.5-flash-001",
] as const;

/** 긴 입력을 안전하게 분할 */
function splitTextByLength(s: string, max = 2000) {
  if (s.length <= max) return [s];
  const parts: string[] = [];
  for (let i = 0; i < s.length; i += max) parts.push(s.slice(i, i + max));
  return parts;
}

/** 문자열 내부 JSON 탐색 */
function findFirstValidJsonSpan(s: string): { start: number; end: number } | null {
  const openers = ["[", "{"];
  const closers: Record<string, string> = { "[": "]", "{": "}" };
  let inStr = false,
    esc = false,
    stack: string[] = [],
    start = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else {
      if (ch === '"') {
        inStr = true;
        esc = false;
        continue;
      }
      if (openers.includes(ch)) {
        if (!stack.length) start = i;
        stack.push(ch);
      } else if (stack.length) {
        const top = stack[stack.length - 1];
        if (ch === closers[top]) {
          stack.pop();
          if (!stack.length && start !== -1) {
            const cand = s.slice(start, i + 1);
            try {
              JSON.parse(cand);
              return { start, end: i };
            } catch {}
          }
        }
      }
    }
  }
  return null;
}

/** JSON 안전 파싱 */
function tryParseJSON(s: string) {
  let t = s
    .replace(/^\uFEFF/, "")
    .replace(/^```json\s*|\s*```$/g, "")
    .replace(/^```\s*|\s*```$/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();

  try {
    return JSON.parse(t);
  } catch {}
  const idx = findFirstValidJsonSpan(t);
  if (idx) return JSON.parse(t.slice(idx.start, idx.end + 1));
  throw new SyntaxError("Failed to parse tool arguments as JSON.");
}

/** 임시 오류 여부 판별 */
function isTransient(err: any) {
  const st = Number(err?.status || err?.code || 0);
  const msg = String(err?.message || "").toLowerCase();
  if ([429, 500, 502, 503, 504].includes(st)) return true;
  return /overloaded|temporar|timeout|deadline|rate|quota|unavailable/i.test(msg);
}

/** 재시도 로직 */
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

// 단어 필터링 정리
function sanitizeTerms(arr: any[]) {
  return arr
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
}

/** 분석 함수 */
async function analyzeChunk(genAI: GoogleGenerativeAI, text: string) {
  const prompt = `
다음 텍스트에서 중요한 영어 단어들을 추출해 아래 스키마에 맞춰 함수(return_terms)를 반드시 호출하세요.
- original: 원형
- text: 원문 그대로
- partOfSpeech: n|v|adj|adv 등
- meaning: 한국어 뜻

반드시 함수 호출을 하세요. **단어가 없어도 return_terms({ "terms": [] })를 호출**하세요.
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

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  const functionDeclarations = [
    {
      name: "return_terms",
      description:
        "Extract important English words from the input text and return them in a strict schema.",
      parameters: {
        type: "object",
        properties: {
          terms: {
            type: "array",
            items: {
              type: "object",
              properties: {
                original: { type: "string" },
                text: { type: "string" },
                partOfSpeech: { type: "string" },
                meaning: { type: "string" },
              },
              required: ["original", "text", "partOfSpeech", "meaning"],
            },
          },
        },
        required: ["terms"],
      },
    },
  ];

  const tryToolCall = async (modelId: string, forcePrompt = prompt) => {
    const model = genAI.getGenerativeModel({ model: modelId });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);

    try {
      const result = await callWithRetry(
        () =>
          model.generateContent(
            {
              contents: [{ role: "user", parts: [{ text: forcePrompt }] }],
              tools: [{ functionDeclarations }],
              toolConfig: {
                functionCallingConfig: {
                  mode: "ANY",
                  allowedFunctionNames: ["return_terms"],
                },
              },
              generationConfig,
              safetySettings,
            },
            // @ts-ignore
            { signal: controller.signal }
          ),
        { retries: 3, baseMs: 400, maxMs: 6000 }
      );
      return result;
    } finally {
      clearTimeout(timer);
    }
  };

  for (const modelId of MODEL_CANDIDATES) {
    try {
      const result = await tryToolCall(modelId);

      const fb = result.response.promptFeedback;
      if (fb?.blockReason) console.warn("Prompt blocked:", fb.blockReason);

      const cand = result.response.candidates?.[0];
      const parts = cand?.content?.parts ?? [];
      const call = parts.find((p: any) => p.functionCall);

      if (call) {
        const { args } = call.functionCall;
        const parsed = typeof args === "string" ? tryParseJSON(args) : args;
        return sanitizeTerms(parsed?.terms ?? []);
      }

      // 재시도
      console.warn("No function call. Retrying with nudge…");
      const nudgedPrompt = prompt + `

반드시 return_terms({...}) 함수를 호출해야 합니다. 단어가 없으면 {"terms": []}로 호출하세요.`;
      const retry = await tryToolCall(modelId, nudgedPrompt);

      const c2 = retry.response.candidates?.[0];
      const p2 = c2?.content?.parts ?? [];
      const call2 = p2.find((p: any) => p.functionCall);
      if (call2) {
        const { args } = call2.functionCall;
        const parsed = typeof args === "string" ? tryParseJSON(args) : args;
        return sanitizeTerms(parsed?.terms ?? []);
      }

      // 스키마 모드로 우회
      console.warn("Still no function call. Falling back to JSON mode…");
      const schemaResult = await genAI.getGenerativeModel({ model: modelId }).generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          ...generationConfig,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              terms: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    original: { type: "string" },
                    text: { type: "string" },
                    partOfSpeech: { type: "string" },
                    meaning: { type: "string" },
                  },
                  required: ["original", "text", "partOfSpeech", "meaning"],
                },
              },
            },
            required: ["terms"],
          },
        },
        safetySettings,
      });

      const raw = schemaResult.response.text();
      const obj = tryParseJSON(raw);
      return sanitizeTerms(obj?.terms ?? []);

    } catch (err) {
      if (!isTransient(err)) throw err;
      console.warn(`Transient error on ${modelId}, trying next model…`, err?.message || err);
      continue;
    }
  }

  throw new Error("All models failed to return structured output.");
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ message: "텍스트가 필요합니다." }, { status: 400 });
    }

    const chunks = splitTextByLength(text, 2000)
      .map((s) => s.trim())
      .filter((s) => /[A-Za-z]/.test(s));

    const all: any[] = [];
    for (const chunk of chunks) {
      const part = await analyzeChunk(genAI, chunk);
      all.push(...part);
    }

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
