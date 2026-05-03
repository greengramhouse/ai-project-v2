// ไฟล์นี้ Next.js จะนำไปครอบ Page หลักด้วย Suspense ให้อัตโนมัติระหว่างรอ Server ดึงข้อมูล

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center transition-colors">
      <div className="w-12 h-12 border-4 border-[#06C755]/20 border-t-[#06C755] rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">กำลังโหลดเนื้อหาข่าว...</p>
    </div>
  );
}