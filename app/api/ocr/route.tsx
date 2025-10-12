import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleAuth } from 'google-auth-library';
import serviceAccount from '../../../ocr-key.json';
import dictionary from 'an-array-of-english-words';
// @ts-ignore - 타입 정의가 없는 라이브러리를 위한 처리
import stopwords from 'stopwords';

// 최신 인증 방식 적용
const auth = new GoogleAuth({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const client = new ImageAnnotatorClient({ auth: auth });

// Set으로 변환하여 검색 속도를 높임
const dictionarySet = new Set(dictionary);
// 'stopwords' 라이브러리에서 영어 불용어 목록을 가져오도록 수정
const stopwordsSet = new Set(stopwords.english);

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ message: '이미지 데이터가 필요합니다.' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    const [result] = await client.textDetection(imageBuffer);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return NextResponse.json([]);
    }

    const detectedWords = detections.slice(1);

    const filteredWords = detectedWords
      .map(item => ({
        // ▼▼▼ [수정됨] item.description이 없는 경우를 대비해 빈 문자열('')을 기본값으로 설정 ▼▼▼
        original: item.description || '',
        confidence: item.score || 1.0,
      }))
      .map(item => ({
        ...item,
        cleaned: item.original.replace(/[^a-zA-Z]/g, '').toLowerCase(),
      }))
      .filter(item => {
        const { cleaned } = item;
        if (!cleaned) return false;
        if (cleaned.length <= 1 && cleaned !== 'a' && cleaned !== 'i') return false;
        if (stopwordsSet.has(cleaned)) return false;
        return dictionarySet.has(cleaned);
      });

    const uniqueWordsMap = new Map<string, { text: string; confidence: number }>();
    filteredWords.forEach(item => {
      if (!uniqueWordsMap.has(item.cleaned)) {
        uniqueWordsMap.set(item.cleaned, { text: item.cleaned, confidence: item.confidence });
      }
    });

    const uniqueWords = Array.from(uniqueWordsMap.values());

    return NextResponse.json(uniqueWords);

  } catch (error) {
    console.error('Google Cloud Vision API 오류:', error);
    return NextResponse.json({ message: '이미지 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

