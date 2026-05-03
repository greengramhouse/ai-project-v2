"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "../layout";
import Swal from "sweetalert2";
import { UserProfileItem, deleteUserProfile } from "./actions";
import UserForm from "./UserForm";

type Props = {
  initialUsers: UserProfileItem[];
};

type FormState =
  | { open: false }
  | { open: true; mode: "add"; item: null }
  | { open: true; mode: "edit"; item: UserProfileItem };

const ROLE_LABELS: Record<string, string> = {
  admin: "ผู้ดูแลระบบ (Admin)",
  teacher: "บุคลากรครู (Teacher)",
  user: "ผู้ใช้งานทั่วไป (User)",
};

const ROLE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  admin: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", icon: "🛡️" },
  teacher: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", icon: "👨‍🏫" },
  user: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: "👤" },
};

export default function UserManagementClient({ initialUsers }: Props) {
  const { profile, isReady, theme, toggleTheme, isAdmin } = useLiff();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ทั้งหมด");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({ open: false });

  // 🔒 ตรวจสอบสิทธิ์ (เฉพาะ Admin เท่านั้น)
  useEffect(() => {
    if (isReady) {
      if (!profile) {
        router.push("/liff-front");
      } else if (!isAdmin) {
        Swal.fire({
          icon: "warning",
          title: "ขออภัยค่ะ",
          html: "หน้านี้สงวนสิทธิ์การเข้าใช้งาน<br/>เฉพาะผู้ดูแลระบบเท่านั้น",
          confirmButtonColor: "#06C755",
        });
        router.push("/liff-front");
      }
    }
  }, [isReady, profile, isAdmin, router]);

  const filtered = useMemo(() => {
    return initialUsers.filter((u) => {
      const matchSearch = (u.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                         (u.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                         (u.displayName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                         u.lineUserId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = selectedRole === "ทั้งหมด" || u.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [initialUsers, searchTerm, selectedRole]);

  const handleDelete = async (user: UserProfileItem) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      html: `ต้องการลบผู้ใช้ <b>${user.firstName || user.displayName}</b> ใช่หรือไม่?<br/><small class="text-red-500">การลบนี้ไม่สามารถย้อนกลับได้</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      const res = await deleteUserProfile(user.id);
      if (res.success) {
        await Swal.fire({ icon: "success", title: "ลบเรียบร้อยแล้ว", timer: 1500, showConfirmButton: false });
        router.refresh();
      } else {
        Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: res.error });
      }
    }
  };

  const handleFormSuccess = () => {
    setFormState({ open: false });
    Swal.fire({
      icon: "success",
      title: "บันทึกข้อมูลเรียบร้อย",
      timer: 1500,
      showConfirmButton: false,
    });
    router.refresh();
  };

  if (!isReady || !profile || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#06C755]/20 border-t-[#06C755] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">กำลังเตรียมข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"} max-w-md mx-auto shadow-2xl relative flex flex-col transition-colors duration-300 pb-20`}>
      {/* Form Modal */}
      {formState.open && (
        <UserForm
          mode={formState.mode}
          item={formState.item}
          onClose={() => setFormState({ open: false })}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 px-5 pt-10 pb-4 shrink-0 z-40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/liff-front")}
            className="p-2 -ml-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 dark:text-white leading-tight">จัดการผู้ใช้งาน</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ทั้งหมด {filtered.length} คน</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFormState({ open: true, mode: "add", item: null })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#06C755] text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่ม
          </button>
          <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 active:scale-90 transition-all">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="px-5 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 space-y-3 shrink-0">
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่อ, นามสกุล, LINE ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm dark:text-white focus:ring-2 focus:ring-[#06C755]/20 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-sb">
          {["ทั้งหมด", "admin", "teacher", "user"].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all
                ${selectedRole === role
                  ? "bg-[#06C755] text-white border-[#06C755] shadow-md shadow-green-100 dark:shadow-none"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700"
                }`}
            >
              {role === "ทั้งหมด" ? "ทั้งหมด" : ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-20">👥</div>
            <p className="text-gray-400 font-medium">ไม่พบข้อมูลผู้ใช้งาน</p>
          </div>
        ) : (
          filtered.map((user) => {
            const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.user;
            const isExpanded = expandedId === user.id;

            return (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-50 dark:border-gray-700 shadow-sm transition-all">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : user.id)}
                  className="p-4 flex items-center gap-4 active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl overflow-hidden shrink-0 shadow-inner">
                    {user.pictureUrl ? (
                      <img src={user.pictureUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      roleStyle.icon
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${roleStyle.bg} ${roleStyle.text}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-white text-sm truncate">
                      {user.firstName ? `${user.firstName} ${user.lastName}` : user.displayName || "ไม่ระบุชื่อ"}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate font-mono">
                      {user.lineUserId}
                    </p>
                  </div>
                  <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                    <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 border-t border-gray-50 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ชื่อ-นามสกุล</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {user.firstName || "-"} {user.lastName || "-"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">LINE Name</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{user.displayName || "-"}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">LINE User ID</p>
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                          {user.lineUserId}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormState({ open: true, mode: "edit", item: user })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold active:scale-95 transition-all border border-blue-100 dark:border-blue-800"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-sm font-bold active:scale-95 transition-all border border-red-100 dark:border-red-800"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
