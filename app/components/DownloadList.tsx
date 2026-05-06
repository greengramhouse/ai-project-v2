"use client";

import { useState } from "react";
import liff from "@line/liff";

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

  const handleShare = async (name: string, url: string) => {
    try {
      if (liff.isInClient() && liff.isApiAvailable("shareTargetPicker")) {
        await liff.shareTargetPicker(
          [
            {
              type: "text",
              text: `📁 เอกสาร: ${name}\n🔗 ดาวน์โหลดได้ที่: ${url}`,
            },
          ],
          { isMultiple: true }
        );
      } else if (navigator.share) {
        await navigator.share({
          title: name,
          text: `ดาวน์โหลดเอกสาร: ${name}`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        // แสดง UI แจ้งเตือนเล็กน้อย (ถ้ามี)
      }
    } catch (error) {
      console.warn("Share action failed:", error);
    }
  };

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
                      className="flex-1 min-w-[80px] py-2 px-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 text-[10px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </button>
                    <button
                      onClick={() => window.open(doc.downloadUrl, "_blank")}
                      className="flex-1 min-w-[80px] py-2 px-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={() => handleShare(doc.name, doc.downloadUrl)}
                      className="flex-1 min-w-[80px] py-2 px-2 bg-[#06C755]/10 hover:bg-[#06C755]/20 text-[#06C755] text-[10px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.13.031-.195.031-.211 0-.41-.101-.538-.274l-2.494-3.405v3.085c0 .348-.283.629-.63.629-.345 0-.627-.281-.627-.629V8.108c0-.27.173-.51.43-.595.06-.023.129-.033.199-.033.195 0 .399.1.526.274l2.492 3.401V8.108c0-.345.282-.63.63-.63.345 0 .629.285.629.63v4.771zm-5.741 0c0 .348-.282.629-.631.629-.345 0-.627-.281-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.281-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                      </svg>
                      Share
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
