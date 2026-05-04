import ClientPage from "./ClientPage"; 
import { getPublicEvents } from "@/lib/getEventData"; 
import { getPublicNews } from "@/lib/getNewsData";
import { fetchAllAlbumsInMainFolder } from "@/lib/getImageCloudinary";

const GALLERY_FOLDER = "samples"; // ← ปรับให้ตรงกับชื่อโฟลเดอร์ใน Cloudinary



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