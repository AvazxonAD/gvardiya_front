import { FONT_NAME, loadFonts } from "./tableExport";

/**
 * Backend yasagan Excel hisobotni (.xlsx) xuddi shu ko'rinishdagi PDF ga
 * aylantiradi — brauzerning o'zida.
 *
 * Har bir hisobot uchun backendda alohida PDF yozish o'rniga Excel faylning
 * o'zi o'qiladi: sarlavha qatorlari, birlashtirilgan kataklar, qalin shrift,
 * tekislash, fon rangi va chegaralar PDF ga ko'chiriladi. Shuning uchun PDF
 * Excel bilan bir xil tilda va bir xil tarkibda chiqadi.
 */

type Rgb = [number, number, number];

const argbToRgb = (argb?: string): Rgb | undefined => {
  if (!argb || argb.length < 6) return undefined;
  const hex = argb.length === 8 ? argb.slice(2) : argb;
  const n = parseInt(hex, 16);
  if (Number.isNaN(n)) return undefined;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** "A1" → { row: 1, col: 1 } */
const parseAddr = (addr: string) => {
  const m = /^([A-Z]+)(\d+)$/.exec(addr.replace(/\$/g, ""));
  if (!m) return null;
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { row: Number(m[2]), col };
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Katak qiymatini Excelda ko'ringanidek matnga aylantiradi */
const cellText = (cell: any): string => {
  let v = cell?.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && !(v instanceof Date)) {
    if ("result" in v) v = v.result; // formula
    else if ("richText" in v) return v.richText.map((r: any) => r.text).join("");
    else if ("text" in v) return String(v.text); // giperhavola
    else if ("error" in v) return String(v.error);
  }
  if (v === null || v === undefined) return "";
  if (v instanceof Date) {
    return `${pad(v.getUTCDate())}.${pad(v.getUTCMonth() + 1)}.${v.getUTCFullYear()}`;
  }
  if (typeof v === "number") {
    const fmt: string = cell.numFmt || "";
    if (/0\.0+/.test(fmt) || /#,##0/.test(fmt)) {
      const decimals = (/0\.(0+)/.exec(fmt)?.[1].length ?? 0);
      return v.toLocaleString("ru-RU", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return String(v);
  }
  return String(v);
};

export async function excelBlobToPdf(blob: Blob, fileName: string) {
  const [{ default: ExcelJS }, { jsPDF }, { default: autoTable }, fonts] = await Promise.all([
    import("exceljs"),
    import("jspdf"),
    import("jspdf-autotable"),
    loadFonts(),
  ]);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await blob.arrayBuffer());

  const sheets = workbook.worksheets.filter((s) => s.rowCount > 0);
  if (!sheets.length) throw new Error("Excel bo'sh");

  // Varaq kengligiga qarab sahifa yo'nalishi (birinchi varaq bo'yicha)
  const colWidths = (ws: any) => {
    const count = Math.max(ws.columnCount, ws.actualColumnCount || 0);
    const widths: number[] = [];
    for (let c = 1; c <= count; c++) {
      const col = ws.getColumn(c);
      widths.push(col.hidden ? 0 : col.width || 10);
    }
    return widths;
  };
  const firstWidths = colWidths(sheets[0]);
  const landscape =
    firstWidths.filter(Boolean).length > 6 || firstWidths.reduce((a, b) => a + b, 0) > 110;

  const doc = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: "a4" });
  doc.addFileToVFS(`${FONT_NAME}.ttf`, fonts.regular);
  doc.addFont(`${FONT_NAME}.ttf`, FONT_NAME, "normal");
  doc.addFileToVFS(`${FONT_NAME}-Bold.ttf`, fonts.bold);
  doc.addFont(`${FONT_NAME}-Bold.ttf`, FONT_NAME, "bold");
  doc.setFont(FONT_NAME, "normal");

  const margin = 8;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;

  sheets.forEach((ws: any, sheetIndex) => {
    if (sheetIndex > 0) doc.addPage();

    const widths = colWidths(ws);
    const visibleCols = widths.map((w, i) => (w > 0 ? i + 1 : 0)).filter(Boolean);
    const totalWidth = visibleCols.reduce((s, c) => s + widths[c - 1], 0) || 1;

    // Birlashtirilgan kataklar: bosh katak → o'lcham, qolganlari — yashirin
    const spans = new Map<string, { rowSpan: number; colSpan: number }>();
    const covered = new Set<string>();
    for (const range of ws.model?.merges ?? []) {
      const [a, b] = String(range).split(":");
      const s = parseAddr(a);
      const e = parseAddr(b ?? a);
      if (!s || !e) continue;
      let colSpan = 0;
      for (let c = s.col; c <= e.col; c++) if (widths[c - 1] > 0) colSpan++;
      spans.set(`${s.row}:${s.col}`, { rowSpan: e.row - s.row + 1, colSpan: Math.max(colSpan, 1) });
      for (let r = s.row; r <= e.row; r++)
        for (let c = s.col; c <= e.col; c++) if (r !== s.row || c !== s.col) covered.add(`${r}:${c}`);
    }

    // Oxiridagi bo'sh qatorlarni tashlab yuborish
    let lastRow = ws.rowCount;
    while (lastRow > 0) {
      const row = ws.getRow(lastRow);
      if (visibleCols.some((c) => cellText(row.getCell(c)).trim())) break;
      lastRow--;
    }

    const body: any[][] = [];
    for (let r = 1; r <= lastRow; r++) {
      const row = ws.getRow(r);
      const out: any[] = [];
      for (const c of visibleCols) {
        const key = `${r}:${c}`;
        if (covered.has(key)) continue;
        const cell = row.getCell(c);
        const span = spans.get(key);
        const font = cell.font || {};
        const align = cell.alignment || {};
        const border = cell.border || {};
        const hasBorder = !!(border.top || border.bottom || border.left || border.right);
        const fill = cell.fill?.type === "pattern" ? argbToRgb(cell.fill.fgColor?.argb) : undefined;
        const size = Number(font.size) || 11;
        out.push({
          content: cellText(cell),
          rowSpan: span?.rowSpan,
          colSpan: span?.colSpan,
          styles: {
            fontStyle: font.bold ? "bold" : "normal",
            // Excel shrifti (11pt) PDF da kichikroq — ustunlar sig'ishi uchun
            fontSize: Math.max(6.5, Math.min(14, size * 0.72)),
            halign: align.horizontal === "center" || align.horizontal === "centerContinuous"
              ? "center"
              : align.horizontal === "right"
              ? "right"
              : "left",
            valign: align.vertical === "top" ? "top" : align.vertical === "bottom" ? "bottom" : "middle",
            fillColor: fill && !(fill[0] === 255 && fill[1] === 255 && fill[2] === 255) ? fill : undefined,
            lineWidth: hasBorder ? 0.15 : 0,
            textColor: argbToRgb(font.color?.argb) ?? 20,
          },
        });
      }
      body.push(out);
    }

    const columnStyles: Record<number, { cellWidth: number }> = {};
    visibleCols.forEach((c, i) => {
      columnStyles[i] = { cellWidth: (widths[c - 1] / totalWidth) * pageWidth };
    });

    autoTable(doc, {
      startY: margin,
      body,
      theme: "plain",
      styles: {
        font: FONT_NAME,
        cellPadding: 1.2,
        overflow: "linebreak",
        lineColor: [60, 60, 60],
      },
      columnStyles,
      margin: { left: margin, right: margin, top: margin, bottom: margin + 4 },
      tableWidth: pageWidth,
      didDrawPage: () => {
        const size = doc.internal.pageSize;
        doc.setFont(FONT_NAME, "normal");
        doc.setFontSize(7);
        doc.text(String(doc.getNumberOfPages()), size.getWidth() / 2, size.getHeight() - 4, {
          align: "center",
        });
      },
    });
  });

  doc.save(fileName.replace(/\.(xlsx?|pdf)$/i, "") + ".pdf");
}
