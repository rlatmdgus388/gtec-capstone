import admin from 'firebase-admin';
import serviceAccount from '../api-key.json'; // 경로는 실제 위치에 맞게 수정

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin SDK 초기화 오류:', error);
  }
}

const firestore = admin.firestore();
const auth = admin.auth();

export { firestore, auth };