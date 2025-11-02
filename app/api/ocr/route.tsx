import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleAuth } from 'google-auth-library';

// ✅ .env.local에 저장된 GOOGLE_APPLICATION_CREDENTIALS_JSON을 사용
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');

const auth = new GoogleAuth({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key?.replace(/\\n/g, '\n'), // 줄바꿈 복원
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

    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const [result] = await visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations;

    if (!detections?.length || !detections[0]?.description) {
      return NextResponse.json({ fullText: '' });
    }

    const fullText = detections[0].description;
    return NextResponse.json({ fullText });
  } catch (error: any) {
    console.error('OCR 처리 중 오류 발생:', error);
    return NextResponse.json(
      { message: '이미지 처리 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
}
