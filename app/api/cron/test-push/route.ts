import { NextResponse } from "next/server";
import { pushLineMessage } from "@/lib/line-webhook/line";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "missing userId" },
        { status: 400 }
      );
    }

    const success = await pushLineMessage(userId, [
      { type: "text", text: "⏰ Cron test" },
    ]);

    return NextResponse.json({ success });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    );
  }
}