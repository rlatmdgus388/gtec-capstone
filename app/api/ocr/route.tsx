import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// 서비스 계정 키를 사용하여 Vision 클라이언트 초기화
// .env.local 파일에 키가 올바르게 설정되어 있어야 합니다.
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
const client = new ImageAnnotatorClient({ credentials });

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ message: 'Image data is required' }, { status: 400 });
    }

    // 'data:image/jpeg;base64,' 와 같은 접두사 제거
    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    const [result] = await client.textDetection(imageBuffer);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return NextResponse.json([]);
    }

    // 전체 텍스트를 제외한 개별 단어들만 추출
    const words = detections.slice(1).map(item => ({
      text: item.description,
      confidence: item.score,
    }));

    return NextResponse.json(words);
  } catch (error) {
    console.error('Google Cloud Vision API Error:', error);
    return NextResponse.json({ message: 'Error processing image' }, { status: 500 });
  }
}