import { firebaseAdmin } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * ฟังก์ชันสลับสถานะ Like (Toggle)
 * ถ้ายังไม่เคยไลก์ -> เพิ่มข้อมูลไลก์ + เพิ่มตัวเลขรวม
 * ถ้าเคยไลก์แล้ว -> ลบข้อมูลไลก์ + ลดตัวเลขรวม
 */
export async function toggleImageLike(imageId: string, userId: string) {
  const likeDocId = `${userId}_${imageId.replace(/\//g, '_')}`; // ป้องกันเครื่องหมาย / ใน ID
  const likeRef = firebaseAdmin.collection("gallery_likes").doc(likeDocId);
  const statsRef = firebaseAdmin.collection("gallery_stats").doc(imageId.replace(/\//g, '_'));

  const doc = await likeRef.get();

  if (!doc.exists) {
    // 1. เพิ่มข้อมูลการไลก์ (ตารางที่ 1)
    await likeRef.set({
      userId,
      imageId,
      createdAt: new Date(),
    });

    // 2. เพิ่มตัวเลขรวม (ตารางที่ 2)
    await statsRef.set(
      {
        likeCount: FieldValue.increment(1),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return { liked: true };
  } else {
    // 1. ลบข้อมูลการไลก์ (ตารางที่ 1)
    await likeRef.delete();

    // 2. ลดตัวเลขรวม (ตารางที่ 2)
    await statsRef.set(
      {
        likeCount: FieldValue.increment(-1),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return { liked: false };
  }
}

/**
 * ดึงสถานะ Like ของ User สำหรับลิสต์รูปภาพ
 */
export async function getUserLikesForImages(userId: string, imageIds: string[]) {
  if (imageIds.length === 0) return [];
  
  const snapshot = await firebaseAdmin
    .collection("gallery_likes")
    .where("userId", "==", userId)
    .where("imageId", "in", imageIds)
    .get();

  return snapshot.docs.map(doc => doc.data().imageId);
}

/**
 * ดึงจำนวน Like รวมของลิสต์รูปภาพ
 */
export async function getLikeCountsForImages(imageIds: string[]) {
  if (imageIds.length === 0) return {};
  
  const formattedIds = imageIds.map(id => id.replace(/\//g, '_'));
  const snapshot = await firebaseAdmin
    .collection("gallery_stats")
    .where("__name__", "in", formattedIds)
    .get();

  const counts: Record<string, number> = {};
  snapshot.forEach(doc => {
    // เราต้องหาทาง Map กลับไปหา Original ID (ในที่นี้ใช้ข้อมูลข้างในถ้าเก็บไว้ หรือใช้วิธีอื่น)
    // เพื่อความง่าย ผมจะใช้ ID ที่แก้แล้วเป็น Key ไปก่อน
    counts[doc.id] = doc.data().likeCount || 0;
  });
  return counts;
}
