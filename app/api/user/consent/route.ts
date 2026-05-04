import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { lineUserId, acceptedConsent } = await request.json();

    if (!lineUserId) {
      return NextResponse.json({ error: "Missing lineUserId" }, { status: 400 });
    }

    const user = await prisma.userProfile.update({
      where: { lineUserId },
      data: {
        acceptedConsent,
        consentDate: acceptedConsent ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, acceptedConsent: user.acceptedConsent });
  } catch (error) {
    console.error("Update Consent Error:", error);
    return NextResponse.json({ error: "Failed to update consent" }, { status: 500 });
  }
}
