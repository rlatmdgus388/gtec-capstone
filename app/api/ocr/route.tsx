// app/api/ocr/route.tsx

import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleAuth } from 'google-auth-library';
// @ts-ignore
import serviceAccount from '../../../ocr-key.json'; // [주의] 이 경로가 실제 ocr-key.json 위치와 맞는지 확인하세요. (루트 폴더 기준)

// --- DeepL, lemmatize, stopwords, dictionary 관련 import 모두 제거 ---

const auth = new GoogleAuth({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const visionClient = new ImageAnnotatorClient({ auth });

// --- dictionarySet, stopwordsSet 제거 ---

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ message: '이미지 데이터가 필요합니다.' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    
    const [result] = await visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0 || !detections[0].description) {
      // 텍스트가 감지되지 않으면 빈 문자열 반환
      return NextResponse.json({ fullText: "" });
    }
    
    // [변경] 오직 fullText만 추출
    const fullText = detections[0].description || "";

    // --- 단어 필터링(filteredWords), 원형 추출(uniqueLemmasMap), DeepL 번역 로직 모두 제거 ---

    // [변경] fullText만 반환
    return NextResponse.json({ fullText });

  } catch (error) {
    console.error('API 처리 중 오류 발생:', error);
    return NextResponse.json({ message: '이미지 처리 중 서버에서 오류가 발생했습니다.' }, { status: 500 });
  }
}