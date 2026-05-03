export const TYPE_LABELS: Record<string, string> = {
  OUTGOING_LETTER: "หนังสือส่งออก",
  ORDER: "คำสั่ง",
  ANNOUNCEMENT: "ประกาศ",
  INTERNAL_MEMO: "บันทึกข้อความภายใน",
};

export const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string; icon: string }> = {
  OUTGOING_LETTER: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-400", icon: "📨" },
  ORDER:           { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-400", icon: "📋" },
  ANNOUNCEMENT:    { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-400", icon: "📢" },
  INTERNAL_MEMO:   { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-400", icon: "📝" },
};
