import { cacheLife } from "next/cache";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { firebaseAdmin } from "./firebase-admin";

// ❗ ห้ามใช้ NEXT_PUBLIC ใน server
const appId = process.env.APP_ID || "calendar-app";

export async function getPublicEvents() {
  "use cache";
  cacheLife("hours");

  try {
    const eventsRef = firebaseAdmin
      .collection("artifacts")
      .doc(appId)
      .collection("public")
      .doc("data")
      .collection("events");

    const snapshot = await eventsRef.get();

    const fetchedEvents = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // เรียงตามวันที่
    fetchedEvents.sort((a: any, b: any) => {
      const dateA = new Date(a.start || a.createdAt || 0).getTime();
      const dateB = new Date(b.start || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return fetchedEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}