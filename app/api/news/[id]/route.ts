import { NextRequest, NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebase-admin"; // ของคุณ

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ ต้อง await params ก่อน
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const docRef = firebaseAdmin.collection("news").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: docSnap.id,
      ...docSnap.data(),
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}