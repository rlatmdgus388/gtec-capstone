// app/api/gemini-analysis/route.ts
import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 하나의 모델만 사용 (원하면 2.5-flash 로 바꿔도 됨)
const MODEL_ID = "gemini-2.0-flash";

/** 긴 입력을 안전하게 분할 */
function splitTextByLength(s: string, max = 2000) {
  if (s.length <= max) return [s];
  const parts: string[] = [];
  for (let i = 0; i < s.length; i += max) parts.push(s.slice(i, i + max));
  return parts;
}

/** 임시 오류 여부 판별 (재시도 판단용) */
function isTransient(err: any) {
  const st = Number(err?.status || err?.code || 0);
  const msg = String(err?.message || "").toLowerCase();
  if ([429, 500, 502, 503, 504].includes(st)) return true;
  return /overloaded|temporar|timeout|deadline|rate|quota|unavailable/i.test(msg);
}

/** 간단 재시도 로직 */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  { retries = 1, baseMs = 400, maxMs = 4000 }: { retries?: number; baseMs?: number; maxMs?: number } = {}
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

/** 줄 단위 결과 파싱 */
function parseLines(raw: string) {
  const results: { original: string; text: string; partOfSpeech: string; meaning: string }[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 혹시 모델이 "1. ~" 이런 식으로 번호를 붙이면 제거
    const noNumber = trimmed.replace(/^\d+[\).\s-]+/, "").trim();

    const parts = noNumber.split("|||").map((p) => p.trim());
    if (parts.length < 4) continue;

    const [original, text, partOfSpeech, meaning] = parts;

    if (!original || !text || !partOfSpeech || !meaning) continue;

    results.push({ original, text, partOfSpeech, meaning });
  }

  return results;
}

/** 개별 청크 분석 함수 (텍스트 포맷 버전) */
async function analyzeChunk(text: string) {
  const prompt = `
You are helping a student build an English vocabulary list from a short passage.

Your job is to EXTRACT MANY USEFUL VOCABULARY WORDS that are worth studying.

Please follow these rules:

1. What to INCLUDE
- nouns
- main verbs
- adjectives and adverbs
- TOEIC-style business / academic / workplace vocabulary
- words related to technology, society, business, leadership, marketing, etc.
- words that are CEFR **B1 level or higher**
- when unsure whether a word is important → INCLUDE it

2. What to EXCLUDE
- articles (a, an, the)
- very basic prepositions (of, in, on, at, for, to, from, with)
- personal pronouns (he, she, they, it, etc.)
- auxiliary verbs (be, have, do, will, can…)
- conjunctions (and, but, or, so, that, because…)
- **very basic everyday A1–A2 words such as:**
  - music, album, people, day, year, good, bad, big, small, go, make, take, come, look, get
- DO NOT include overly trivial vocabulary that every middle school student knows

### OUTPUT FORMAT (VERY IMPORTANT)

Return the result as PLAIN TEXT.
Each line = one word, formatted EXACTLY like this:

original ||| text ||| partOfSpeech ||| meaning_in_Korean

- original: dictionary base form (lemma), e.g. "democratize"
- text: the form as it appeared in the passage
- partOfSpeech: n / v / adj / adv
- meaning_in_Korean: concise Korean dictionary meaning of the *original*

Examples:
democratize ||| democratized ||| v ||| 민주화하다, 민주화시키다
hallmark ||| hallmark ||| n ||| 특징, 상징적인 요소

Do NOT include explanations, comments, markdown, or JSON.
If there are no words, return an empty string.

Text to analyze:
"""
${text}
"""
  `.trim();

  const generationConfig = {
    temperature: 0.1,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1024,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  const model = genAI.getGenerativeModel({
    model: MODEL_ID,
    generationConfig,
    safetySettings,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000); // 15초 타임아웃

  try {
    const result = await callWithRetry(
      () =>
        model.generateContent(
          {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          },
          // @ts-ignore
          { signal: controller.signal }
        ),
      { retries: 1, baseMs: 400, maxMs: 4000 }
    );

    const raw = result.response.text() ?? "";
    const terms = parseLines(raw);

    console.log(
      `[Gemini-analysis] model=${MODEL_ID}, textLength=${text.length}, terms=${terms.length}`
    );

    return terms;
  } finally {
    clearTimeout(timer);
  }
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

    if (!chunks.length) {
      return NextResponse.json([]);
    }

    const chunkPromises = chunks.map((chunk, idx) =>
      analyzeChunk(chunk)
        .then((result) => {
          console.log(
            `[Gemini-analysis] chunk #${idx} finished: length=${chunk.length}, terms=${result.length}`
          );
          return result;
        })
        .catch((err) => {
          console.error(
            `[Gemini-analysis] chunk #${idx} 처리 실패:`,
            err?.message || err
          );
          return null;
        })
    );

    const allChunkResults = await Promise.all(chunkPromises);
    const successful = allChunkResults.filter(
      (r): r is any[] => Array.isArray(r)
    );

    if (successful.length === 0) {
      throw new Error("모든 청크 처리에 실패했습니다.");
    }

    // 🔽 여기부터 결과 후처리
    const all = successful.flat();

    // text + original 기준으로 중복 제거
    const key = (t: any) => `${t.text}@@${t.original}`.toLowerCase();
    const dedup = Array.from(new Map(all.map((r) => [key(r), r])).values());

    // 품사 라벨 매핑
    const POS_LABEL: Record<string, string> = {
      n: "명사",
      v: "동사",
      adj: "형용사",
      adv: "부사",
    };

    // meaning에 품사까지 붙여서 클라이언트로 보내기
    const withPos = dedup.map((item: any) => {
      const rawPos = String(item.partOfSpeech || "").trim().toLowerCase();
      const label = rawPos ? POS_LABEL[rawPos] || rawPos : "";
      const baseMeaning = String(item.meaning || "").trim();

      const meaningWithPos = label
        ? `[${label}] ${baseMeaning}` // 예: (명사) 단계
        : baseMeaning;

      return {
        ...item,
        meaning: meaningWithPos,
      };
    });

    return NextResponse.json(withPos);
  } catch (error: any) {
    console.error("Gemini API 전체 처리 오류:", error);
    return NextResponse.json(
      {
        message: "AI 단어 분석 중 오류가 발생했습니다.",
        detail: String(error?.message || error),
      },
      { status: 500 }
    );
  }
}
