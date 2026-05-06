"use client";

import { useState } from "react";
import liff from "@line/liff";

interface ShareButtonProps {
  imageUrl: string;
  caption?: string;
  albumTitle: string;
}

export default function ShareButton({ imageUrl, caption, albumTitle }: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sharing) return;
    setSharing(true);

    try {
      // ตรวจว่าอยู่ใน LIFF environment และ share API ใช้ได้
      if (liff.isInClient() && liff.isApiAvailable("shareTargetPicker")) {
        await liff.shareTargetPicker(
          [
            {
              type: "image",
              originalContentUrl: imageUrl,
              previewImageUrl: imageUrl,
            },
          ],
          { isMultiple: true }
        );
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } else if (navigator.share) {
        // Fallback: Web Share API (แปลงเป็นรูปภาพก่อนแชร์)
        try {
          // 1. โหลดภาพจาก URL มาแปลงเป็น Blob
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // 2. สร้างเป็น File Object (ตั้งชื่อและระบุ type ให้ชัดเจน)
          const file = new File([blob], 'shared-image.jpg', { type: blob.type || 'image/jpeg' });

          // 3. เช็คว่า Browser และ OS ของผู้ใช้รองรับการแชร์แบบแนบไฟล์หรือไม่
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file], // แชร์เป็นก้อนไฟล์รูปภาพ
              title: albumTitle,
              text: caption || albumTitle,
            });
          } else {
            // ถ้า Browser ไม่รองรับการส่งไฟล์ ให้ถอยกลับไปแชร์แบบ URL เหมือนเดิม
            await navigator.share({
              title: albumTitle,
              text: caption || albumTitle,
              url: imageUrl,
            });
          }

          setShared(true);
          setTimeout(() => setShared(false), 2500);
        } catch (error) {
          console.error("Error sharing image:", error);
          // อาจจะเพิ่มแจ้งเตือนผู้ใช้ตรงนี้ถ้าระบบแชร์ทำงานล้มเหลว
        }
      } else {
        // Fallback สุดท้าย: copy link
        await navigator.clipboard.writeText(imageUrl);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch (err: any) {
      // user ยกเลิก หรือ error → ไม่ต้องทำอะไร
      console.warn("Share cancelled or failed:", err?.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      aria-label="แชร์ภาพนี้ในไลน์"
      className={`
        relative flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm
        transition-all duration-200 active:scale-95 select-none
        ${shared
          ? "bg-green-500 text-white shadow-lg shadow-green-500/40"
          : "bg-[#06C755] hover:bg-[#05b34c] text-white shadow-lg shadow-[#06C755]/30"
        }
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
    >
      {/* LINE logo / checkmark */}
      <span className="w-5 h-5 flex items-center justify-center shrink-0">
        {shared ? (
          // Checkmark
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-[scale_0.2s_ease]">
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : sharing ? (
          // Loading spinner
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          // LINE share icon
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.13.031-.195.031-.211 0-.41-.101-.538-.274l-2.494-3.405v3.085c0 .348-.283.629-.63.629-.345 0-.627-.281-.627-.629V8.108c0-.27.173-.51.43-.595.06-.023.129-.033.199-.033.195 0 .399.1.526.274l2.492 3.401V8.108c0-.345.282-.63.63-.63.345 0 .629.285.629.63v4.771zm-5.741 0c0 .348-.282.629-.631.629-.345 0-.627-.281-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.281-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
        )}
      </span>

      <span>
        {shared ? "แชร์แล้ว!" : sharing ? "กำลังแชร์..." : "แชร์ในไลน์"}
      </span>
    </button>
  );
}
