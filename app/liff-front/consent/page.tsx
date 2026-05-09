"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import liff from "@line/liff";
import { useLiff } from "../layout";

export default function ConsentPage() {
  const { profile, isReady, theme, acceptedConsent, setAcceptedConsent } = useLiff();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    if (!profile) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineUserId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          acceptedConsent: true,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "บันทึกข้อมูลเรียบร้อย",
          text: "ขอบคุณที่ยอมรับข้อตกลงการใช้งาน",
          confirmButtonColor: "#06C755",
          timer: 2000,
          showConfirmButton: false,
        });
        // 2. 👈 ลบ window.location.href ออก แล้วใส่โค้ด 3 บรรทัดนี้แทน
        setAcceptedConsent(true); // บอก Layout ว่ากดยอมรับแล้วนะ
        router.refresh();         // เคลียร์แคชฝั่งเบราว์เซอร์เบาๆ

        router.push("/liff-front");
      } else {
        throw new Error("Failed to update consent");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'} max-w-md mx-auto relative overflow-hidden flex flex-col transition-colors duration-300`}>
      <main className="flex-1 overflow-y-auto px-6 py-12 flex flex-col">
        <div className="flex-1">
          {/* Icon & Title */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-10 h-10 text-[#06C755]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-2">
              ข้อตกลงและความยินยอม
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              การจัดการข้อมูลส่วนบุคคล (PDPA)
            </p>
          </div>

          {/* Content Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-6 transition-colors">
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              <p className="font-bold text-gray-800 dark:text-white">
                เรียน ผู้ใช้งานระบบทุกท่าน
              </p>
              <p>
                เพื่อให้เป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) ระบบของเราจำเป็นต้องขอความยินยอมจากท่านในการเข้าถึงและแสดงผลข้อมูลดังต่อไปนี้:
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-gray-700 dark:text-gray-200">1. การเข้าถึงและเก็บรวบรวมข้อมูล</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>ข้อมูลรายชื่อนักเรียน (ชื่อ-นามสกุล, ห้องเรียน)</li>
                  <li>ข้อมูลกิจกรรมและรูปภาพในกิจกรรมต่างๆ</li>
                  <li>ข้อมูลโปรไฟล์ LINE ของท่านเพื่อระบุตัวตนในการเข้าใช้งาน</li>
                  <li>ระบบอาจมีการบันทึกประวัติการเข้าใช้งาน (Log) เพื่อความปลอดภัย</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-700 dark:text-gray-200">2. การรับรู้ข่าวสารและการแจ้งเตือน</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>ท่านยินยอมรับการแจ้งเตือน ข่าวประชาสัมพันธ์ และปฏิทินวิชาการ ผ่านช่องทาง LINE</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-700 dark:text-gray-200">3. ข้อตกลงการรักษาความลับข้อมูลนักเรียน</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>ท่านรับทราบว่า ข้อมูลรายชื่อนักเรียนและภาพกิจกรรม เป็นข้อมูลส่วนบุคคล</li>
                  <li>ท่านตกลงที่จะใช้ข้อมูลเหล่านี้เพื่อประโยชน์ทางการศึกษาและการบริหารจัดการภายในโรงเรียนเท่านั้น และ<span className="text-red-500 font-medium">จะไม่นำไปเผยแพร่ภายนอกโดยไม่ได้รับอนุญาต</span></li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 mt-4">
                <p className="text-blue-600 dark:text-blue-400 text-xs leading-normal">
                  * หากท่านมีข้อสงสัย หรือต้องการเพิกถอนความยินยอมในภายหลัง สามารถติดต่อได้ที่ฝ่ายธุรการโรงเรียน
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                <p className="text-blue-600 dark:text-blue-400 text-xs leading-normal">
                  * ข้อมูลดังกล่าวจะถูกใช้เพื่อวัตถุประสงค์ในการติดตามผลการเรียน กิจกรรม และการสื่อสารภายในโรงเรียนเท่านั้น โดยจะไม่มีการนำไปเผยแพร่ภายนอกโดยไม่ได้รับอนุญาต
                </p>
              </div>
              <p>
                หากท่านยอมรับเงื่อนไขนี้ โปรดกดปุ่ม <span className="font-bold text-[#06C755]">"ยอมรับและเข้าใช้งาน"</span> ด้านล่างเพื่อดำเนินการต่อ
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 space-y-4">
          <button
            onClick={handleAccept}
            disabled={isSubmitting}
            className={`w-full py-4 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 pointer-events-none' : ''}`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "ยอมรับและเข้าใช้งาน"
            )}
          </button>

          <button
            onClick={() => liff.closeWindow()}
            className="w-full py-4 bg-transparent text-gray-400 dark:text-gray-500 font-medium text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ไม่ยอมรับและปิดหน้านี้
          </button>
        </div>
      </main>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#06C755]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
