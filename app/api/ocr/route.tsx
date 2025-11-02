import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleAuth } from 'google-auth-library';
<<<<<<< HEAD
=======

// 1. ocr-key.json import를 완전히 삭제했습니다.
// @ts-ignore
// import serviceAccount from '../../../ocr-key.json'; 

// 2. Vercel 환경 변수에서 JSON 문자열을 읽어옵니다.
const ocrCredentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!ocrCredentialsJson) {
  console.error('🔥 GOOGLE_APPLICATION_CREDENTIALS_JSON 환경 변수가 없습니다.');
  // Vercel 설정에 변수가 없는 경우
}

// 3. 읽어온 JSON 문자열을 객체로 변환합니다.
//    (JSON.parse가 \n을 자동으로 처리해줍니다.)
const serviceAccount = JSON.parse(ocrCredentialsJson || '{}');
>>>>>>> 0a8dc53d350d9e995a8048d3aa29afcfff26e3dc

// ✅ .env.local에 저장된 GOOGLE_APPLICATION_CREDENTIALS_JSON을 사용
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');

const auth = new GoogleAuth({
  credentials: {
    client_email: serviceAccount.client_email,
<<<<<<< HEAD
    private_key: serviceAccount.private_key?.replace(/\\n/g, '\n'), // 줄바꿈 복원
=======
    // 4. [수정됨] .replace()를 완전히 삭제했습니다.
    private_key: serviceAccount.private_key,
>>>>>>> 0a8dc53d350d9e995a8048d3aa29afcfff26e3dc
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const visionClient = new ImageAnnotatorClient({ auth });

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ message: '이미지 데이터가 필요합니다.' }, { status: 400 });
    }

<<<<<<< HEAD
    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
=======
    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

>>>>>>> 0a8dc53d350d9e995a8048d3aa29afcfff26e3dc
    const [result] = await visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations;

    if (!detections?.length || !detections[0]?.description) {
      return NextResponse.json({ fullText: '' });
    }
<<<<<<< HEAD

    const fullText = detections[0].description;
=======

    // [변경] 오직 fullText만 추출
    const fullText = detections[0].description || "";

    // --- 단어 필터링(filteredWords), 원형 추출(uniqueLemmasMap), DeepL 번역 로직 모두 제거 -

    // [변경] fullText만 반환
>>>>>>> 0a8dc53d350d9e995a8048d3aa29afcfff26e3dc
    return NextResponse.json({ fullText });
  } catch (error: any) {
    console.error('OCR 처리 중 오류 발생:', error);
    return NextResponse.json(
      { message: '이미지 처리 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
}
