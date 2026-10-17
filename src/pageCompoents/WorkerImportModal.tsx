import { useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Upload,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";

import useApi, { baseUri } from "@/services/api";
import { authFetch } from "@/services/tokenManager";
import { saveBlob } from "@/lib/tableExport";
import { cn } from "@/lib/utils";
import { alertt } from "@/Redux/LanguageSlice";
import { tt } from "@/utils";
import { Button, DataTable, Modal, SummaryRow, SummaryTile, type TableColumn } from "@/ui";

/**
 * "Hodimlar ro'yhati" → "Import": xodimlarni Excel shablondan yuklash.
 *
 * 1) Shablon yuklab olinadi (viloyat batalonlari ro'yxati bilan) va to'ldiriladi.
 * 2) Fayl tanlanishi bilan o'zi tekshiriladi — xato va ogohlantirishlar
 *    Excel qator raqami bilan, xodimlar jadvali (raqamlar yashirilgan).
 * 3) Xato bo'lmasa — import, bitta tranzaksiyada (hammasi yoki hech biri).
 * Backend: worker/import.js.
 */

type ImportWorker = {
  row: number;
  ok: boolean;
  fio: string;
  batalon_name: string;
  karta_raqam: string | null;
  xisob_raqam: string | null;
  pinfl: string | null;
};
type Issue = { level: "error" | "warning"; row: number | null; message: string };
type Meta = {
  total: number;
  valid: number;
  skipped: number;
  errors: number;
  warnings: number;
  by_batalon: { name: string; count: number }[];
};
type Preview = { workers: ImportWorker[]; issues: Issue[]; meta: Meta };

const isExcel = (f: File) => /\.(xlsx|xls)$/i.test(f.name);

export default function WorkerImportModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  /** Import tugagach — ro'yxat yangilanadi */
  onImported: () => void;
}) {
  const api = useApi();
  const dispatch = useDispatch();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [importing, setImporting] = useState(false);
  // Eskirgan tekshiruv javobi yangisini bosib ketmasin
  const checkReq = useRef(0);

  const reset = () => {
    checkReq.current++;
    setFile(null);
    setPreview(null);
    setCheckError("");
    setChecking(false);
  };

  const close = () => {
    if (importing) return;
    reset();
    onClose();
  };

  const check = async (f: File) => {
    const reqId = ++checkReq.current;
    setChecking(true);
    setPreview(null);
    setCheckError("");
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res: any = await api.post("worker/import/check", fd, true);
      if (reqId !== checkReq.current) return;
      if (res?.success) setPreview({ ...res.data, meta: res.meta });
      else setCheckError(res?.message || tt("Faylni tekshirib bo'lmadi", "Не удалось проверить файл"));
    } finally {
      if (reqId === checkReq.current) setChecking(false);
    }
  };

  const pickFile = (f: File | null | undefined) => {
    if (!f) return;
    if (!isExcel(f)) {
      dispatch(alertt({ text: tt("Faqat Excel fayl (.xlsx, .xls)", "Только файл Excel (.xlsx, .xls)"), success: false }));
      return;
    }
    setFile(f);
    check(f);
  };

  const runImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res: any = await api.post("worker/import", fd, true);
      if (res?.success) {
        dispatch(alertt({ text: res.message, success: true }));
        reset();
        onImported();
        onClose();
      } else {
        // Server qayta tekshirib xato topsa — natijasi ko'rsatiladi
        if (res?.data?.issues) setPreview({ ...res.data, meta: res.meta });
        dispatch(alertt({ text: res?.message, success: false }));
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    const res = await authFetch(`${baseUri}/worker/template`);
    if (res.ok) saveBlob(await res.blob(), "xodimlar_shablon.xlsx");
    else dispatch(alertt({ text: tt("Shablonni yuklab bo'lmadi", "Не удалось скачать шаблон"), success: false }));
  };

  // Xatolar birinchi, keyin ogohlantirishlar (qator tartibida)
  const issues = useMemo(
    () =>
      [...(preview?.issues ?? [])].sort((a, b) =>
        a.level === b.level ? (a.row ?? 0) - (b.row ?? 0) : a.level === "error" ? -1 : 1
      ),
    [preview]
  );

  const canImport = Boolean(preview) && preview!.meta.errors === 0 && preview!.meta.valid > 0;
  const importHint = !file
    ? tt("Excel faylni tanlang", "Выберите файл Excel")
    : !preview
      ? tt("Fayl tekshirilmoqda", "Файл проверяется")
      : preview.meta.errors
        ? tt("Xatolarni tuzatib, faylni qayta tanlang", "Исправьте ошибки и выберите файл снова")
        : undefined;

  const issueColumns: TableColumn<Issue>[] = [
    {
      key: "level",
      header: "",
      width: "2.5rem",
      align: "center",
      cell: (i) =>
        i.level === "error" ? (
          <XCircle className="mx-auto size-4 text-destructive" />
        ) : (
          <AlertTriangle className="mx-auto size-4 text-warning" />
        ),
    },
    {
      key: "row",
      header: tt("Qator", "Строка"),
      width: "4.5rem",
      align: "center",
      cell: (i) => <span className="tabular-nums">{i.row ?? "—"}</span>,
    },
    {
      key: "msg",
      header: tt("Izoh", "Описание"),
      cell: (i) => <span className={i.level === "error" ? "text-destructive" : "text-foreground"}>{i.message}</span>,
    },
  ];

  const workerColumns: TableColumn<ImportWorker>[] = [
    {
      key: "state",
      header: "",
      width: "2.5rem",
      align: "center",
      cell: (w) =>
        w.ok ? (
          <CheckCircle2 className="mx-auto size-4 text-success" />
        ) : (
          <XCircle className="mx-auto size-4 text-destructive" />
        ),
    },
    {
      key: "row",
      header: tt("Qator", "Строка"),
      width: "4.5rem",
      align: "center",
      cell: (w) => <span className="tabular-nums">{w.row}</span>,
    },
    { key: "fio", header: tt("F.I.Sh.", "Ф.И.О."), cell: (w) => <span className="font-medium">{w.fio || "—"}</span> },
    { key: "batalon", header: tt("Batalon", "Батальон"), width: "10rem", cell: (w) => w.batalon_name || "—" },
    {
      key: "karta",
      header: tt("Karta raqami", "Номер карты"),
      width: "9rem",
      cell: (w) => <span className="tabular-nums text-muted-foreground">{w.karta_raqam ?? "—"}</span>,
    },
    {
      key: "xisob",
      header: tt("Hisob raqami", "Лицевой счёт"),
      width: "9rem",
      hideOnMobile: true,
      cell: (w) => <span className="tabular-nums text-muted-foreground">{w.xisob_raqam ?? "—"}</span>,
    },
    {
      key: "pinfl",
      header: "PINFL",
      width: "8rem",
      hideOnMobile: true,
      cell: (w) => <span className="tabular-nums text-muted-foreground">{w.pinfl ?? "—"}</span>,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={close}
      size="full"
      dismissOnOverlay={false}
      title={tt("Xodimlarni Exceldan import qilish", "Импорт сотрудников из Excel")}
      description={tt(
        "Shablonni yuklab oling va to'ldiring, keyin faylni tanlang — u o'zi tekshiriladi. Xato bo'lmasa «Import qilish» ni bosing.",
        "Скачайте и заполните шаблон, затем выберите файл — он проверится сам. Если ошибок нет, нажмите «Импортировать»."
      )}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={downloadTemplate}>
            <Download />
            {tt("Shablonni yuklab olish", "Скачать шаблон")}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={close} disabled={importing}>
              {tt("Bekor qilish", "Отмена")}
            </Button>
            <Button onClick={runImport} disabled={!canImport || importing} title={importHint}>
              {importing ? <Loader2 className="animate-spin" /> : <Upload />}
              {preview && canImport
                ? tt(`Import qilish (${preview.meta.valid})`, `Импортировать (${preview.meta.valid})`)
                : tt("Import qilish", "Импортировать")}
            </Button>
          </div>
        </div>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          pickFile(e.target.files?.[0]);
          // Shu faylni tuzatib qayta tanlash mumkin bo'lsin
          e.target.value = "";
        }}
      />

      {!preview ? (
        <div className="flex flex-col gap-3">
          {checkError && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[0.8125rem] text-destructive">
              <span className="flex min-w-0 items-center gap-1.5">
                <XCircle className="size-4 shrink-0" />
                {checkError}
              </span>
              {file && (
                <Button variant="ghost" size="xs" onClick={() => check(file)} disabled={checking}>
                  <RefreshCw />
                  {tt("Qayta tekshirish", "Проверить снова")}
                </Button>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragOver ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:border-primary/60 hover:bg-primary/5"
            )}
          >
            {checking ? (
              <Loader2 className="size-10 animate-spin text-primary" />
            ) : (
              <UploadCloud className={cn("size-10", dragOver ? "text-primary" : "text-muted-foreground")} />
            )}
            <span className="text-[0.9375rem] font-semibold text-foreground">
              {checking
                ? tt("Fayl tekshirilmoqda...", "Файл проверяется...")
                : file
                  ? file.name
                  : tt("Excel faylni shu yerga tashlang yoki bosib tanlang", "Перетащите файл Excel сюда или нажмите, чтобы выбрать")}
            </span>
            <span className="max-w-[36rem] text-[0.8125rem] text-muted-foreground">
              {tt(
                "Pastdagi «Shablonni yuklab olish» dagi shablon: birinchi varaq, har bir xodim — bitta qator. «Batalon» ustunida viloyat batalonlari ro'yxati bor.",
                "Шаблон из «Скачать шаблон» внизу: первый лист, каждый сотрудник — одна строка. В столбце «Батальон» — список батальонов области."
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[0.8125rem] font-medium text-primary">
              <FileSpreadsheet className="size-4" />
              {tt("Faylni tanlash", "Выбрать файл")}
            </span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[0.8125rem]">
            <FileSpreadsheet className="size-4 text-success" />
            <span className="truncate font-medium">{file?.name}</span>
            {checking && <Loader2 className="size-4 animate-spin text-primary" />}
            <div className="ml-auto flex gap-1">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => file && check(file)}
                disabled={checking || importing}
                title={tt("Qayta tekshirish", "Проверить снова")}
              >
                <RefreshCw />
                {tt("Qayta tekshirish", "Проверить снова")}
              </Button>
              <Button variant="ghost" size="xs" onClick={reset} disabled={importing}>
                <X />
                {tt("Boshqa fayl", "Другой файл")}
              </Button>
            </div>
          </div>

          <SummaryRow>
            <SummaryTile label={tt("Xodimlar", "Сотрудники")} value={preview.meta.total} />
            <SummaryTile
              label={tt("Import qilinadi", "Будет импортировано")}
              value={preview.meta.errors ? 0 : preview.meta.valid}
              tone={preview.meta.errors ? undefined : "success"}
            />
            <SummaryTile
              label={tt("Xatolar", "Ошибки")}
              value={preview.meta.errors}
              tone={preview.meta.errors ? "danger" : "success"}
            />
            <SummaryTile label={tt("Ogohlantirishlar", "Предупреждения")} value={preview.meta.warnings} />
          </SummaryRow>

          {preview.meta.by_batalon.length > 0 && (
            <p className="text-[0.75rem] text-muted-foreground">
              {tt("Batalonlar bo'yicha", "По батальонам")}:{" "}
              {preview.meta.by_batalon.map((b) => `${b.name} — ${b.count}`).join(", ")}
            </p>
          )}

          {issues.length > 0 && (
            <div className="overflow-hidden rounded-md border border-border">
              <div className="border-b border-border px-3 py-2 text-[0.8125rem] font-semibold">
                {preview.meta.errors
                  ? tt(
                      "Xatolar — tuzatmaguncha import qilinmaydi; faylni tuzatib, qayta tanlang («Boshqa fayl»)",
                      "Ошибки — без исправления импорт невозможен; исправьте файл и выберите его снова («Другой файл»)"
                    )
                  : tt("Ogohlantirishlar — import to'xtamaydi, lekin tekshirib chiqing", "Предупреждения — импорт возможен, но проверьте")}
              </div>
              <DataTable columns={issueColumns} rows={issues} keyOf={(_i, n) => n} stickyHeader={false} />
            </div>
          )}

          <div className="overflow-hidden rounded-md border border-border">
            <div className="border-b border-border px-3 py-2 text-[0.8125rem] font-semibold">
              {tt("Fayldagi xodimlar", "Сотрудники в файле")}
            </div>
            <DataTable
              columns={workerColumns}
              rows={preview.workers}
              keyOf={(w) => w.row}
              stickyHeader={false}
              empty={tt("Xodim topilmadi", "Сотрудников нет")}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
