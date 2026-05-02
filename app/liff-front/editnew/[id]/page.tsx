import { Suspense } from "react";
import EditNewsClient from "./EditNewsFormContent";

export default function EditNewsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center transition-colors">
          <div className="w-12 h-12 border-4 border-[#06C755]/20 border-t-[#06C755] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            กำลังเตรียมหน้าแก้ไขข้อมูล...
          </p>
        </div>
      }
    >
      <EditNewsClient />
    </Suspense>
  );
}