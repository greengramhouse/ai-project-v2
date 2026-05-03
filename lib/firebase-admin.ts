import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function initAdmin() {
  if (!getApps().length) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    initializeApp({
      credential: cert(serviceAccount as any),
    });
  }
}

// 🔥 init ทันทีตอน import
initAdmin();

// export db ไปใช้ได้เลย
export const firebaseAdmin = getFirestore();