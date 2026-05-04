import { FieldValue } from "firebase-admin/firestore";
import { firebaseAdmin } from "./firebase-admin";

/**
 * บันทึกการ Like หรือ Unlike
 * เราใช้ 2 Collections:
 * 1. gallery_likes: เก็บว่า User คนไหน Like รูปไหน (เพื่อเช็คสถานะ)
 * 2. gallery_stats: เก็บจำนวน Like รวมของรูปนั้นๆ (เพื่อความเร็วในการแสดงผล)
 */
export async function toggleGalleryLike(userId: string, imageId: string) {
  // Firestore Document ID ไม่ชอบเครื่องหมาย / (ซึ่ง Cloudinary public_id มี)
  // เราจะเปลี่ยน / เป็น _ เพื่อความปลอดภัย
  const safeImageId = imageId.replace(/\//g, '_');
  const likeDocRef = firebaseAdmin.collection("gallery_likes").doc(`${userId}_${safeImageId}`);
  const statDocRef = firebaseAdmin.collection("gallery_stats").doc(safeImageId);

  const likeDoc = await likeDocRef.get();
  const isLiked = likeDoc.exists;

  const batch = firebaseAdmin.batch();

  if (isLiked) {
    // Unlike
    batch.delete(likeDocRef);
    batch.set(statDocRef, { 
      likeCount: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  } else {
    // Like
    batch.set(likeDocRef, {
      userId,
      imageId,
      createdAt: FieldValue.serverTimestamp()
    });
    batch.set(statDocRef, { 
      likeCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  }

  await batch.commit();
  return !isLiked; // คืนค่าสถานะใหม่ (true = liked, false = unliked)
}

/**
 * ดึงสถานะการ Like ของ User สำหรับลิสต์รูปภาพ
 */
export async function getUserLikesForImages(userId: string, imageIds: string[]) {
  if (imageIds.length === 0) return [];
  
  // หมายเหตุ: Firestore 'in' query รับได้สูงสุด 30 รายการ
  // ถ้ามีรูปเยอะกว่านี้ควรแบ่ง Chunk หรือใช้วิธีอื่น
  const chunkedIds = [];
  for (let i = 0; i < imageIds.length; i += 30) {
    chunkedIds.push(imageIds.slice(i, i + 30));
  }

  let likedIds: string[] = [];
  for (const chunk of chunkedIds) {
    const snapshot = await firebaseAdmin
      .collection("gallery_likes")
      .where("userId", "==", userId)
      .where("imageId", "in", chunk)
      .get();
    
    likedIds = [...likedIds, ...snapshot.docs.map(doc => doc.data().imageId)];
  }

  return likedIds;
}

/**
 * ดึงจำนวน Like รวมของลิสต์รูปภาพ
 */
export async function getLikeCountsForImages(imageIds: string[]) {
  if (imageIds.length === 0) return {};
  
  const safeIds = imageIds.map(id => id.replace(/\//g, '_'));
  
  // แบ่ง Chunk ละ 30 สำหรับ 'in' query
  const chunkedIds = [];
  for (let i = 0; i < safeIds.length; i += 30) {
    chunkedIds.push(safeIds.slice(i, i + 30));
  }

  const counts: Record<string, number> = {};
  
  for (const chunk of chunkedIds) {
    const snapshot = await firebaseAdmin
      .collection("gallery_stats")
      .where("__name__", "in", chunk)
      .get();

    snapshot.forEach(doc => {
      counts[doc.id] = doc.data().likeCount || 0;
    });
  }

  return counts;
}
