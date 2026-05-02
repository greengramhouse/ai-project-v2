import { NextResponse } from "next/server";
import { pushLineMessage } from "@/lib/line-webhook/line";

// ตัวอย่าง Endpoint สำหรับให้ Cron Job เรียกใช้งาน
// สามารถทดสอบการ Push Message โดยส่ง userId ผ่าน query parameter หรือระบุในโค้ดตรงๆ
export async function GET(req: Request) {
  try {
    // 🛡️ 1. ตรวจสอบความปลอดภัย (Security Check)
    // อ่านค่า Authorization Header ที่ส่งมาจาก Cron Job
    const authHeader = req.headers.get('authorization');
    
    // ดึงรหัสลับจากไฟล์ .env ของเรา (ตั้งค่า CRON_SECRET="รหัสลับอะไรก็ได้" ใน .env)
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    // ถ้าไม่มีรหัส หรือรหัสไม่ตรง ให้เด้งออกทันที (Status 401 Unauthorized)
    // สำหรับการทดสอบ (dev environment) สามารถข้ามขั้นตอนนี้ได้ถ้าตั้งค่าให้ผ่าน แต่ใน production ควรบังคับใช้เสมอ
    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
      console.warn("⚠️ มีความพยายามเรียกใช้งาน Cron API โดยไม่ได้รับอนุญาต");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("✅ เริ่มรัน Cron Job (Authorized)...");

    const { searchParams } = new URL(req.url);
    
    // รับ userId จาก Query Param หรือระบุเป็นค่าคงที่ไว้สำหรับการทดสอบ
    const userId = searchParams.get("userId"); 
    
    // ตรวจสอบว่ามี userId หรือไม่
    if (!userId) {
      return NextResponse.json(
        { error: "กรุณาระบุ userId เช่น /api/cron/test-push?userId=U1234567890abcdef" },
        { status: 400 }
      );
    }

    // สร้างข้อความที่จะส่ง
    const messages = [
      {
        type: "text",
        text: "⏰ แจ้งเตือนจากระบบ Cron Job!\nนี่คือข้อความทดสอบการส่ง Push Message ไปยังผู้ใช้งานโดยตรง",
      },
    ];

    // ส่งข้อความ
    const success = await pushLineMessage(userId, messages);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: "Push message ส่งสำเร็จ",
        to: userId
      });
    } else {
      return NextResponse.json(
        { success: false, error: "การส่ง Push Message ล้มเหลว โปรดตรวจสอบ log หรือตรวจสอบว่า userId และ Channel Access Token ถูกต้องหรือไม่" }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in cron test-push:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดภายในระบบ" }, 
      { status: 500 }
    );
  }
}
