// app/api/ocr/route.tsx

import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleAuth } from 'google-auth-library';
// @ts-ignore
// import serviceAccount from '../../../ocr-key.json'; // 1. 이 줄을 삭제하거나 주석 처리합니다.

// 2. 환경 변수에서 JSON 문자열을 읽어오는 코드 추가
const ocrCredentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!ocrCredentialsJson) {
  console.error('🔥 GOOGLE_APPLICATION_CREDENTIALS_JSON 환경 변수가 없습니다.');
  // Vercel 설정에 변수가 없는 경우
}

// 3. 읽어온 JSON 문자열을 객체로 변환
const serviceAccount = JSON.parse(ocrCredentialsJson || '{}');

// --- DeepL, lemmatize, stopwords, dictionary 관련 import 모두 제거 ---

const auth = new GoogleAuth({
  credentials: {
    client_email: serviceAccount.client_email,
    // 4. private_key가 Vercel에서 줄바꿈(\n)을 인식하도록 .replace() 추가
    private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
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