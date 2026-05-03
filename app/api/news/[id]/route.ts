import { firebaseAdmin } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await firebaseAdmin.collection("news").doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (err) {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}