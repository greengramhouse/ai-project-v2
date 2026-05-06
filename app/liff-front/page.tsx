import ClientPage from "./ClientPage"; 
import { getPublicEvents } from "@/lib/getEventData"; 
import { getPublicNews } from "@/lib/getNewsData";
import { fetchAllAlbumsInMainFolder } from "@/lib/getImageCloudinary";
import { getUrlForDownload } from "@/lib/getUrlForDownload";
import { connection } from "next/server";

const GALLERY_FOLDER = "samples"; // ← ปรับให้ตรงกับชื่อโฟลเดอร์ใน Cloudinary

export default async function LiffModernHomePage() {
  await connection();
  const [events, news, albums, downloads] = await Promise.all([
    getPublicEvents(),
    getPublicNews(),
    fetchAllAlbumsInMainFolder(GALLERY_FOLDER),
    getUrlForDownload(),
  ]);

  return (
    <ClientPage 
      initialEvents={events} 
      initialNews={news} 
      initialAlbums={albums} 
      initialDownloads={downloads}
    />
  );
}