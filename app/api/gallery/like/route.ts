import { NextResponse } from "next/server";
import { toggleImageLike, getLikeCountsForImages, getUserLikesForImages } from "@/lib/gallery-likes-server";

// POST: สลับสถานะ Like
export async function POST(request: Request) {
  try {
    const { imageId, userId } = await request.json();

    if (!imageId || !userId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const result = await toggleImageLike(imageId, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Like Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// GET: ดึงสถิติ Like (ใช้ query params เช่น ?imageIds=id1,id2&userId=abc)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageIdsStr = searchParams.get("imageIds");
  const userId = searchParams.get("userId");

  if (!imageIdsStr) return NextResponse.json({});

  const imageIds = imageIdsStr.split(",");
  
  try {
    const [counts, userLikedIds] = await Promise.all([
      getLikeCountsForImages(imageIds),
      userId ? getUserLikesForImages(userId, imageIds) : Promise.resolve([])
    ]);

    return NextResponse.json({
      counts,
      userLikedIds
    });
  } catch (error) {
    console.error("Fetch Like Stats Error:", error);
    return NextResponse.json({ error: "ดึงข้อมูลผิดพลาด" }, { status: 500 });
  }
}
