// lib/firebase-admin.ts

import admin from "firebase-admin";

// 이미 초기화된 앱이 있다면 재초기화 방지
if (!admin.apps.length) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("❌ Firebase Admin 환경변수가 누락되었습니다.");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log("✅ Firebase Admin 초기화 완료");
  } catch (error) {
    console.error("🔥 Firebase Admin 초기화 실패:", error);
  }
}

// [수정]
// 기존 파일은 'firestore'를, 새 파일은 'db'를 사용합니다.
// 둘 다 동일한 admin.firestore() 인스턴스를 가리키도록 합니다.
const firestore = admin.firestore();
const db = firestore; // 'db'는 'firestore'와 동일한 객체입니다.
const auth = admin.auth();

// [수정]
// 'firestore', 'db', 'auth' 세 가지 모두 내보냅니다.
export { firestore, db, auth };