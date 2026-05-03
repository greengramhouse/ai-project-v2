import ClientPage from "./ClientPage"; 
import { getPublicEvents } from "@/lib/getEventData"; 
import { getPublicNews } from "@/lib/getNewsData"; // 👈 1. นำเข้าฟังก์ชันดึงข่าว

export default async function LiffModernHomePage() {
  // 2. รันฟังก์ชันดึงข้อมูลทั้ง 2 อย่างพร้อมกัน
  const [events, news] = await Promise.all([
    getPublicEvents(),
    getPublicNews()
  ]);

  // 3. โยนข้อมูล events และ news แบบสำเร็จรูปเข้าไปให้ Client Component
  return (
      <ClientPage initialEvents={events} initialNews={news} /> 
  );
}