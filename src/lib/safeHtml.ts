import DOMPurify from "dompurify";

/**
 * Shartnoma shablonlari (`shablon` jadvali) matnini `dangerouslySetInnerHTML`
 * ga berishdan oldin tozalaydi.
 *
 * Shablonni viloyat foydalanuvchisi tahrirlaydi, uni esa yurist va boshqa
 * foydalanuvchilar ko'radi. Tozalanmasa, shablonga yozilgan `<script>` yoki
 * `onerror=` boshqa foydalanuvchi brauzerida ishga tushib, uning sessiya
 * tokenini o'g'irlashi mumkin edi.
 *
 * Formatlash teglari (<b>, <br>, <p>, jadval va h.k.) saqlanadi — faqat
 * skript, hodisa atributlari va `javascript:` havolalari olib tashlanadi.
 * Qiymat qanday bo'lsa, React ham shunday satrga aylantirardi (massiv —
 * vergul bilan), shuning uchun ko'rinish o'zgarmaydi.
 */
export const safeHtml = (value: unknown): string =>
  value == null ? "" : DOMPurify.sanitize(String(value));
