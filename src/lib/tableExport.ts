/**
 * Jadval ma'lumotlarini Excel (.xlsx) va PDF ga eksport qilish.
 *
 * Har bir ro'yxat sahifasi o'z ustunlarini (`ExportColumn`) va barcha
 * yozuvlarni olib beruvchi funksiyani beradi; fayl shu yerda brauzerning
 * o'zida yasaladi — backendda har bir jadval uchun alohida eksport
 * endpoint yozish shart emas.
 *
 * Kutubxonalar (`exceljs`, `jspdf`, `jspdf-autotable`) katta, shuning uchun
 * faqat tugma bosilganda dinamik yuklanadi va asosiy bundle'ga kirmaydi.
 *
 * PDF: jsPDF ning standart shriftlarida kirill harflari yo'q, shuning uchun
 * `public/fonts` dagi DejaVu Sans Condensed shrifti ulanadi (kirill va
 * o'zbek lotinidagi ʻ belgisini qo'llaydi).
 */

export type ExportCell = string | number | null | undefined;

export type ExportColumn<T> = {
  header: string;
  value: (row: T, index: number) => ExportCell;
  /**
   * Excel uchun alohida qiymat. Masalan karta raqami PDF da "5614 6814 ..."
   * ko'rinishida, Excelda esa bo'shliqsiz bo'lishi kerak — aks holda uni
   * saralash/qidirish noqulay. Berilmasa `value` ishlatiladi.
   */
  excelValue?: (row: T, index: number) => ExportCell;
  /** Excel ustun kengligi (belgilar soni). Berilmasa sarlavha/qiymatdan hisoblanadi. */
  width?: number;
  align?: "left" | "center" | "right";
};

export type ExportOptions<T> = {
  /** Fayl va hujjat sarlavhasi, masalan "Xodimlar". */
  title: string;
  columns: ExportColumn<T>[];
  rows: T[];
};

/** Sahifalangan API'dan "hammasini" olish uchun limit. */
export const EXPORT_ALL_LIMIT = 100000;

const FONT_REGULAR = "/fonts/DejaVuSansCondensed.ttf";
const FONT_BOLD = "/fonts/DejaVuSansCondensed-Bold.ttf";
export const FONT_NAME = "DejaVuSansCondensed";

const toCell = (v: ExportCell): string | number => {
  if (v === null || v === undefined) return "";
  return v;
};

const buildMatrix = <T>(columns: ExportColumn<T>[], rows: T[], forExcel = false) =>
  rows.map((row, i) =>
    columns.map((c) => toCell((forExcel && c.excelValue ? c.excelValue : c.value)(row, i)))
  );

export const stamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`;
};

export const safeFileName = (title: string) =>
  title.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_").trim() || "export";

export const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export async function exportToExcel<T>({ title, columns, rows }: ExportOptions<T>) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  // Varaq nomi 31 belgidan oshmasligi va ba'zi belgilarni o'z ichiga olmasligi kerak
  const sheet = workbook.addWorksheet(title.replace(/[\\/?*[\]:]/g, "").slice(0, 31) || "Sheet1");

  const matrix = buildMatrix(columns, rows, true);

  sheet.columns = columns.map((c, ci) => {
    const longest = matrix.reduce(
      (max, r) => Math.max(max, String(r[ci] ?? "").length),
      c.header.length
    );
    return {
      header: c.header,
      width: c.width ?? Math.min(Math.max(longest + 2, 8), 60),
    };
  });

  matrix.forEach((r) => sheet.addRow(r));

  const border = {
    top: { style: "thin" as const },
    left: { style: "thin" as const },
    bottom: { style: "thin" as const },
    right: { style: "thin" as const },
  };

  sheet.eachRow((row, rowNumber) => {
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = border;
      const align = columns[colNumber - 1]?.align;
      cell.alignment = {
        vertical: "middle",
        horizontal: rowNumber === 1 ? "center" : align ?? "left",
        wrapText: true,
      };
    });
  });

  const header = sheet.getRow(1);
  header.font = { bold: true };
  header.height = 24;
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  saveBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${safeFileName(title)}_${stamp()}.xlsx`
  );
}

// Shrift bir marta yuklanadi va keyingi eksportlarda qayta ishlatiladi
let fontCache: Promise<{ regular: string; bold: string }> | null = null;

const fetchBase64 = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font not found: ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

export const loadFonts = () => {
  if (!fontCache) {
    fontCache = Promise.all([fetchBase64(FONT_REGULAR), fetchBase64(FONT_BOLD)])
      .then(([regular, bold]) => ({ regular, bold }))
      .catch((e) => {
        fontCache = null;
        throw e;
      });
  }
  return fontCache;
};

export async function exportToPdf<T>({ title, columns, rows }: ExportOptions<T>) {
  const [{ jsPDF }, { default: autoTable }, fonts] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    loadFonts(),
  ]);

  // Ustun ko'p bo'lsa albom (landscape) ko'rinishi
  const doc = new jsPDF({
    orientation: columns.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.addFileToVFS(`${FONT_NAME}.ttf`, fonts.regular);
  doc.addFont(`${FONT_NAME}.ttf`, FONT_NAME, "normal");
  doc.addFileToVFS(`${FONT_NAME}-Bold.ttf`, fonts.bold);
  doc.addFont(`${FONT_NAME}-Bold.ttf`, FONT_NAME, "bold");
  doc.setFont(FONT_NAME, "bold");

  doc.setFontSize(13);
  doc.text(title, 14, 14);
  doc.setFont(FONT_NAME, "normal");
  doc.setFontSize(8);
  doc.text(new Date().toLocaleString("ru-RU"), doc.internal.pageSize.getWidth() - 14, 14, {
    align: "right",
  });

  const columnStyles: Record<number, { halign: "left" | "center" | "right" }> = {};
  columns.forEach((c, i) => {
    if (c.align) columnStyles[i] = { halign: c.align };
  });

  autoTable(doc, {
    startY: 19,
    head: [columns.map((c) => c.header)],
    body: buildMatrix(columns, rows).map((r) => r.map(String)),
    theme: "grid",
    styles: { font: FONT_NAME, fontSize: 8, cellPadding: 1.5, overflow: "linebreak" },
    headStyles: {
      font: FONT_NAME,
      fontStyle: "bold",
      fillColor: [239, 239, 239],
      textColor: 20,
      halign: "center",
      valign: "middle",
    },
    columnStyles,
    margin: { left: 10, right: 10 },
    didDrawPage: () => {
      const pageSize = doc.internal.pageSize;
      doc.setFontSize(8);
      doc.text(
        String(doc.getNumberOfPages()),
        pageSize.getWidth() / 2,
        pageSize.getHeight() - 6,
        { align: "center" }
      );
    },
  });

  doc.save(`${safeFileName(title)}_${stamp()}.pdf`);
}
