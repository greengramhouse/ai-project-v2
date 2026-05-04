"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { AlbumData } from "@/lib/getImageCloudinary";
import ShareButton from "../ShareButton";
import { useLiff } from "../../layout";


type Props = {
  group: AlbumData;
};

// Component สำหรับแสดงรูปภาพแต่ละใบพร้อม Skeleton loading และระบบ Like
function GalleryImageItem({ 
  img, 
  index, 
  onClick, 
  likeCount, 
  isLiked, 
  onLike 
}: { 
  img: any, 
  index: number, 
  onClick: () => void,
  likeCount: number,
  isLiked: boolean,
  onLike: (e: React.MouseEvent) => void
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      onClick={onClick}
      className={`relative aspect-square overflow-hidden rounded-xl cursor-pointer group bg-gray-800/50 ${isLoading ? "animate-pulse" : ""}`}
    >
      <Image
        src={img.url}
        alt={img.caption || `ภาพที่ ${index + 1}`}
        fill
        className={`object-cover transition-all duration-700 group-hover:scale-110 ${isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
        sizes="(max-width: 768px) 33vw, 25vw"
        onLoadingComplete={() => setIsLoading(false)}
      />

      {/* Like Button & Count (Top Right) */}
      {!isLoading && (
        <div className="absolute top-2 right-2 z-10 flex flex-col items-center">
          <button
            onClick={onLike}
            className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-75 ${
              isLiked ? "bg-red-500 text-white" : "bg-black/20 text-white/80 hover:bg-black/40"
            }`}
          >
            <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {likeCount > 0 && (
            <span className="text-[10px] font-bold mt-0.5 drop-shadow-md text-white">{likeCount}</span>
          )}
        </div>
      )}

      {/* Hover Overlay - แสดงเฉพาะเมื่อโหลดเสร็จแล้ว */}
      {!isLoading && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end p-2">
          {img.caption && (
            <p className="text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2 drop-shadow">
              {img.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function GalleryGroupClient({ group }: Props) {
  const router = useRouter();
  const { profile } = useLiff();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // States สำหรับระบบ Like
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikedIds, setUserLikedIds] = useState<string[]>([]);

  // ดึงข้อมูล Like เมื่อ Component mount
  useEffect(() => {
    const fetchLikes = async () => {
      if (!group.images.length) return;
      const ids = group.images.map(img => img.id).join(",");
      const userId = profile?.userId || "";
      
      try {
        const res = await fetch(`/api/gallery/like?imageIds=${ids}&userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          // แปลง Key จาก ID ที่ถูกแก้ กลับมาเป็น ID ปกติ (ถ้าจำเป็น)
          // ในที่นี้เราจะรับมือกับ ID ที่มี _ แทน /
          setLikeCounts(data.counts || {});
          setUserLikedIds(data.userLikedIds || []);
        }
      } catch (e) {
        console.error("Fetch likes failed", e);
      }
    };

    fetchLikes();
  }, [group.images, profile?.userId]);

  const handleLike = async (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation(); // ไม่ให้เปิดรูปใหญ่เวลาเตรียมกดไลก์
    if (!profile?.userId) return;

    const formattedId = imageId.replace(/\//g, '_');
    const isCurrentlyLiked = userLikedIds.includes(imageId);

    // 1. Optimistic Update (เปลี่ยนทันทีในหน้าจอ)
    setUserLikedIds(prev => 
      isCurrentlyLiked ? prev.filter(id => id !== imageId) : [...prev, imageId]
    );
    setLikeCounts(prev => ({
      ...prev,
      [formattedId]: (prev[formattedId] || 0) + (isCurrentlyLiked ? -1 : 1)
    }));

    // 2. ส่งข้อมูลไป Server
    try {
      const res = await fetch("/api/gallery/like", {
        method: "POST",
        body: JSON.stringify({ imageId, userId: profile.userId }),
      });
      
      if (!res.ok) throw new Error("Like failed");
    } catch (error) {
      // ถ้า Error ให้ Rollback (คืนค่าเดิม)
      setUserLikedIds(prev => 
        isCurrentlyLiked ? [...prev, imageId] : prev.filter(id => id !== imageId)
      );
      setLikeCounts(prev => ({
        ...prev,
        [formattedId]: (prev[formattedId] || 0) + (isCurrentlyLiked ? 1 : -1)
      }));
    }
  };

  const selectedImage = selectedIndex !== null ? group.images[selectedIndex] : null;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < group.images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-90"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-bold text-base leading-tight">{group.title}</h1>
          <p className="text-xs text-gray-400">{group.date} · {group.images.length} ภาพ</p>
        </div>
      </header>

      {/* Grid */}
      <main className="p-3">
        <div className="grid grid-cols-3 gap-1.5 md:grid-cols-4 lg:grid-cols-5">
          {group.images.map((img, index) => (
            <GalleryImageItem
              key={img.id}
              img={img}
              index={index}
              onClick={() => setSelectedIndex(index)}
              likeCount={likeCounts[img.id.replace(/\//g, '_')] || 0}
              isLiked={userLikedIds.includes(img.id)}
              onLike={(e) => handleLike(e, img.id)}
            />
          ))}
        </div>
      </main>

      {/* Full Screen Viewer with Zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 flex flex-col h-[100dvh]"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Viewer Top Bar */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm text-gray-300 font-medium">
              {selectedIndex !== null ? selectedIndex + 1 : 1} / {group.images.length}
            </span>
            <button
              onClick={() => setSelectedIndex(null)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Zoomable Image */}
          <div className="flex-1 flex items-center justify-center">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              centerOnInit
            >
              <TransformComponent
                wrapperStyle={{ width: "100vw", height: "100%" }}
                contentStyle={{ width: "100vw", display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.caption || ""}
                  width={900}
                  height={675}
                  className="max-h-[60dvh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>

          {/* Caption & Navigation */}
          <div className="shrink-0 px-4 pt-2 pb-6 pb-safe" onClick={(e) => e.stopPropagation()}>
            {selectedImage.caption && (
              <p className="text-center text-sm text-gray-300 mb-4">{selectedImage.caption}</p>
            )}

            {/* Share button — centered above nav */}
            <div className="flex justify-center mb-3">
              <ShareButton
                imageUrl={selectedImage.url}
                caption={selectedImage.caption}
                albumTitle={group.title}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={goPrev}
                disabled={selectedIndex === 0}
                className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                ← ก่อนหน้า
              </button>
              <button
                onClick={goNext}
                disabled={selectedIndex === group.images.length - 1}
                className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
