import { NextRequest, NextResponse } from "next/server";
import { toggleGalleryLike, getUserLikesForImages, getLikeCountsForImages } from "@/lib/gallery-likes-server";

// POST: สำหรับกด Like / Unlike
export async function POST(req: NextRequest) {
  try {
    const { userId, imageId } = await req.json();

    if (!userId || !imageId) {
      return NextResponse.json({ error: "Missing userId or imageId" }, { status: 400 });
    }

    const isLiked = await toggleGalleryLike(userId, imageId);
    return NextResponse.json({ success: true, isLiked });
  } catch (error: any) {
    console.error("API Like Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: สำหรับดึงข้อมูล Like (ใช้ตอนโหลดหน้า Gallery)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const imageIdsStr = searchParams.get("imageIds"); // ส่งมาเป็นคอมม่าคั่น เช่น id1,id2,id3

  if (!imageIdsStr) {
    return NextResponse.json({ error: "Missing imageIds" }, { status: 400 });
  }

  const imageIds = imageIdsStr.split(",");

  try {
    const [userLikedIds, likeCounts] = await Promise.all([
      userId ? getUserLikesForImages(userId, imageIds) : Promise.resolve([]),
      getLikeCountsForImages(imageIds),
    ]);

    return NextResponse.json({ userLikedIds, likeCounts });
  } catch (error: any) {
    console.error("API Fetch Likes Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
