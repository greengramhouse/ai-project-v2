import ClientPage from "./ClientPage"; 
import { getPublicEvents } from "@/lib/getEventData"; 
import { getPublicNews } from "@/lib/getNewsData";
import { fetchAllAlbumsInMainFolder } from "@/lib/getImageCloudinary";

const GALLERY_FOLDER = "samples"; // ← ปรับให้ตรงกับชื่อโฟลเดอร์ใน Cloudinary

// ให้ Vercel re-fetch ข้อมูลใหม่ทุก 1 ชั่วโมง (ISR)
// เปลี่ยนเป็น 0 ถ้าต้องการ force-dynamic (render ใหม่ทุก request)
export const revalidate = 3600;

export default async function LiffModernHomePage() {
  const [events, news, albums] = await Promise.all([
    getPublicEvents(),
    getPublicNews(),
    fetchAllAlbumsInMainFolder(GALLERY_FOLDER),
  ]);

  return (
    <ClientPage initialEvents={events} initialNews={news} initialAlbums={albums} />
  );
}