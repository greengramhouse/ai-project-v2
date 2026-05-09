"use client";

import { useState, useEffect } from "react";
import liff from "@line/liff";
import { useLiff } from "../layout";
import { documentRegistrySchema, REGISTRY_TYPES, DocumentRegistryInput } from "./schema";
import { TYPE_LABELS } from "./constants";
import { createDocumentRegistry, updateDocumentRegistry, DocumentRegistryItem, getNextRunningNumber } from "./actions";
import Swal from "sweetalert2";

const TYPE_PREFIXES: Record<string, string> = {
  OUTGOING_LETTER: "ศธ 04156.005/",
  ORDER: "คส.",
  ANNOUNCEMENT: "ปก.",
  INTERNAL_MEMO: "บข.",
};

const generateFullDocNum = (type: string, runningNumber: number | string, year: number | string) => {
  if (type === "ORDER" || type === "ANNOUNCEMENT") {
    return `${runningNumber}/${year}`;
  }
  const prefix = TYPE_PREFIXES[type] ?? "";
  return `${prefix}${runningNumber}`;
};

const currentBuddhistYear = new Date().getFullYear() + 543;

const today = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '';

const defaultForm: DocumentRegistryInput = {
  type: "OUTGOING_LETTER",
  buddhistYear: currentBuddhistYear,
  runningNumber: 1,
  fullDocumentNumber: "",
  title: "",
  recipient: "",
  url: "",
  note: "",
  issuedDate: today,
  isCircular: false,
  ownerId: "",
  ownerName: "",
};

type FieldErrors = Partial<Record<keyof DocumentRegistryInput, string>>;

type Props = {
  mode: "add" | "edit";
  item?: DocumentRegistryItem | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DocumentForm({ mode, item, onClose, onSuccess }: Props) {
  const { profile } = useLiff();
  const [form, setForm] = useState<DocumentRegistryInput>(defaultForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // populate form when editing
  useEffect(() => {
    if (mode === "edit" && item) {
      setForm({
        type: item.type as typeof REGISTRY_TYPES[number],
        buddhistYear: item.year + 543,
        runningNumber: item.runningNumber,
        fullDocumentNumber: item.fullDocumentNumber,
        title: item.title,
        recipient: item.recipient ?? "",
        url: item.url ?? "",
        note: item.note ?? "",
        issuedDate: item.issuedDate
          ? new Date(item.issuedDate).toISOString().split('T')[0]
          : today,
        isCircular: item.isCircular ?? false,
        ownerId: item.ownerId ?? "",
        ownerName: item.ownerName,
      });
    } else if (mode === "add" && profile) {
      setForm((prev) => ({
        ...prev,
        ownerId: profile.userId,
        ownerName: prev.ownerName || profile.displayName || "",
      }));
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [mode, item]);
  const set = (field: keyof DocumentRegistryInput, value: string | number | boolean) => {
    setForm((prev) => {
      const newState = { ...prev, [field]: value };
      // ถ้าเปลี่ยนลำดับที่ ประเภท หรือปี ให้พยายามอัปเดตเลขที่หนังสือเต็มให้ด้วย
      if (field === "runningNumber" || field === "type" || field === "buddhistYear") {
        newState.fullDocumentNumber = generateFullDocNum(newState.type, newState.runningNumber, newState.buddhistYear);
      }
      return newState;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // 🔄 ดึงลำดับเลขล่าสุดอัตโนมัติเมื่อเปลี่ยนประเภทหรือปี (เฉพาะตอนเพิ่มใหม่)
  useEffect(() => {
    if (mode === "add") {
      const fetchNext = async () => {
        const nextNum = await getNextRunningNumber(form.type, form.buddhistYear);
        setForm(prev => ({ 
          ...prev, 
          runningNumber: nextNum,
          fullDocumentNumber: generateFullDocNum(prev.type, nextNum, prev.buddhistYear)
        }));
      };
      fetchNext();
    }
  }, [form.type, form.buddhistYear, mode]);

  const autoGenNumber = async () => {
    const nextNum = await getNextRunningNumber(form.type, form.buddhistYear);
    setForm(prev => ({
      ...prev,
      runningNumber: nextNum,
      fullDocumentNumber: generateFullDocNum(prev.type, nextNum, prev.buddhistYear)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = documentRegistrySchema.safeParse(form);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const fieldErrors: FieldErrors = {};
      (Object.keys(flat) as Array<keyof DocumentRegistryInput>).forEach((k) => {
        const msgs = flat[k as keyof typeof flat] as string[] | undefined;
        if (msgs?.[0]) fieldErrors[k] = msgs[0];
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res =
        mode === "add"
          ? await createDocumentRegistry(result.data)
          : await updateDocumentRegistry(item!.id, result.data);

      if (res.success) {
        // ส่ง Flex Message แจ้งรายละเอียด
        if (liff.isInClient()) {
          try {
            await liff.sendMessages([
              {
                type: "flex",
                altText: `📄 บันทึกเอกสาร: ${form.fullDocumentNumber}`,
                contents: {
                  type: "bubble",
                  size: "mega",
                  header: {
                    type: "box",
                    layout: "vertical",
                    backgroundColor: "#06C755",
                    paddingAll: "20px",
                    contents: [
                      {
                        type: "text",
                        text: mode === "add" ? "ลงทะเบียนเอกสารสำเร็จ" : "แก้ไขเอกสารสำเร็จ",
                        color: "#ffffff",
                        weight: "bold",
                        size: "lg"
                      }
                    ]
                  },
                  body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: form.fullDocumentNumber,
                        weight: "bold",
                        size: "xxl",
                        margin: "md",
                        color: "#06C755"
                      },
                      {
                        type: "text",
                        text: form.title,
                        weight: "bold",
                        size: "md",
                        wrap: true,
                        margin: "sm",
                        color: "#333333"
                      },
                      {
                        type: "separator",
                        margin: "xl"
                      },
                      {
                        type: "box",
                        layout: "vertical",
                        margin: "xl",
                        spacing: "sm",
                        contents: [
                          {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                              {
                                type: "text",
                                text: "ประเภท",
                                size: "sm",
                                color: "#aaaaaa",
                                flex: 2
                              },
                              {
                                type: "text",
                                text: TYPE_LABELS[form.type] || form.type,
                                size: "sm",
                                color: "#666666",
                                flex: 4,
                                wrap: true
                              }
                            ]
                          },
                          {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                              {
                                type: "text",
                                text: "เจ้าของเรื่อง",
                                size: "sm",
                                color: "#aaaaaa",
                                flex: 2
                              },
                              {
                                type: "text",
                                text: form.ownerName,
                                size: "sm",
                                color: "#666666",
                                flex: 4,
                                wrap: true
                              }
                            ]
                          },
                          {
                            type: "box",
                            layout: "horizontal",
                            contents: [
                              {
                                type: "text",
                                text: "ลงวันที่",
                                size: "sm",
                                color: "#aaaaaa",
                                flex: 2
                              },
                              {
                                type: "text",
                                text: form.issuedDate,
                                size: "sm",
                                color: "#666666",
                                flex: 4
                              }
                            ]
                          }
                        ]
                      },
                      {
                        type: "button",
                        action: {
                          type: "clipboard",
                          label: "📋 คัดลอกเลขที่",
                          clipboardText: form.fullDocumentNumber
                        } as any,
                        style: "secondary",
                        height: "sm",
                        margin: "xl",
                        color: "#06C755"
                      }
                    ]
                  },
                  styles: {
                    footer: {
                      separator: true
                    }
                  }
                } as any
              }
            ]);
          } catch (err) {
            console.error("Failed to send Flex Message:", err);
          }
        }
        onSuccess();
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: res.error ?? "ไม่สามารถบันทึกข้อมูลได้",
          confirmButtonColor: "#06C755",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ขออภัย",
        text: "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#06C755",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: 'calc(92dvh - 64px)', marginBottom: '64px' }}>
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-gray-800 dark:text-white">
              {mode === "add" ? "➕ เพิ่มเอกสารใหม่" : "✏️ แก้ไขเอกสาร"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">กรอกข้อมูลให้ครบถ้วน</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* ประเภทเอกสาร */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              ประเภทเอกสาร <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REGISTRY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left
                    ${form.type === t
                      ? "bg-[#06C755] text-white border-[#06C755] shadow-md"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700"
                    }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>

          {/* ปี พ.ศ. + ลำดับที่ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                ปี พ.ศ. <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.buddhistYear}
                onChange={(e) => set("buddhistYear", e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-all
                  ${errors.buddhistYear
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755]"
                  }`}
              />
              {errors.buddhistYear && <p className="text-red-500 text-xs mt-1">{errors.buddhistYear}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                ลำดับที่ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.runningNumber}
                onChange={(e) => set("runningNumber", e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-all
                  ${errors.runningNumber
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755]"
                  }`}
              />
              {errors.runningNumber && <p className="text-red-500 text-xs mt-1">{errors.runningNumber}</p>}
            </div>
          </div>

          {/* เลขที่หนังสือ */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              เลขที่หนังสือ <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="เช่น ท.001/2568"
                value={form.fullDocumentNumber}
                onChange={(e) => set("fullDocumentNumber", e.target.value)}
                className={`flex-1 px-4 py-3 rounded-2xl text-sm border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-all
                  ${errors.fullDocumentNumber
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755]"
                  }`}
              />
              <button
                type="button"
                onClick={autoGenNumber}
                title="สร้างอัตโนมัติ"
                className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
              >
                ✨ Auto
              </button>
            </div>
            {errors.fullDocumentNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.fullDocumentNumber}</p>
            )}
          </div>

          {/* ชื่อเรื่อง */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              ชื่อเรื่อง <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="กรอกชื่อเรื่องของเอกสาร"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl text-sm border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-all
                ${errors.title
                  ? "border-red-400 focus:ring-2 focus:ring-red-200"
                  : "border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755]"
                }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* ผู้รับ */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              ผู้รับ / เรียน (ถ้ามี)
            </label>
            <input
              type="text"
              placeholder="เช่น ผู้อำนวยการโรงเรียน"
              value={form.recipient}
              onChange={(e) => set("recipient", e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] transition-all"
            />
            {errors.recipient && <p className="text-red-500 text-xs mt-1">{errors.recipient}</p>}
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              URL เอกสาร (ถ้ามี)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] transition-all"
            />
            {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
          </div>

          {/* เจ้าของเรื่อง */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              เจ้าของเรื่อง <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="ระบุชื่อเจ้าของเรื่อง"
              value={form.ownerName}
              onChange={(e) => set("ownerName", e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl text-sm border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-all
                ${errors.ownerName
                  ? "border-red-400 focus:ring-2 focus:ring-red-200"
                  : "border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755]"
                }`}
            />
            {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
          </div>

          {/* วันที่ออกหนังสือ */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              วันที่ออกหนังสือ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.issuedDate}
              onChange={(e) => set("issuedDate", e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl text-sm border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-all
                ${errors.issuedDate
                  ? "border-red-400 focus:ring-2 focus:ring-red-200"
                  : "border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755]"
                }`}
            />
            {errors.issuedDate && <p className="text-red-500 text-xs mt-1">{errors.issuedDate}</p>}
          </div>

          {/* หมายเหตุ */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              หมายเหตุ (ถ้ามี)
            </label>
            <textarea
              rows={3}
              placeholder="หมายเหตุเพิ่มเติม..."
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] transition-all resize-none"
            />
            {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note}</p>}
          </div>

          {/* หนังสือเวียน */}
          <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 rounded-2xl px-4 py-3.5">
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">📢 หนังสือเวียน</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">เปิดใช้หากเป็นหนังสือเวียนถึงหลายหน่วยงาน</p>
            </div>
            <button
              type="button"
              onClick={() => set("isCircular", !form.isCircular)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none
                ${form.isCircular ? 'bg-orange-400' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300
                ${form.isCircular ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Spacer for button */}
          <div className="h-4" />
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            form="doc-form"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex-1 py-3.5 rounded-2xl bg-[#06C755] text-white text-sm font-bold shadow-md shadow-green-200/50 dark:shadow-none hover:bg-[#05b34b] active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              mode === "add" ? "➕ เพิ่มเอกสาร" : "💾 บันทึกการแก้ไข"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
