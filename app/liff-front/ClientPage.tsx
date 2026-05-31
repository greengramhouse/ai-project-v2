"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useLiff } from "./layout";
import type { AlbumData } from "@/lib/getImageCloudinary";

import NewsList from "../components/NewList";
import Header from "../components/Header";
import EventListCach from "../components/EventListCach";
import DownloadList from "../components/DownloadList";


export default function ClientPage({
  initialEvents,
  initialNews,
  initialAlbums,
  initialDownloads,
}: {
  initialEvents: any[];
  initialNews: any[];
  initialAlbums: AlbumData[];
  initialDownloads: any[];
}) {
  const { profile, isReady } = useLiff();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const router = useRouter();

  // ✅ ใช้ LIFF เช็ค admin อย่างเดียว
  useEffect(() => {
    if (isReady) {
      const ADMIN_USER_IDS = [process.env.NEXT_PUBLIC_ADMIN_UID].filter(Boolean);
      const isAdmin = profile?.userId && ADMIN_USER_IDS.includes(profile.userId);
      setIsCheckingAuth(!!isAdmin);
    }
  }, [isReady, profile]);

  const handleLogin = () => {
    liff.login();
  };

  // 🔐 ยังไม่ login LINE
  if (isReady && !profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 w-full mx-auto transition-colors">
        <div className="w-32 h-32 bg-[#06C755]/10 rounded-full flex items-center justify-center mb-8">
          <img
            src="https://res.cloudinary.com/djkbdwnsc/image/upload/v1776877133/waroon/Logo-thaingam_i3poqc.png"
            alt="logo"
            className="w-20 h-20 object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          ไทยงามธุรการ
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-10 text-sm">
          ระบบจัดการข้อมูลภายในโรงเรียน
          <br />
          กรุณาเข้าสู่ระบบเพื่อใช้งาน
        </p>
        <button
          onClick={handleLogin}
          className="w-full max-w-sm py-4 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-200 transition-all active:scale-95"
        >
          เข้าสู่ระบบด้วย LINE
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 w-full mx-auto relative transition-colors duration-300">
      <Header />

      <main className="px-5 md:px-10 lg:px-20 pt-6 space-y-8 md:space-y-12 max-w-7xl mx-auto">
        {/* MENU */}
        <section>
          <div className="grid grid-cols-4 gap-4 md:gap-8">
            <Link href="/liff-front/document-regist" className="flex flex-col items-center group">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-2">📝</div>
              <span className="text-xs text-gray-600 dark:text-gray-300">ออกเลขที่หนังสือ</span>
            </Link>

            <Link href="/liff-front/student-table" className="flex flex-col items-center group">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-2">📋</div>
              <span className="text-xs text-gray-600 dark:text-gray-300">รายชื่อนักเรียน</span>
            </Link>

            <Link href="/liff-front/doccheck" className="flex flex-col items-center group">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-2">📄</div>
              <span className="text-xs text-gray-600 dark:text-gray-300">ฝากเสนอ</span>
            </Link>

            <Link href="/" className="flex flex-col items-center group">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-2">🧑🏻‍🦱</div>
              <span className="text-xs text-gray-600 dark:text-gray-300">คุยกับธุรการ</span>
            </Link>
          </div>
        </section>

        {/* NEWS */}
        <section>
          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-white">ข่าวประชาสัมพันธ์ 📢</h2>
            {isCheckingAuth && (
              <button onClick={() => router.push("/liff-front/createnews")} className="text-sm text-[#06C755]">
                + เพิ่มข่าว
              </button>
            )}
          </div>
          <NewsList initialNews={initialNews} />
        </section>

        {/* EVENTS */}
        <section>
          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-white">ปฏิทินกิจกรรม 📅</h2>
            <button onClick={() => router.push("/liff-front/events")} className="text-sm text-[#06C755]">
              ดูทั้งหมด
            </button>
          </div>
          <EventListCach events={initialEvents} compactMode />
        </section>

        {/* GALLERY */}
        <section>
          <h2 className="font-bold text-gray-800 dark:text-white mb-4">ภาพกิจกรรม 📸</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {initialAlbums.map((group) => (
              <Link
                key={group.id}
                href={`/liff-front/gallery/${group.id}`}
                className="shrink-0 w-44 group"
              >
                <div className="relative w-44 h-28 rounded-2xl overflow-hidden shadow-md">
                  <Image
                    src={group.coverUrl}
                    alt={group.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="176px"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {group.images.length} ภาพ
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mt-2 truncate">{group.title}</p>
                <p className="text-[10px] text-gray-400">{group.date}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* DOWNLOAD DOCUMENTS */}
        <section>
          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-white">ดาวน์โหลดเอกสาร 📁</h2>
          </div>
          <DownloadList initialDownloads={initialDownloads} />
        </section>
      </main>
    </div>
  );
}