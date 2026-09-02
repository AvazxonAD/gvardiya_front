/**
 * Video darslar — viloyat foydalanuvchilari dasturni shu videolardan
 * o'rganadi. Yozish amallari faqat super-adminda.
 */
export interface IVideoLesson {
  id: number;
  title: string;
  description: string | null;
  /** '/uploads/...' — to'liq manzil uchun `URL` prefiksi qo'shiladi */
  file: string;
  /**
   * PostgreSQL `BIGINT` ni `pg` drayveri MATN qilib qaytaradi (JS `number`
   * 2^53 dan katta qiymatni yo'qotishi mumkin). Shu sabab ikkala tur ham
   * kutiladi — `formatFileSize` uni o'zi songa keltiradi.
   */
  file_size: number | string | null;
  mime_type: string | null;
  /** Qo'lda tartiblash: 1-dars, 2-dars ... */
  position: number;
  created_at: string;
  updated_at: string;
  /** Kim yuklagani — faqat ro'yxat so'rovida keladi */
  author_fio?: string | null;
}

/** Bayt sonini o'qishga qulay ko'rinishga keltiradi. */
export const formatFileSize = (bytes: number | string | null): string => {
  const n = typeof bytes === "string" ? Number(bytes) : bytes;
  if (!n || Number.isNaN(n) || n <= 0) return "—";
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};
