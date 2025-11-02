import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleAuth } from 'google-auth-library';

function loadServiceAccount() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON env is missing');
  }
  // 일부 환경에서 값이 '...'(작은따옴표) 또는 "..."(큰따옴표)로 감싸져 들어오는 경우 방어
  const trimmed = raw.trim();
  const unwrapped =
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
      ? trimmed.slice(1, -1)
      : trimmed;

  const parsed = JSON.parse(unwrapped);
  // private_key의 \n 이스케이프 복원
  if (parsed.private_key) {
    parsed.private_key = String(parsed.private_key).replace(/\\n/g, '\n');
  }
  return parsed;
}

const serviceAccount = loadServiceAccount();

const auth = new GoogleAuth({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
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

    const imageBuffer = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    const [result] = await visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations;

    const fullText =
      detections && detections.length > 0 && detections[0].description
        ? detections[0].description
        : '';

    return NextResponse.json({ fullText });
  } catch (error: any) {
    console.error('OCR 처리 중 오류 발생:', error);
    return NextResponse.json(
      { message: '이미지 처리 중 서버에서 오류가 발생했습니다.', error: error?.message },
      { status: 500 }
    );
  }
}
