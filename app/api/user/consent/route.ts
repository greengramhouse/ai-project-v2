import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { lineUserId, acceptedConsent, displayName, pictureUrl } = await request.json();

    if (!lineUserId) {
      return NextResponse.json({ error: "Missing lineUserId" }, { status: 400 });
    }

    const user = await prisma.userProfile.upsert({
      where: { lineUserId },
      update: {
        acceptedConsent,
        consentDate: acceptedConsent ? new Date() : null,
        displayName: displayName || undefined,
        pictureUrl: pictureUrl || undefined,
      },
      create: {
        lineUserId,
        acceptedConsent,
        consentDate: acceptedConsent ? new Date() : null,
        displayName: displayName || null,
        pictureUrl: pictureUrl || null,
        role: "user", // Default role
      },
    });

    return NextResponse.json({ success: true, acceptedConsent: user.acceptedConsent });
  } catch (error) {
    console.error("Update Consent Error:", error);
    return NextResponse.json({ error: "Failed to update consent" }, { status: 500 });
  }
}
