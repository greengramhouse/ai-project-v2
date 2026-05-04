"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { AlbumData } from "@/lib/getImageCloudinary";
import ShareButton from "../ShareButton";


type Props = {
  group: AlbumData;
};

export default function GalleryGroupClient({ group }: Props) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
            <div
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
            >
              <Image
                src={img.url}
                alt={img.caption || `ภาพที่ ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, 25vw"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end p-2">
                {img.caption && (
                  <p className="text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2 drop-shadow">
                    {img.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Full Screen Viewer with Zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col h-[100dvh]"
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
