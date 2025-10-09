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

const firestore = admin.firestore();
const auth = admin.auth();

export { firestore, auth };
