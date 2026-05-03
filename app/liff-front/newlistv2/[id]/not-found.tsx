"use client";

import { useRouter } from "next/navigation";

// ไฟล์นี้จะทำงานเมื่อหน้า Page หลักเรียกใช้ฟังก์ชัน notFound() 
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center transition-colors max-w-md mx-auto">
      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl mb-4">📰</div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">ไม่พบข่าวสารนี้</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">ข้อมูลอาจถูกลบไปแล้ว หรือรหัสอ้างอิงไม่ถูกต้อง</p>
      <button 
        onClick={() => router.back()}
        className="px-6 py-3 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold rounded-2xl shadow-lg transition-colors active:scale-95"
      >
        กลับสู่หน้าก่อนหน้า
      </button>
    </div>
  );
}