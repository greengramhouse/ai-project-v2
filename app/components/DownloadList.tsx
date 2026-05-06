"use client";

import { useState } from "react";

interface DocumentItem {
  id: string;
  name: string;
  updatedAt?: string;
  createdAt?: string;
  downloadUrl: string;
  previewUrl: string;
  category?: string;
}

/**
 * ฟังก์ชันช่วยแปลงลิงก์ Google Drive ให้สามารถแสดงใน iframe ได้
 */
const getEmbedUrl = (url: string) => {
  if (!url || url === "#") return "";

  // จัดการเฉพาะ Google Drive: แปลง /view เป็น /preview
  if (url.includes("drive.google.com") && url.includes("/view")) {
    return url.replace("/view", "/preview");
  }

  // แหล่งอื่นๆ ให้ส่ง URL เดิมกลับไป
  return url;
};

export default function DownloadList({ initialDownloads }: { initialDownloads: DocumentItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const filteredDocs = (initialDownloads || []).filter((doc) =>
    (doc.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#06C755] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="ค้นหาชื่อเอกสาร..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] outline-none transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Document List */}
      <div className="grid gap-3">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="flex items-start gap-4">
                {/* File Icon */}
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-800/50">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-md uppercase">
                      {doc.category}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      อัปเดต: {doc.updatedAt || (doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('th-TH', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : "-")}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm truncate group-hover:text-[#06C755] transition-colors">
                    {doc.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <button
                      onClick={() => setActivePreview(doc.previewUrl)}
                      className="flex-1 min-w-[100px] py-2 px-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 text-[10px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </button>
                    <button
                      onClick={() => window.open(doc.downloadUrl, "_blank")}
                      className="flex-1 min-w-[100px] py-2 px-2 bg-[#06C755]/10 hover:bg-[#06C755]/20 text-[#06C755] text-[10px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-400 text-sm italic">ไม่พบเอกสารที่ค้นหา</p>
          </div>
        )}
      </div>

      {/* Modal Preview with Iframe */}
      {activePreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl h-[80vh] bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-[#06C755] rounded-full animate-pulse" />
                แสดงตัวอย่างเอกสาร
              </h4>
              <button
                onClick={() => setActivePreview(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Iframe Body */}
            <div className="flex-1 bg-gray-50 dark:bg-black/20">
              <iframe
                src={getEmbedUrl(activePreview)}
                className="w-full h-full border-none"
                allow="autoplay"
              />
            </div>

            {/* Modal Footer (Optional) */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 flex justify-center">
              <p className="text-[10px] text-gray-400 italic">
                * หากไม่สามารถดูได้ กรุณาใช้ปุ่มดาวน์โหลดแทน
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
