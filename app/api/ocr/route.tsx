import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// 최신 SDK에서는 credentials 없이 환경변수만 있으면 자동 인증
const client = new ImageAnnotatorClient();

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ message: 'Image data is required' }, { status: 400 });
    }

    // Base64 → Buffer
    const imageBuffer = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""), 
      'base64'
    );

    // Vision API 호출
    const [result] = await client.textDetection({ image: { content: imageBuffer } });
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return NextResponse.json([]);
    }

    // 전체 텍스트 제외 후 개별 단어 추출
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
