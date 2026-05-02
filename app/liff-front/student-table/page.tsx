"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from 'swr';
import { formatThaiDate } from "@/lib/formatThaiDate";
import { useLiff } from "../layout"; // 🆕 นำเข้า Context เพื่อใช้งาน Theme

type Student = {
  no: string | number;
  citizen_id: string;
  student_id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  remark: string;
  classroom: string;
};

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(data => Array.isArray(data) ? data : data.data || []);

function StudentTableContent() {
  const { data: students, error, isLoading } = useSWR<Student[]>(
    "https://script.google.com/macros/s/AKfycbwGKkKFJhysM4U02sUEd-v01wTCd7pBiHxFcTi7gPNCWybgT1xT6Md3e6bZyWry2eZx/exec?action=getStudents",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ทั้งหมด");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const classrooms = useMemo(() => {
    if (!students) return ["ทั้งหมด"];
    const classes = new Set(students.map(s => s.classroom).filter(Boolean));
    return ["ทั้งหมด", ...Array.from(classes).sort()];
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(student => {
      const matchName = 
        student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toString().includes(searchTerm);
      
      const matchClass = selectedClass === "ทั้งหมด" || student.classroom === selectedClass;

      return matchName && matchClass;
    });
  }, [students, searchTerm, selectedClass]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = useMemo(() => {
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, startIndex]);

  useMemo(() => {
    setCurrentPage(1);
    setExpandedId(null);
  }, [searchTerm, selectedClass]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#06C755]/20 border-t-[#06C755] rounded-full animate-spin mb-4 mt-10"></div>
        <p className="text-gray-400 dark:text-gray-500 text-sm">กำลังโหลดข้อมูลนักเรียน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-2xl text-sm text-center m-5 transition-colors">
        ไม่สามารถดึงข้อมูลนักเรียนได้ กรุณาลองใหม่อีกครั้ง
      </div>
    );
  }

  return (
    <>
      {/* 2. Search & Filter Section */}
      <div className="px-5 pt-6 pb-2 shrink-0 z-30">
        {/* 🎨 รองรับ Dark Mode (bg-gray-800, border-gray-700) */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="space-y-4">
            {/* ช่องค้นหา */}
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่อ หรือรหัสประจำตัว..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] outline-none transition-all dark:text-white"
              />
              <svg className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* ปุ่มกรองห้องเรียน */}
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {classrooms.map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 border
                    ${selectedClass === cls 
                      ? "bg-[#06C755] text-white border-[#06C755] shadow-md shadow-green-100 dark:shadow-none" 
                      : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-gray-100 dark:border-gray-600"}`}
                >
                  ห้อง {cls}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Student List Table */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-24 hide-scrollbar">
        <div className="space-y-3">
          {currentData.length > 0 ? (
            currentData.map((student) => {
              const studentIdStr = student.student_id?.toString() || "";
              const isExpanded = expandedId === studentIdStr;

              return (
                <div 
                  key={studentIdStr}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-50 dark:border-gray-700 transition-all"
                >
                  <button 
                    onClick={() => toggleExpand(studentIdStr)}
                    className="w-full px-4 py-4 flex items-center justify-between group active:bg-gray-50 dark:active:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                        {student.prefix === "เด็กชาย" || student.prefix === "นาย" ? "👦🏻" : "👧🏻"}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight">
                          {student.prefix}{student.first_name} {student.last_name}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium">รหัส: {student.student_id} • ห้อง {student.classroom}</div>
                      </div>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${isExpanded ? "rotate-180 text-[#06C755]" : ""}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-5 pt-1 border-t border-gray-50 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">เลขประจำตัวประชาชน</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{student.citizen_id || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">วันเกิด</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatThaiDate(student.birth_date)}</p>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">หมายเหตุ / ข้อมูลเพิ่มเติม</p>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-600 italic">
                            {student.remark || "ไม่มีข้อมูลหมายเหตุ"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-400 dark:text-gray-500 font-medium">ไม่พบข้อมูลนักเรียนที่ค้นหา</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pb-10">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-700 disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all dark:text-white"
            >
              ←
            </button>
            <div className="text-xs font-bold text-gray-500">หน้า {currentPage} จาก {totalPages}</div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-700 disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all dark:text-white"
            >
              →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function StudentTablePage() {
  const { profile, isReady, theme, toggleTheme, isTeacher, isAdmin } = useLiff();
  const router = useRouter();

  // 🔒 ระบบป้องกัน: ตรวจสอบสิทธิ์ (Teacher หรือ Admin เท่านั้น)
  useEffect(() => {
    if (isReady) {
      if (!profile) {
        router.push("/liff-front");
      } else if (!isTeacher && !isAdmin) {
        alert("ขออภัยค่ะ หน้านี้สงวนสิทธิ์การเข้าใช้งานเฉพาะบุคลากรครูเท่านั้น");
        router.push("/liff-front");
      }
    }
  }, [isReady, profile, isTeacher, isAdmin, router]);

  if (!isReady || !profile || (!isTeacher && !isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center transition-colors">
        <div className="w-12 h-12 border-4 border-[#06C755]/20 border-t-[#06C755] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">กำลังเตรียมข้อมูลนักเรียน...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'} max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300`}>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* 1. App Header */}
      <header className="bg-white dark:bg-gray-800 px-5 pt-10 pb-4 shrink-0 z-40 shadow-sm flex items-center justify-between relative transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/liff-front')}
            className="p-2 -ml-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-95 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 dark:text-white leading-tight">
              รายชื่อนักเรียน
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ข้อมูลทั้งหมดจากระบบ</p>
          </div>
        </div>

        {/* ☀️/🌙 ปุ่มสลับธีม */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-lg transition-all active:scale-95 shadow-sm"
          aria-label="Toggle Dark Mode"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        <Suspense fallback={
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#06C755]/20 border-t-[#06C755] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 dark:text-gray-500 text-sm">กำลังโหลดข้อมูลนักเรียน...</p>
          </div>
        }>
          <StudentTableContent />
        </Suspense>
      </main>
    </div>
  );
}