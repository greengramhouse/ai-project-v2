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
      className={`relative aspect-square overflow-hidden rounded-xl cursor-pointer group bg-gray-800/50 ${
        isLoading ? "animate-pulse" : ""
      }`}
    >
      <Image
        src={img.url}
        alt={img.caption || `ภาพที่ ${index + 1}`}
        fill
        className={`object-cover transition-all duration-700 group-hover:scale-110 ${
          isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
        }`}
        sizes="(max-width: 768px) 33vw, 25vw"
        onLoad={() => setIsLoading(false)}
      />

      {/* Like Button - แสดงเมื่อโหลดรูปเสร็จ */}
      {!isLoading && (
        <button
          onClick={onLike}
          className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 transition-transform active:scale-90"
        >
          <span className={`${isLiked ? "text-red-500" : "text-white"} text-sm transition-colors`}>
            {isLiked ? "❤️" : "🤍"}
          </span>
          <span className="text-[10px] text-white font-bold">{likeCount > 0 ? likeCount : ""}</span>
        </button>
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
  const { profile } = useLiff();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // States สำหรับระบบ Like
  const [userLikedIds, setUserLikedIds] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // ดึงข้อมูล Like เมื่อเข้าหน้า
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const imageIds = group.images.map(img => img.id).join(",");
        const url = `/api/gallery/like?imageIds=${imageIds}${profile?.userId ? `&userId=${profile.userId}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.userLikedIds) setUserLikedIds(data.userLikedIds);
        if (data.likeCounts) setLikeCounts(data.likeCounts);
      } catch (err) {
        console.error("Fetch likes failed:", err);
      }
    };

    if (group.images.length > 0) {
      fetchLikes();
    }
  }, [group.images, profile?.userId]);

  const handleLike = async (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (!profile?.userId) {
      alert("กรุณาเข้าสู่ระบบผ่าน LINE เพื่อกด Like");
      return;
    }

    const safeId = imageId.replace(/\//g, '_');
    const isCurrentlyLiked = userLikedIds.includes(imageId);

    // Optimistic Update: อัปเดต UI ทันที
    setUserLikedIds(prev => 
      isCurrentlyLiked ? prev.filter(id => id !== imageId) : [...prev, imageId]
    );
    setLikeCounts(prev => ({
      ...prev,
      [safeId]: (prev[safeId] || 0) + (isCurrentlyLiked ? -1 : 1)
    }));

    try {
      const res = await fetch("/api/gallery/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.userId, imageId }),
      });
      if (!res.ok) throw new Error("Like failed");
    } catch (err) {
      // Revert ถ้า API พัง
      setUserLikedIds(prev => 
        isCurrentlyLiked ? [...prev, imageId] : prev.filter(id => id !== imageId)
      );
      setLikeCounts(prev => ({
        ...prev,
        [safeId]: (prev[safeId] || 0) + (isCurrentlyLiked ? 1 : -1)
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300 font-medium">
                {selectedIndex !== null ? selectedIndex + 1 : 1} / {group.images.length}
              </span>
              {/* Like in viewer */}
              <button 
                onClick={(e) => handleLike(e, selectedImage.id)}
                className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs"
              >
                <span>{userLikedIds.includes(selectedImage.id) ? "❤️" : "🤍"}</span>
                <span>{likeCounts[selectedImage.id.replace(/\//g, '_')] || 0}</span>
              </button>
            </div>
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
