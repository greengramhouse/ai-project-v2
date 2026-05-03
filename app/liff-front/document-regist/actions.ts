'use server';

import { prisma } from "@/lib/prisma";
import { DocumentRegistryInput } from "./schema";

export type DocumentRegistryItem = {
  id: number;
  type: string;
  runningNumber: number;
  year: number;
  fullDocumentNumber: string;
  title: string;
  recipient: string | null;
  url: string | null;
  note: string | null;
  issuedDate: Date;
  isCircular: boolean;
  ownerId: string | null;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
};

type ActionResult = { success: boolean; error?: string };

export async function getDocumentRegistry(): Promise<DocumentRegistryItem[]> {
  try {
    const records = await prisma.documentRegistry.findMany({
      orderBy: [{ year: "desc" }, { runningNumber: "desc" }],
    });
    return records as DocumentRegistryItem[];
  } catch (error) {
    console.error("Error fetching DocumentRegistry:", error);
    return [];
  }
}

export async function getNextRunningNumber(type: string, buddhistYear: number): Promise<number> {
  try {
    const year = buddhistYear - 543;
    const lastRecord = await prisma.documentRegistry.findFirst({
      where: { 
        type: type as any, 
        year: year 
      },
      orderBy: { runningNumber: 'desc' },
      select: { runningNumber: true }
    });
    return (lastRecord?.runningNumber ?? 0) + 1;
  } catch (error) {
    console.error("Error fetching next running number:", error);
    return 1;
  }
}

export async function createDocumentRegistry(input: DocumentRegistryInput): Promise<ActionResult> {
  try {
    const { buddhistYear, issuedDate, isCircular, ownerId, ownerName, ...rest } = input;
    
    // ตรวจสอบว่า ownerId มีอยู่ใน UserProfile หรือไม่ เพื่อป้องกัน Foreign Key Error
    let validOwnerId = null;
    if (ownerId) {
      const user = await prisma.userProfile.findUnique({ where: { id: ownerId } });
      if (user) validOwnerId = ownerId;
    }

    await prisma.documentRegistry.create({
      data: {
        ...rest,
        year: buddhistYear - 543,
        recipient: rest.recipient || null,
        url: rest.url || null,
        note: rest.note || null,
        issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
        isCircular: isCircular ?? false,
        ownerId: validOwnerId,
        ownerName: ownerName || "ไม่ระบุชื่อ",
      },
    });
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "เลขที่เอกสารซ้ำกับที่มีอยู่แล้ว กรุณาตรวจสอบลำดับที่และปี" };
    }
    console.error("createDocumentRegistry error:", error);
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }
}

export async function updateDocumentRegistry(id: number, input: DocumentRegistryInput): Promise<ActionResult> {
  try {
    const { buddhistYear, issuedDate, isCircular, ownerId, ownerName, ...rest } = input;

    // ตรวจสอบว่า ownerId มีอยู่ใน UserProfile หรือไม่ เพื่อป้องกัน Foreign Key Error
    let validOwnerId = null;
    if (ownerId) {
      const user = await prisma.userProfile.findUnique({ where: { id: ownerId } });
      if (user) validOwnerId = ownerId;
    }

    await prisma.documentRegistry.update({
      where: { id },
      data: {
        ...rest,
        year: buddhistYear - 543,
        recipient: rest.recipient || null,
        url: rest.url || null,
        note: rest.note || null,
        issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
        isCircular: isCircular ?? false,
        ownerId: validOwnerId,
        ownerName: ownerName || "ไม่ระบุชื่อ",
      },
    });
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { success: false, error: "เลขที่เอกสารซ้ำกับที่มีอยู่แล้ว" };
    }
    console.error("updateDocumentRegistry error:", error);
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }
}

export async function deleteDocumentRegistry(id: number): Promise<ActionResult> {
  try {
    await prisma.documentRegistry.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("deleteDocumentRegistry error:", error);
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }
}
