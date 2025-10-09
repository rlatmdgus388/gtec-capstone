import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import dictionary from 'an-array-of-english-words';
import stopwords from 'stopwords';

// Vision 클라이언트 초기화
const client = new ImageAnnotatorClient();

// Set으로 변환하여 검색 속도를 높임
const dictionarySet = new Set(dictionary.map(word => word.toLowerCase()));
const stopwordsSet = new Set(stopwords.english.map(word => word.toLowerCase()));

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ message: 'Image data is required' }, { status: 400 });
    }

    // Base64 접두사 제거 후 Buffer로 변환
    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    const [result] = await client.textDetection({ image: { content: imageBuffer } });
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return NextResponse.json([]);
    }

    // 첫 번째 전체 텍스트 제외, 개별 단어 처리
    const originalWords = detections.slice(1).map(item => item.description);

    const filteredWords = originalWords
      .map(word => word.replace(/[^a-zA-Z]/g, '')) // 숫자, 특수문자 제거
      .filter(word => {
        if (!word) return false;

        const lower = word.toLowerCase();

        // 한 글자 단어 제거 (단, 'a', 'i' 허용)
        if (lower.length <= 1 && lower !== 'a' && lower !== 'i') return false;

        // 불용어 제거
        if (stopwordsSet.has(lower)) return false;

        // 첫 글자가 대문자면서 'I'가 아닌 경우 고유명사 제거
        if (word[0] >= 'A' && word[0] <= 'Z' && word !== 'I') return false;

        // 영어 단어 사전에 존재하는 단어만 통과
        return dictionarySet.has(lower);
      })
      .map(word => word.toLowerCase());

    // 중복 제거
    const uniqueWords = Array.from(new Set(filteredWords)).map(text => ({ text }));

    return NextResponse.json(uniqueWords);

  } catch (error) {
    console.error('Google Cloud Vision API Error:', error);
    return NextResponse.json({ message: 'Error processing image' }, { status: 500 });
  }
}
