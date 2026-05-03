import { z } from "zod";

export const REGISTRY_TYPES = [
  "OUTGOING_LETTER",
  "ORDER",
  "ANNOUNCEMENT",
  "INTERNAL_MEMO",
] as const;

export const documentRegistrySchema = z.object({
  type: z.enum(REGISTRY_TYPES),
  buddhistYear: z.coerce
    .number()
    .int()
    .min(2500, "ปีต้องไม่น้อยกว่า 2500 พ.ศ.")
    .max(2600, "ปีไม่ถูกต้อง"),
  runningNumber: z.coerce
    .number()
    .int()
    .min(1, "ลำดับที่ต้องมากกว่า 0"),
  fullDocumentNumber: z.string().min(1, "กรุณากรอกเลขที่หนังสือ"),
  title: z.string().min(1, "กรุณากรอกชื่อเรื่อง").max(500, "ชื่อเรื่องยาวเกินไป"),
  recipient: z.string().max(200, "ผู้รับยาวเกินไป").optional(),
  url: z.string().max(1000, "URL ยาวเกินไป").optional(),
  note: z.string().max(500, "หมายเหตุยาวเกินไป").optional(),
  issuedDate: z.string().min(1, "กรุณาระบุวันที่ออกหนังสือ"),
  isCircular: z.boolean().default(false),
  ownerId: z.string().optional(),
  ownerName: z.string().min(1, "กรุณาระบุชื่อเจ้าของเรื่อง"),
});

export type DocumentRegistryInput = z.infer<typeof documentRegistrySchema>;
