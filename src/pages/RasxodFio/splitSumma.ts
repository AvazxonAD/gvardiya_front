export type SummaSplit = {
  summa_10: number;
  summa_remaining: number;
  summa_65: number;
  summa_25: number;
  summa_1_25: number;
  summa_25_2: number;
  summa_12: number;
  worker_summa: number;
};

/**
 * F.I.Sh. chiqimida bitta topshiriq summasining taqsimoti:
 *
 *   Jami (100%)
 *   ├─ Boshqarma uchun — `percent10` (10%)
 *   └─ Qolgan (90%)
 *      ├─ Moddiy bazaga — qolganning 75%
 *      └─ I va II guruh xarajatlari — qolganning 25%
 *         └─ Shaxsiy tarkibga = I-II guruh / 1.25
 *            ├─ Yagona ijtimoiy soliq — shaxsiy tarkibning 25%
 *            ├─ Daromad solig'i — shaxsiy tarkibning 12%
 *            └─ Kartaga — shaxsiy tarkib − daromad solig'i
 *
 * `saved` — saqlangan qatorning bazadagi summalari, ular qayta
 * hisoblanmaydi. Eski hujjatlar o'z qoidasida qoladi: ilgari moddiy baza
 * jamining 65%, I-II guruh jamining 25% edi (undan oldin, boshqarmasiz —
 * 75% / 25%). `summa_65` nomi o'sha davrdan, bazadagi ustun shunday.
 */
export function splitSumma(
  summa: number,
  percent10 = 10,
  saved?: Partial<Record<keyof SummaSplit, number | null>>
): SummaSplit {
  const pick = (key: keyof SummaSplit, value: number) => saved?.[key] ?? value;

  const summa_10 = pick("summa_10", (summa * percent10) / 100);
  const summa_remaining = pick("summa_remaining", summa - summa_10);
  const summa_65 = pick("summa_65", summa_remaining * 0.75);
  const summa_25 = pick("summa_25", summa_remaining * 0.25);
  const summa_1_25 = pick("summa_1_25", summa_25 / 1.25);
  const summa_25_2 = pick("summa_25_2", summa_1_25 * 0.25);
  const summa_12 = pick("summa_12", summa_1_25 * 0.12);
  const worker_summa = pick("worker_summa", summa_1_25 - summa_12);

  return {
    summa_10,
    summa_remaining,
    summa_65,
    summa_25,
    summa_1_25,
    summa_25_2,
    summa_12,
    worker_summa,
  };
}
