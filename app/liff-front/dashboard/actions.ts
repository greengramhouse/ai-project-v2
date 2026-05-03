'use server';

import { prisma } from "@/lib/prisma";
import { UserProfileInput } from "./schema";
import { revalidatePath } from "next/cache";

export type UserProfileItem = {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

type ActionResult = { success: boolean; error?: string };

export async function getUserProfiles(): Promise<UserProfileItem[]> {
  try {
    const records = await prisma.userProfile.findMany({
      orderBy: { createdAt: "desc" },
    });
    return records as UserProfileItem[];
  } catch (error) {
    console.error("Error fetching UserProfiles:", error);
    return [];
  }
}

export async function createUserProfile(input: UserProfileInput): Promise<ActionResult> {
  try {
    await prisma.userProfile.create({
      data: {
        lineUserId: input.lineUserId,
        displayName: input.displayName || null,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
      },
    });
    revalidatePath("/liff-front/dashboard");
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "Line User ID นี้มีอยู่ในระบบแล้ว" };
    }
    console.error("createUserProfile error:", error);
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }
}

export async function updateUserProfile(id: string, input: UserProfileInput): Promise<ActionResult> {
  try {
    await prisma.userProfile.update({
      where: { id },
      data: {
        lineUserId: input.lineUserId,
        displayName: input.displayName || null,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
      },
    });
    revalidatePath("/liff-front/dashboard");
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "Line User ID นี้ซ้ำกับผู้ใช้อื่น" };
    }
    console.error("updateUserProfile error:", error);
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }
}

export async function deleteUserProfile(id: string): Promise<ActionResult> {
  try {
    await prisma.userProfile.delete({ where: { id } });
    revalidatePath("/liff-front/dashboard");
    return { success: true };
  } catch (error) {
    console.error("deleteUserProfile error:", error);
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }
}
