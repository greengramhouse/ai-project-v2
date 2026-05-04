import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lineUserId: string }> }
) {
  try {
    const { lineUserId } = await params;

    const user = await prisma.userProfile.findUnique({
      where: { lineUserId },
      select: { role: true, firstName: true, lastName: true, acceptedConsent: true }
    });

    if (!user) {
      return NextResponse.json({ role: "user", acceptedConsent: false }, { status: 200 }); // Default role if not found
    }

    return NextResponse.json({ 
      role: user.role, 
      firstName: user.firstName, 
      lastName: user.lastName,
      acceptedConsent: user.acceptedConsent 
    }, { status: 200 });
  } catch (error) {
    console.error("Get User Role Error:", error);
    return NextResponse.json({ error: "Failed to fetch user role" }, { status: 500 });
  }
}
