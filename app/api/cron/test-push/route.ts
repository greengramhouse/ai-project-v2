import { NextResponse } from "next/server";
import { pushLineMessage } from "@/lib/line-webhook/line";

export const fetchCache = "force-no-store";

export async function GET(req: Request) {
  try {
    // 🛡️ 1. ตรวจสอบความปลอดภัย
    const authHeader = req.headers.get("authorization");
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
      console.warn("⚠️ Unauthorized cron access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Cron Authorized");

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "กรุณาระบุ userId เช่น /api/cron/test-push?userId=Uxxxx" },
        { status: 400 }
      );
    }

    const messages = [
      {
        type: "text",
        text: "⏰ แจ้งเตือนจากระบบ Cron Job!",
      },
    ];

    const success = await pushLineMessage(userId, messages);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Push message ส่งสำเร็จ",
        to: userId,
      });
    }

    return NextResponse.json(
      { success: false, error: "ส่งไม่สำเร็จ" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}