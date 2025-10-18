// app/api/ocr/route.tsx

<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleAuth } from 'google-auth-library';
import serviceAccount from '../../../ocr-key.json';
import dictionary from 'an-array-of-english-words';
// @ts-ignore
import stopwords from 'stopwords';
import lemmatize from 'wink-lemmatizer';

const auth = new GoogleAuth({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const visionClient = new ImageAnnotatorClient({ auth });
const dictionarySet = new Set(dictionary);
const stopwordsSet = new Set(stopwords.english);

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ message: '이미지 데이터가 필요합니다.' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    
    const [result] = await visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return NextResponse.json({ fullText: "", words: [] });
    }
    
    const fullText = detections[0].description || "";
    const detectedWords = detections.slice(1);

    const filteredWords = detectedWords
      .map(item => ({
        original: item.description || '',
        confidence: item.score || 1.0,
      }))
      .map(item => ({ ...item, cleaned: item.original.replace(/[^a-zA-Z]/g, '').toLowerCase() }))
      .filter(item => {
        const { cleaned } = item;
        if (!cleaned || (cleaned.length <= 1 && cleaned !== 'a' && cleaned !== 'i') || stopwordsSet.has(cleaned)) return false;
        return dictionarySet.has(cleaned);
      });

    // ▼▼▼ [수정된 부분] ▼▼▼
    // 단어 원형을 key로, 원본 단어 정보를 value로 저장하여 중복을 제거합니다.
    const uniqueLemmasMap = new Map<string, { original: string; confidence: number }>();
    filteredWords.forEach(item => {
        const nounLemma = lemmatize.noun(item.cleaned);
        // 명사형이 원형과 다를 경우 우선적으로 사용 (예: stores -> store)
        // 아닐 경우 동사 원형을 사용 (예: monitoring -> monitor)
        const lemma = item.cleaned !== nounLemma ? nounLemma : lemmatize.verb(item.cleaned);
        
        if (!uniqueLemmasMap.has(lemma)) {
            uniqueLemmasMap.set(lemma, { original: item.cleaned, confidence: item.confidence });
        }
    });
    
    const wordsToTranslate = Array.from(uniqueLemmasMap.keys());

    if (wordsToTranslate.length === 0) {
        return NextResponse.json({ fullText, words: [] });
    }

    const deeplAuthKey = process.env.DEEPL_AUTH_KEY;
    if (!deeplAuthKey) {
        throw new Error("DeepL 인증 키가 설정되지 않았습니다.");
    }

    const deeplResponse = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: { 'Authorization': `DeepL-Auth-Key ${deeplAuthKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: wordsToTranslate, target_lang: 'KO' })
    });

    if (!deeplResponse.ok) {
        const errorData = await deeplResponse.json();
        throw new Error(`DeepL API 오류: ${deeplResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const deeplData = await deeplResponse.json();
    const translations = deeplData.translations || [];

    // 원형(text), 원본(original), 뜻(meaning)을 모두 포함하여 결과를 만듭니다.
    const wordsWithMeanings = wordsToTranslate.map((lemma, index) => ({
        text: lemma, // 단어의 원형
        original: uniqueLemmasMap.get(lemma)?.original, // OCR로 인식된 원본 형태
        confidence: uniqueLemmasMap.get(lemma)?.confidence || 1.0,
        meaning: translations[index]?.text || lemma, // 번역 실패 시 영어 단어 그대로 표시
    }));
    // ▲▲▲ [수정된 부분] ▲▲▲

    return NextResponse.json({ fullText, words: wordsWithMeanings });

  } catch (error) {
    console.error('API 처리 중 오류 발생:', error);
    return NextResponse.json({ message: '이미지 처리 중 서버에서 오류가 발생했습니다.' }, { status: 500 });
  }
}
=======
import { NextResponse } from "next/server"
import { ImageAnnotatorClient } from "@google-cloud/vision"
import { GoogleAuth } from "google-auth-library"
import dictionary from "an-array-of-english-words"
// @ts-ignore
import stopwords from "stopwords"
import lemmatize from "wink-lemmatizer"

const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
})

const visionClient = new ImageAnnotatorClient({ auth })
const dictionarySet = new Set(dictionary)
const stopwordsSet = new Set(stopwords.english)

export async function POST(request: Request) {
  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ message: "이미지 데이터가 필요합니다." }, { status: 400 })
    }

    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64")

    const [result] = await visionClient.textDetection(imageBuffer)
    const detections = result.textAnnotations

    if (!detections || detections.length === 0) {
      return NextResponse.json({ fullText: "", words: [] })
    }

    const fullText = detections[0].description || ""
    const detectedWords = detections.slice(1)

    const filteredWords = detectedWords
      .map((item) => ({
        original: item.description || "",
        confidence: item.score || 1.0,
      }))
      .map((item) => ({ ...item, cleaned: item.original.replace(/[^a-zA-Z]/g, "").toLowerCase() }))
      .filter((item) => {
        const { cleaned } = item
        if (!cleaned || (cleaned.length <= 1 && cleaned !== "a" && cleaned !== "i") || stopwordsSet.has(cleaned))
          return false
        return dictionarySet.has(cleaned)
      })

    const uniqueLemmasMap = new Map<string, { original: string; confidence: number }>()
    filteredWords.forEach((item) => {
      const nounLemma = lemmatize.noun(item.cleaned)
      const lemma = item.cleaned !== nounLemma ? nounLemma : lemmatize.verb(item.cleaned)

      if (!uniqueLemmasMap.has(lemma)) {
        uniqueLemmasMap.set(lemma, { original: item.cleaned, confidence: item.confidence })
      }
    })

    const wordsToTranslate = Array.from(uniqueLemmasMap.keys())

    if (wordsToTranslate.length === 0) {
      return NextResponse.json({ fullText, words: [] })
    }

    const deeplAuthKey = process.env.DEEPL_AUTH_KEY
    if (!deeplAuthKey) {
      throw new Error("DeepL 인증 키가 설정되지 않았습니다.")
    }

    const deeplResponse = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${deeplAuthKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: wordsToTranslate, target_lang: "KO" }),
    })

    if (!deeplResponse.ok) {
      const errorData = await deeplResponse.json()
      throw new Error(`DeepL API 오류: ${deeplResponse.status} - ${JSON.stringify(errorData)}`)
    }

    const deeplData = await deeplResponse.json()
    const translations = deeplData.translations || []

    const wordsWithMeanings = wordsToTranslate.map((lemma, index) => ({
      text: lemma,
      original: uniqueLemmasMap.get(lemma)?.original,
      confidence: uniqueLemmasMap.get(lemma)?.confidence || 1.0,
      meaning: translations[index]?.text || lemma,
    }))

    return NextResponse.json({ fullText, words: wordsWithMeanings })
  } catch (error) {
    console.error("API 처리 중 오류 발생:", error)
    return NextResponse.json({ message: "이미지 처리 중 서버에서 오류가 발생했습니다." }, { status: 500 })
  }
}
>>>>>>> db7745a (다크모드, 프로필 설정)
