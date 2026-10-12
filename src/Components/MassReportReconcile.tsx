import { Fragment } from "react";

import { formatSum, tt } from "@/utils";

export type ReconcileItem = { label: string; value: number };

/**
 * Chiqim sahifalari pastida "Ommaviy tadbirlar hisoboti" bilan solishtirish.
 * Sahifa chiqimlarni chiqim sanasi bo'yicha ko'rsatadi, hisobot esa shartnoma
 * sanasi bo'yicha oladi: bu yerda hisobotdagi raqamlar va sahifadagi Jami
 * bilan farq nimadan iboratligi yoziladi (nol bo'lgan bandlar chiqmaydi).
 */
export default function MassReportReconcile({
  caption,
  total,
  parts,
  onlyPage,
  onlyReport,
  rounding = 0,
  roundingHint,
}: {
  /** Hisobotdagi qaysi ustunlar (masalan, "O'tkazildi") */
  caption?: string;
  total: number;
  parts: ReconcileItem[];
  /** Sahifada bor, hisobotda yo'q */
  onlyPage: ReconcileItem[];
  /** Hisobotda bor, sahifada yo'q */
  onlyReport: ReconcileItem[];
  rounding?: number;
  roundingHint?: string;
}) {
  const list = (items: ReconcileItem[]) =>
    items.filter((i) => i.value > 0).map((i) => `${formatSum(i.value)} — ${i.label}`);
  const pageItems = list(onlyPage);
  const reportItems = list(onlyReport);

  return (
    <div className="space-y-0.5 px-3 pt-2 text-[0.75rem] leading-relaxed text-muted-foreground sm:px-4">
      <p>
        <span className="font-medium text-foreground">
          {tt("«Ommaviy tadbirlar hisoboti»da", "В «Отчёте по массовым мероприятиям»")}
        </span>{" "}
        {tt("(shu davrda tuzilgan shartnomalar bo'yicha)", "(по договорам, заключённым в этот период)")}
        {caption ? `, ${caption}` : ""}: {tt("Jami", "Всего")}{" "}
        <span className="font-medium tabular-nums text-foreground">{formatSum(total) || "0"}</span>
        <span className="tabular-nums">
          {parts.map((p) => (
            <Fragment key={p.label}>
              {" · "}
              {p.label} {formatSum(p.value) || "0"}
            </Fragment>
          ))}
        </span>
      </p>
      {pageItems.length > 0 && (
        <p>
          {tt("Sahifada bor, hisobotda yo'q", "Есть на странице, нет в отчёте")}:{" "}
          <span className="tabular-nums">{pageItems.join("; ")}</span>
        </p>
      )}
      {reportItems.length > 0 && (
        <p>
          {tt("Hisobotda bor, sahifada yo'q", "Есть в отчёте, нет на странице")}:{" "}
          <span className="tabular-nums">{reportItems.join("; ")}</span>
        </p>
      )}
      {Math.abs(rounding) >= 0.01 && (
        <p>
          {tt("Yaxlitlash farqi", "Разница округления")}:{" "}
          <span className="tabular-nums">{formatSum(rounding)}</span>
          {roundingHint ? ` ${roundingHint}` : ""}
        </p>
      )}
    </div>
  );
}
