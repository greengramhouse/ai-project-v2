"use client";

import { useState, useEffect } from "react";
import { userProfileSchema, UserProfileInput, USER_ROLES } from "./schema";
import { createUserProfile, updateUserProfile, UserProfileItem } from "./actions";
import Swal from "sweetalert2";

type FieldErrors = Partial<Record<keyof UserProfileInput, string>>;

type Props = {
  mode: "add" | "edit";
  item?: UserProfileItem | null;
  onClose: () => void;
  onSuccess: () => void;
};

const defaultForm: UserProfileInput = {
  lineUserId: "",
  displayName: "",
  firstName: "",
  lastName: "",
  role: "user",
};

export default function UserForm({ mode, item, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<UserProfileInput>(defaultForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && item) {
      setForm({
        lineUserId: item.lineUserId,
        displayName: item.displayName || "",
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        role: item.role as any,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [mode, item]);

  const set = (field: keyof UserProfileInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = userProfileSchema.safeParse(form);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const fieldErrors: FieldErrors = {};
      (Object.keys(flat) as Array<keyof UserProfileInput>).forEach((k) => {
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
          ? await createUserProfile(result.data)
          : await updateUserProfile(item!.id, result.data);

      if (res.success) {
        onSuccess();
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: res.error || "ไม่สามารถบันทึกข้อมูลได้",
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '90dvh' }}>
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-gray-800 dark:text-white">
              {mode === "add" ? "👥 เพิ่มผู้ใช้งาน" : "✏️ แก้ไขข้อมูล"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">ระบุรายละเอียดให้ครบถ้วน</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form id="user-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 pb-10">
          {/* LINE User ID */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
              LINE User ID (สำคัญ)
            </label>
            <input
              type="text"
              placeholder="Uxxxx..."
              value={form.lineUserId}
              onChange={(e) => set("lineUserId", e.target.value)}
              disabled={mode === "edit"}
              className={`w-full px-4 py-3 rounded-2xl text-sm border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-all disabled:opacity-50
                ${errors.lineUserId ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755]"}`}
            />
            {errors.lineUserId && <p className="text-red-500 text-[11px] mt-1.5 ml-1">{errors.lineUserId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* ชื่อ */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                ชื่อ
              </label>
              <input
                type="text"
                placeholder="ชื่อ"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-all
                  ${errors.firstName ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755]"}`}
              />
              {errors.firstName && <p className="text-red-500 text-[11px] mt-1.5 ml-1">{errors.firstName}</p>}
            </div>
            {/* นามสกุล */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                นามสกุล
              </label>
              <input
                type="text"
                placeholder="นามสกุล"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm border bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-all
                  ${errors.lastName ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755]"}`}
              />
              {errors.lastName && <p className="text-red-500 text-[11px] mt-1.5 ml-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* สิทธิ์การใช้งาน */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
              ระดับสิทธิ์ (Role)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {USER_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => set("role", role)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all
                    ${form.role === role
                      ? "bg-[#06C755] text-white border-[#06C755] shadow-sm"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700"
                    }`}
                >
                  {role === "admin" ? "Admin" : role === "teacher" ? "Teacher" : "User"}
                </button>
              ))}
            </div>
          </div>

          {/* LINE Display Name (Optional) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
              ชื่อแสดงใน LINE (ถ้าทราบ)
            </label>
            <input
              type="text"
              placeholder="Display Name..."
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#06C755]/20 focus:border-[#06C755] transition-all"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold active:scale-95 transition-all"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            form="user-form"
            disabled={isSubmitting}
            className="flex-1 py-3.5 rounded-2xl bg-[#06C755] text-white text-sm font-bold shadow-md shadow-green-200/50 dark:shadow-none active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {mode === "add" ? "เพิ่มผู้ใช้" : "บันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
}
