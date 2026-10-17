import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileDown, FileSpreadsheet } from "lucide-react";

import { RootState } from "@/Redux/store";
import { alertt } from "@/Redux/LanguageSlice";
import { baseUri } from "@/services/api";
import { authFetch } from "@/services/tokenManager";
import { getAppLang } from "@/lib/lang";
import { saveBlob } from "@/lib/tableExport";
import { excelBlobToPdf } from "@/lib/excelToPdf";
import { getErrorMessage } from "@/lib/errorMessage";
import { Button } from "@/ui";
import { tt } from "@/utils";

const ENDPOINT = {
  admin: "admin/dashboard/mass-events-report",
  // Backend foydalanuvchining o'z hududi bilan cheklaydi
  region: "region/dashboard/mass-events-report",
} as const;

/**
 * "Ommaviy tadbirlar hisoboti" — 1-toifali ommaviy tadbirlardan kelib tushgan
 * pul mablag'lari to'g'risida ma'lumotnoma (backend shablon asosida yasaydi):
 * super-admin dashboardida — viloyatlar kesimida, viloyat dashboardida —
 * faqat o'z hududi.
 *
 * Yuqori paneldagi ikki tugma: Excel va PDF. Davr — yuqoridagi sana
 * oralig'i, til — interfeys tili.
 */
export default function MassEventReport({ scope = "admin" }: { scope?: keyof typeof ENDPOINT }) {
  const dispatch = useDispatch();
  const { startDate, endDate } = useSelector((s: RootState) => s.dashboardDate);
  const [busy, setBusy] = useState<"excel" | "pdf" | null>(null);

  const title = tt("Ommaviy tadbirlar hisoboti", "Отчёт по массовым мероприятиям");
  const failed = tt("Hisobotni olishda xatolik", "Ошибка при получении отчёта");

  const download = async (format: "excel" | "pdf") => {
    if (busy) return;
    if (!startDate || !endDate || startDate > endDate) {
      dispatch(alertt({ success: false, text: tt("Sana oralig'i noto'g'ri", "Неверный период") }));
      return;
    }

    setBusy(format);
    try {
      const res = await authFetch(
        `${baseUri}/${ENDPOINT[scope]}?from=${startDate}&to=${endDate}&lang=${getAppLang()}`
      );
      const blob = await res.blob();
      // Xato JSON bo'lib keladi — fayl sifatida saqlanmasin, matni ko'rsatilsin
      if (!res.ok || blob.type.includes("json")) {
        const body = await blob.text().then(JSON.parse).catch(() => null);
        throw new Error(body?.message || failed);
      }

      const base = `ommaviy_tadbirlar_hisoboti_${startDate}_${endDate}`;
      if (format === "excel") saveBlob(blob, `${base}.xlsx`);
      // 26 ustunli shakl A4 da siqilib, sonlar bo'linib ketardi
      else await excelBlobToPdf(blob, `${base}.pdf`, { format: "a3", fontScale: 0.6 });
    } catch (e) {
      dispatch(alertt({ success: false, text: getErrorMessage(e, failed) }));
    } finally {
      setBusy(null);
    }
  };

  // Yuqori panelning bo'sh joyiga sig'adi: tor bo'lsa avval yozuv qisqaradi,
  // tugmalar o'z o'lchamida qoladi (ilgari blok sanalar ostiga kirib ketardi)
  return (
    <div className="flex min-w-0 items-center gap-1.5" title={title}>
      <span className="hidden min-w-0 truncate whitespace-nowrap text-[0.75rem] font-medium text-muted-foreground 2xl:block">
        {title}:
      </span>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() => download("excel")}
        loading={busy === "excel"}
        disabled={!!busy}
        aria-label={`${title} — Excel`}
      >
        <FileSpreadsheet className="text-success" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() => download("pdf")}
        loading={busy === "pdf"}
        disabled={!!busy}
        aria-label={`${title} — PDF`}
      >
        <FileDown className="text-destructive" />
        PDF
      </Button>
    </div>
  );
}
