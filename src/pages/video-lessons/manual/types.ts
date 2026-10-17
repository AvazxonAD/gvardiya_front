/**
 * Qo'llanma ma'lumot turlari.
 *
 * Har bir bo'lim `guides/<bo'lim>.ts` faylida. Matndagi «...» ichidagi
 * so'zlar ekrandagi yozuvlar bilan AYNAN bir xil bo'lishi kerak:
 * foydalanuvchi ularni ekrandan qidiradi.
 *
 * QOIDA (loyiha ildizidagi CLAUDE.md): yangi bo'lim, tugma, oyna yoki
 * nomi o'zgargan yozuv qo'llanmaga ham SHU ishning o'zida qo'shiladi —
 * matn, skrinshot va PDF kitob.
 *
 * Rasmlar: `client/public/manual/<bo'lim>/*.webp` — dasturning o'zidan
 * olingan skrinshotlar, bosiladigan joy qizil ramka bilan belgilangan.
 * Fayl hali qo'yilmagan bo'lsa, rasm joyi ko'rinmaydi. Yangi skrinshotlar:
 * `npm run manual:shots` (scripts/manual-book/shots.mjs, namuna ma'lumot).
 *
 * PDF kitob ("PDF kitob" tugmasi) shu matn va rasmlardan oldindan
 * yig'iladi: qo'llanma o'zgarsa `npm run manual:pdf` ni qayta ishga
 * tushiring. Kitob ikkita — viloyat (public/manual/qollanma-<til>.pdf) va
 * super-admin (qollanma-admin-<til>.pdf) uchun alohida (sections.ts, MANUALS).
 */

export type Text = [uz: string, ru: string];

export type Shot = { src: string; caption: Text };

export type GuideStep = {
  title: Text;
  body: Text;
  items?: Text[];
  /** `items` raqamlangan ro'yxat (ketma-ket bajariladigan amallar) */
  ordered?: boolean;
  /** Foydali maslahat */
  tip?: Text;
  /** E'tibor bering — xato qilinadigan joy */
  warn?: Text;
  shots?: Shot[];
};

export type SectionGuide = {
  /** Bo'lim nima uchun kerak — bir-ikki gap */
  intro: Text;
  /** "Tayyorlab qo'ying" ro'yxati */
  need?: Text[];
  steps?: GuideStep[];
  /** Yakuniy yashil xabar */
  outro?: Text;
};

/** `shotIn("contract")("01-royxat.webp", [...])` → `/manual/contract/01-royxat.webp` */
export const shotIn =
  (section: string) =>
  (file: string, caption: Text): Shot => ({
    src: `/manual/${section}/${file}`,
    caption,
  });
