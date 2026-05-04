import { notFound } from "next/navigation";
import { fetchAllAlbumsInMainFolder } from "@/lib/getImageCloudinary";
import GalleryGroupClient from "./GalleryGroupClient";

// ชื่อโฟลเดอร์หลักใน Cloudinary — ปรับให้ตรงกับ folder จริงของคุณ
const MAIN_FOLDER = "samples";

type Props = {
  params: Promise<{ groupId: string }>;
};

export default async function GalleryGroupPage({ params }: Props) {
  const { groupId } = await params;

  const allAlbums = await fetchAllAlbumsInMainFolder(MAIN_FOLDER);
  const group = allAlbums.find((a) => a.id === groupId);

  if (!group) {
    notFound();
  }

  return <GalleryGroupClient group={group} />;
}
