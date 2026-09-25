import ExportMenu, { excelIcon, pdfIcon, type ExportMenuItem } from "@/Components/ExportMenu";
import { tt } from "@/utils";
import {
  exportToExcel,
  exportToPdf,
  type ExportColumn,
} from "@/lib/tableExport";

type Props<T> = {
  /** Fayl va hujjat sarlavhasi. */
  title: string;
  columns?: ExportColumn<T>[];
  /**
   * Joriy filtr/qidiruvga mos BARCHA yozuvlarni qaytaradi (sahifalashsiz).
   * Tugma bosilganda chaqiriladi — ekranda turgan sahifa emas, to'liq ro'yxat.
   */
  fetchRows?: () => Promise<T[]>;
  /**
   * Jadval ro'yxatining qaysi formatlari menyuda bo'lsin. Backend hisoboti
   * bo'lsa (`extraItems` orqali Excel + PDF), ro'yxat eksporti kerak
   * bo'lmasligi mumkin — `[]` beriladi.
   */
  kinds?: ("excel" | "pdf")[];
  /** Menyuning boshida turadigan qo'shimcha bandlar (masalan, backend hisobotlari) */
  extraItems?: ExportMenuItem[];
  size?: "sm" | "xs";
};

/**
 * Har bir jadval uchun yuklab olish menyusi ("⋮"): ichida
 * "Excel formatda yuklab olish" va "PDF formatda yuklab olish" bandlari.
 *
 * Toolbar ichiga qo'yiladi:
 *     <ExportButtons title={...} columns={...} fetchRows={...} />
 */
function ExportButtons<T>({
  title,
  columns,
  fetchRows,
  kinds = ["excel", "pdf"],
  extraItems = [],
  size,
}: Props<T>) {
  const load = async () => {
    const rows = (await fetchRows?.()) ?? [];
    if (!rows.length) throw new Error("EMPTY");
    return { title, columns: columns ?? [], rows };
  };

  const listItems: ExportMenuItem[] =
    columns && fetchRows
      ? [
          ...(kinds.includes("excel")
            ? [
                {
                  key: "list-excel",
                  icon: excelIcon,
                  label: tt("Excel formatda yuklab olish", "Скачать в формате Excel"),
                  hint: extraItems.length ? tt("Jadval ro'yxati", "Список таблицы") : undefined,
                  run: async () => exportToExcel(await load()),
                },
              ]
            : []),
          ...(kinds.includes("pdf")
            ? [
                {
                  key: "list-pdf",
                  icon: pdfIcon,
                  label: tt("PDF formatda yuklab olish", "Скачать в формате PDF"),
                  hint: extraItems.length ? tt("Jadval ro'yxati", "Список таблицы") : undefined,
                  run: async () => exportToPdf(await load()),
                },
              ]
            : []),
        ]
      : [];

  return <ExportMenu items={[...extraItems, ...listItems]} size={size} />;
}

export default ExportButtons;
