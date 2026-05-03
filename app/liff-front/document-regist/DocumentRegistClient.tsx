"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "../layout";
import Swal from "sweetalert2";
import { DocumentRegistryItem, deleteDocumentRegistry } from "./actions";
import { TYPE_LABELS, TYPE_COLORS } from "./constants";
import DocumentForm from "./DocumentForm";
import { formatThaiDate } from "@/lib/formatThaiDate";

const ITEMS_PER_PAGE = 10;

type Props = {
  initialData: DocumentRegistryItem[];
};

type FormState =
  | { open: false }
  | { open: true; mode: "add"; item: null }
  | { open: true; mode: "edit"; item: DocumentRegistryItem };

export default function DocumentRegistClient({ initialData }: Props) {
  const { profile, isReady, theme, toggleTheme, isTeacher, isAdmin } = useLiff();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ทั้งหมด");
  const [selectedYear, setSelectedYear] = useState("ทั้งหมด");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formState, setFormState] = useState<FormState>({ open: false });

  // 🔒 ตรวจสอบสิทธิ์
  useEffect(() => {
    if (isReady) {
      if (!profile) {
        router.push("/liff-front");
      } else if (!isTeacher && !isAdmin) {
        Swal.fire({
          icon: "warning",
          title: "ขออภัยค่ะ",
          text: "หน้านี้สงวนสิทธิ์การเข้าใช้งานเฉพาะบุคลากรครูเท่านั้น",
          confirmButtonColor: "#06C755",
        });
        router.push("/liff-front");
      }
    }
  }, [isReady, profile, isTeacher, isAdmin, router]);

  const years = useMemo(() => {
    const set = new Set(initialData.map((d) => d.year));
    return ["ทั้งหมด", ...Array.from(set).sort((a, b) => b - a).map(String)];
  }, [initialData]);

  const typeOptions = ["ทั้งหมด", ...Object.keys(TYPE_LABELS)];

  const filtered = useMemo(() => {
    return initialData.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.fullDocumentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.recipient ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedType === "ทั้งหมด" || d.type === selectedType;
      const matchYear = selectedYear === "ทั้งหมด" || d.year === Number(selectedYear);
      return matchSearch && matchType && matchYear;
    });
  }, [initialData, searchTerm, selectedType, selectedYear]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
    setExpandedId(null);
  }, [searchTerm, selectedType, selectedYear]);

  const handleDelete = async (doc: DocumentRegistryItem) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      html: `ต้องการลบ <b>${doc.fullDocumentNumber}</b><br/>${doc.title} ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
    if (!result.isConfirmed) return;

    const res = await deleteDocumentRegistry(doc.id);
    if (res.success) {
      await Swal.fire({ icon: "success", title: "ลบเรียบร้อยแล้ว", timer: 1500, showConfirmButton: false });
      router.refresh();
    } else {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: res.error });
    }
  };

  const handleFormSuccess = async () => {
    setFormState({ open: false });
    await Swal.fire({
      icon: "success",
      title: formState.open && formState.mode === "edit" ? "แก้ไขเรียบร้อยแล้ว" : "เพิ่มเอกสารแล้ว",
      timer: 1500,
      showConfirmButton: false,
    });
    router.refresh();
  };

  if (!isReady || !profile || (!isTeacher && !isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center transition-colors">
        <div className="w-12 h-12 border-4 border-[#06C755]/20 border-t-[#06C755] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">กำลังเตรียมข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"} max-w-md mx-auto shadow-2xl relative flex flex-col transition-colors duration-300`}>
      <style dangerouslySetInnerHTML={{ __html: `.hide-sb::-webkit-scrollbar{display:none}.hide-sb{-ms-overflow-style:none;scrollbar-width:none}` }} />

      {/* ─── Form Modal ─── */}
      {formState.open && (
        <DocumentForm
          mode={formState.mode}
          item={formState.item}
          onClose={() => setFormState({ open: false })}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* ─── Header ─── */}
      <header className="bg-white dark:bg-gray-800 px-5 pt-10 pb-4 shrink-0 z-40 shadow-sm flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/liff-front")}
            className="p-2 -ml-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-95 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 dark:text-white leading-tight">ทะเบียนเอกสาร</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ทั้งหมด {filtered.length} รายการ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* ปุ่มเพิ่มเอกสาร */}
          <button
            onClick={() => setFormState({ open: true, mode: "add", item: null })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#06C755] text-white text-xs font-bold shadow-sm shadow-green-200 dark:shadow-none active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่ม
          </button>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-lg transition-all active:scale-95 shadow-sm"
            aria-label="Toggle Dark Mode"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* ─── Filters ─── */}
      <div className="px-5 pt-5 pb-2 shrink-0 space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อเรื่อง, เลขที่หนังสือ, ผู้รับ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] outline-none transition-all dark:text-white"
          />
          <svg className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-sb">
          {typeOptions.map((t) => {
            const color = t !== "ทั้งหมด" ? TYPE_COLORS[t] : null;
            const isActive = selectedType === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 border flex items-center gap-1
                  ${isActive ? "bg-[#06C755] text-white border-[#06C755] shadow-md" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 border-gray-100 dark:border-gray-700"}`}
              >
                {color && !isActive && <span className={`w-2 h-2 rounded-full ${color.dot} shrink-0`} />}
                {t === "ทั้งหมด" ? "ทั้งหมด" : TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-sb">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 border
                ${selectedYear === y
                  ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 border-gray-100 dark:border-gray-700"}`}
            >
              ปี {y}
            </button>
          ))}
        </div>
      </div>

      {/* ─── List ─── */}
      <main className="flex-1 overflow-y-auto px-5 pt-2 pb-24 hide-sb space-y-3">
        {pageData.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-gray-400 dark:text-gray-500 font-medium">ไม่พบเอกสารที่ค้นหา</p>
            <button
              onClick={() => setFormState({ open: true, mode: "add", item: null })}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#06C755] text-white text-sm font-bold active:scale-95 transition-all"
            >
              ➕ เพิ่มเอกสารใหม่
            </button>
          </div>
        ) : (
          pageData.map((doc) => {
            const color = TYPE_COLORS[doc.type] ?? TYPE_COLORS.INTERNAL_MEMO;
            const isExpanded = expandedId === doc.id;
            const buddhistYear = doc.year + 543;

            return (
              <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-50 dark:border-gray-700 transition-all">
                {/* Row */}
                <button
                  onClick={() => setExpandedId((prev) => (prev === doc.id ? null : doc.id))}
                  className="w-full px-4 py-4 flex items-center gap-3 text-left active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
                >
                  <div className={`w-11 h-11 ${color.bg} rounded-xl flex items-center justify-center text-xl shrink-0`}>
                    {color.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-[#06C755] tracking-widest uppercase">{doc.fullDocumentNumber}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${color.bg} ${color.text}`}>
                        {TYPE_LABELS[doc.type] ?? doc.type}
                      </span>
                      {doc.isCircular && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                          📢 เวียน
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-snug line-clamp-1">{doc.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {doc.recipient ? `ถึง: ${doc.recipient}` : <span className="italic">ไม่ระบุผู้รับ</span>}
                      {" · "}ปี พ.ศ. {buddhistYear}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-300 shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-180 text-[#06C755]" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Accordion Detail */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 border-t border-gray-50 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">เลขที่หนังสือ</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{doc.fullDocumentNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ลำดับที่</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{doc.runningNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ประเภท</p>
                        <span className={`inline-flex text-xs font-bold px-2 py-0.5 rounded-lg ${color.bg} ${color.text}`}>
                          {color.icon} {TYPE_LABELS[doc.type]}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ผู้รับ</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{doc.recipient || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">วันที่ออกหนังสือ</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {doc.issuedDate ? formatThaiDate(new Date(doc.issuedDate).toISOString()) : "-"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">หนังสือเวียน</p>
                        <div>
                          {doc.isCircular ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                              📢 ใช่ – เวียน
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">ไม่ใช่</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">เจ้าของเรื่อง</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{doc.ownerName || "-"}</p>
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">หมายเหตุ</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl border border-gray-100 dark:border-gray-600 italic min-h-[36px]">
                        {doc.note || "ไม่มีหมายเหตุ"}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#06C755] text-white text-sm font-bold active:scale-95 transition-all shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          ดูเอกสาร
                        </a>
                      )}
                      
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => setFormState({ open: true, mode: "edit", item: doc })}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold active:scale-95 transition-all border border-blue-100 dark:border-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(doc)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-sm font-bold active:scale-95 transition-all border border-red-100 dark:border-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            ลบ
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6 pb-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-700 disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all dark:text-white bg-white dark:bg-gray-800 shadow-sm"
            >←</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  page = currentPage - 2 + i;
                  if (page > totalPages) page = totalPages - (4 - i);
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all active:scale-90
                      ${currentPage === page ? "bg-[#06C755] text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 border border-gray-100 dark:border-gray-700"}`}
                  >{page}</button>
                );
              })}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-700 disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition-all dark:text-white bg-white dark:bg-gray-800 shadow-sm"
            >→</button>
          </div>
        )}
      </main>
    </div>
  );
}
