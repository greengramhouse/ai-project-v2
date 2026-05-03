"use client"; // ส่วนนี้ต้องมีปฏิสัมพันธ์กับผู้ใช้ จึงต้องเป็น Client Component

import { useRouter } from "next/navigation";
import { useLiff } from "../../layout";

export default function ClientHeader() {
  const router = useRouter();
  const { theme, toggleTheme } = useLiff();

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-5 pt-10 pb-4 sticky top-0 z-40 shadow-sm flex items-center justify-between transition-colors">
      <button 
        onClick={() => router.back()}
        className="p-2 -ml-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-95 flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <h1 className="text-base font-bold text-gray-800 dark:text-white truncate max-w-[200px]">
        ข่าวประชาสัมพันธ์
      </h1>

      <button 
        onClick={toggleTheme}
        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-lg transition-all active:scale-95 shadow-sm"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}