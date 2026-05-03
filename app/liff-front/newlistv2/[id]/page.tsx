// ❌ ไม่มี "use client" อยู่ด้านบนสุด ทำให้กลายเป็น Server Component อัตโนมัติ

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";
import ClientHeader from "./ClientHeader";

type NewsData = {
  id: string;
  title: string;
  date: string;
  tag: string;
  color: string;
  content?: string;
  images?: string[];
  createdAt?: string;
};

// ✅ 1. ใส่ async ได้เลย และรับ params แบบ Promise (อ้างอิงจาก Next.js 15)
export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  
  // ✅ 2. await params เพื่อดึงค่า id
  const { id } = await params;

  // ✅ 3. ดึงข้อมูลจาก Firebase ตรงๆ โดยไม่ต้องใช้ useEffect
  const docRef = doc(db, "news", id);
  const docSnap = await getDoc(docRef);

  // ถ้าไม่มีข้อมูล ให้เรียก notFound() เพื่อให้ Next.js เด้งไปหน้า not-found.tsx อัตโนมัติ
  if (!docSnap.exists()) {
    notFound();
  }

  const news = { id: docSnap.id, ...docSnap.data() } as NewsData;
  const colorClass = news.color || "bg-blue-500";

  // ✅ 4. โค้ดแสดงผลที่สะอาดขึ้น (ส่วน Header ถูกแยกออกไป)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* เรียกใช้ Client Component สำหรับส่วนที่ต้องกดปุ่ม */}
      <ClientHeader />

      <main className="flex-1 overflow-y-auto">
        <article className="bg-white dark:bg-gray-800 min-h-full pb-10 transition-colors">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
            <span className={`inline-block px-3 py-1 ${colorClass} bg-opacity-10 dark:bg-opacity-20 text-white dark:text-opacity-90 text-xs font-bold rounded-lg mb-4`}>
              {news.tag || "ข่าวสาร"}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-snug mb-4">
              {news.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {news.date}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {news.images && news.images.length > 0 && (
              <div className="grid gap-4 mb-8">
                {news.images.map((url, idx) => (
                  url.trim() && (
                    <div key={idx} className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <img 
                        src={url} 
                        alt={`ภาพประกอบ ${idx + 1}`} 
                        className="w-full h-auto object-cover max-h-100"
                      />
                    </div>
                  )
                ))}
              </div>
            )}

            {news.content ? (
              <div 
                className="quill-content text-gray-700 dark:text-gray-300 leading-relaxed text-[15px] md:text-base break-words"
                dangerouslySetInnerHTML={{ __html: news.content }} 
              />
            ) : (
              <p className="text-gray-400 italic">ไม่มีรายละเอียดเนื้อหา</p>
            )}
          </div>
        </article>
      </main>

      {/* สไตล์ของ Quill */}
      <style dangerouslySetInnerHTML={{__html: `
        .quill-content h1 { font-size: 1.75rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 1rem; color: inherit; line-height: 1.3; }
        .quill-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; color: inherit; line-height: 1.3; }
        .quill-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: inherit; line-height: 1.4; }
        .quill-content p { margin-bottom: 1rem; }
        .quill-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .quill-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
        .quill-content li { margin-bottom: 0.25rem; }
        .quill-content a { color: #3b82f6; text-decoration: underline; }
        .quill-content strong { font-weight: 700; color: inherit; }
        .quill-content em { font-style: italic; }
        .quill-content blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; font-style: italic; color: #6b7280; margin: 1rem 0; }
        .dark .quill-content blockquote { border-left-color: #4b5563; color: #9ca3af; }
        .dark .quill-content img { border-radius: 0.75rem; max-width: 100%; height: auto; margin: 1.5rem 0; }
      `}} />
    </div>
  );
}