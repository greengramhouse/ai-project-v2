import { notFound } from "next/navigation";
import { fetchSingleAlbum } from "@/lib/getImageCloudinary";
import GalleryGroupClient from "./GalleryGroupClient";

// ชื่อโฟลเดอร์หลักใน Cloudinary
const MAIN_FOLDER = "thaigham";

type Props = {
  params: Promise<{ groupId: string }>;
};

export default async function GalleryGroupPage({ params }: Props) {
  const { groupId } = await params;

  // ดึงแค่ข้อมูลของอัลบั้มนี้อัลบั้มเดียว
  const group = await fetchSingleAlbum(MAIN_FOLDER, groupId);

  if (!group) {
    notFound();
  }

  return <GalleryGroupClient group={group} />;
}
