import { z } from "zod";

export const USER_ROLES = ["user", "teacher", "admin"] as const;

export const userProfileSchema = z.object({
  lineUserId: z.string().min(1, "กรุณากรอก Line User ID"),
  displayName: z.string().optional(),
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  role: z.enum(USER_ROLES),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
