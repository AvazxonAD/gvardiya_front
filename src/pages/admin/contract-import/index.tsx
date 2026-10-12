import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Info,
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
import { formatDate, formatSum, tt } from "@/utils";
import { NavbarPortal } from "@/layout/navbarSlot";
import {
  Badge,
  Button,
  DataTable,
  Input,
  Label,
  Modal,
  PageBar,
  Select,
  SummaryRow,
  SummaryTile,
  ToolbarSpacer,
  type TableColumn,
} from "@/ui";

/**
 * Super-admin: viloyat shartnomalarini Exceldan import qilish.
 *
 * Viloyat faqat shablonni to'ldiradi — qolgani shu yerda avtomatik:
 * viloyatda yo'q tashkilot va batalonlar import paytida yaratiladi, hisob
 * raqami bo'lmasa shu oynada kiritiladi.
 *
 * 1) Viloyat va fayl tanlanadi (fayl tashlanadi yoki tanlanadi) — fayl o'zi
 *    tekshiriladi: har xato/ogohlantirish Excel qator raqami bilan.
 * 2) Xato bo'lmasa — import, bitta tranzaksiyada (hammasi yoki hech biri).
 * Backend: admin/contract.import (shablon: contracts.template.xlsx).
 */

type Region = { id: number; name: string };
type Options = {
  region: Region;
  admin: { id: number; login: string; fio: string } | null;
  accounts: { id: number; account_number: string }[];
  batalons: { id: number; name: string }[];
  templates: { id: number; shablon_name: string }[];
  missing: { key: string; message: string }[];
};
type Task = {
  row: number;
  batalon_name: string | null;
  batalon_new: boolean;
  worker_number: number;
  task_time: number;
  bxm_summa: number | null;
  summa: number | null;
};
type PreviewContract = {
  doc_num: string;
  rows: number[];
  ok: boolean;
  doc_date: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  organization: string;
  organization_str: string;
  organization_id: number | null;
  organization_db_name: string | null;
  adress: string;
  template_id: number;
  tasks: Task[];
  summa: number | null;
};
type Issue = { level: "error" | "warning"; row: number | null; doc_num: string | null; message: string };
type Meta = {
  contracts: number;
  tasks: number;
  total_summa: number;
  new_organizations: number;
  new_batalons: number;
  new_batalon_names: string[];
  errors: number;
  warnings: number;
};
type Result = { count: number; region: string; orgs: number; batalons: number; account: string | null };

const isExcel = (f: File) => /\.(xlsx|xls)$/i.test(f.name);

export default function ContractImport() {
  const api = useApi();
  const dispatch = useDispatch();
  const fileRef = useRef<HTMLInputElement>(null);

  const [regions, setRegions] = useState<Region[]>([]);
  const [regionId, setRegionId] = useState("");
  const [options, setOptions] = useState<Options | null>(null);
  const [accountId, setAccountId] = useState("");
  // Viloyatda hisob raqami yo'q bo'lsa — shu yerda kiritiladi, import bilan yaratiladi
  const [newAccount, setNewAccount] = useState("");
  const [templateId, setTemplateId] = useState("auto");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [checking, setChecking] = useState(false);
  const [preview, setPreview] = useState<{ contracts: PreviewContract[]; issues: Issue[]; meta: Meta } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  // Eskirgan tekshiruv javobi yangisini bosib ketmasin
  const checkReq = useRef(0);

  useEffect(() => {
    api.get<Region[]>("admin/regions").then((res) => {
      if (res?.success && Array.isArray(res.data)) setRegions(res.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Viloyat almashsa — uning ma'lumotnomalari
  useEffect(() => {
    setOptions(null);
    setAccountId("");
    setNewAccount("");
    if (!regionId) return;
    api.get<Options>(`admin/contract-import/options?region_id=${regionId}`).then((res) => {
      if (res?.success && res.data) {
        setOptions(res.data);
        if (res.data.accounts.length === 1) setAccountId(String(res.data.accounts[0].id));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  const formData = (withImport: boolean) => {
    const fd = new FormData();
    fd.append("region_id", regionId);
    if (withImport) {
      if (accountId) fd.append("account_number_id", accountId);
      else fd.append("new_account_number", newAccount.replace(/\s+/g, ""));
      fd.append("template_id", templateId);
    }
    fd.append("file", file as File);
    return fd;
  };

  const check = async () => {
    if (!file || !regionId) return;
    const reqId = ++checkReq.current;
    setChecking(true);
    try {
      const res: any = await api.post("admin/contract-import/check", formData(false), true);
      if (reqId !== checkReq.current) return;
      if (res?.success) setPreview({ ...res.data, meta: res.meta });
      else {
        setPreview(null);
        dispatch(alertt({ text: res?.message, success: false }));
      }
    } finally {
      if (reqId === checkReq.current) setChecking(false);
    }
  };

  // Fayl yoki viloyat tanlanishi bilan — o'zi tekshiriladi
  useEffect(() => {
    setPreview(null);
    if (file && regionId) check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, regionId]);

  const pickFile = (f: File | null | undefined) => {
    if (!f) return;
    if (!isExcel(f)) {
      dispatch(alertt({ text: tt("Faqat Excel fayl (.xlsx, .xls)", "Только файл Excel (.xlsx, .xls)"), success: false }));
      return;
    }
    setResult(null);
    setFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const runImport = async () => {
    setImporting(true);
    try {
      const res: any = await api.post("admin/contract-import", formData(true), true);
      if (res?.success) {
        setResult({
          count: res.data?.length ?? 0,
          region: options?.region.name ?? "",
          orgs: res.meta?.created_organizations ?? 0,
          batalons: res.meta?.created_batalons ?? 0,
          account: res.meta?.created_account ? newAccount.replace(/\s+/g, "") : null,
        });
        setPreview(null);
        setFile(null);
        // Hisob raqami / batalonlar endi viloyatda bor — ma'lumotnoma yangilanadi
        const opt = await api.get<Options>(`admin/contract-import/options?region_id=${regionId}`);
        if (opt?.success && opt.data) {
          setOptions(opt.data);
          setNewAccount("");
          if (opt.data.accounts.length === 1) setAccountId(String(opt.data.accounts[0].id));
        }
        dispatch(alertt({ text: res.message, success: true }));
      } else {
        // Server yana tekshirib xato topsa — natijasi ko'rsatiladi
        if (res?.data?.issues) setPreview({ ...res.data, meta: res.meta });
        dispatch(alertt({ text: res?.message, success: false }));
      }
    } finally {
      setImporting(false);
      setConfirmOpen(false);
    }
  };

  const downloadTemplate = async () => {
    const res = await authFetch(`${baseUri}/admin/contract-import/template`);
    if (res.ok) saveBlob(await res.blob(), "contracts.template.xlsx");
    else dispatch(alertt({ text: tt("Shablonni yuklab bo'lmadi", "Не удалось скачать шаблон"), success: false }));
  };

  const templateName = (id: number) => options?.templates.find((t) => t.id === id)?.shablon_name ?? id;
  const missing = options?.missing ?? [];
  const noAccounts = Boolean(options) && options!.accounts.length === 0;
  const newAccountClean = newAccount.replace(/\s+/g, "");
  const accountReady = accountId ? true : noAccounts && /^\d+$/.test(newAccountClean);
  const canImport =
    Boolean(preview) && preview!.meta.errors === 0 && preview!.contracts.length > 0 && !missing.length && accountReady;

  const importHint = !regionId
    ? tt("Viloyatni tanlang", "Выберите область")
    : !file
      ? tt("Excel faylni tanlang", "Выберите файл Excel")
      : !preview
        ? tt("Fayl tekshirilmoqda", "Файл проверяется")
        : preview.meta.errors
          ? tt("Xatolarni tuzatib, faylni qayta tanlang", "Исправьте ошибки и выберите файл снова")
          : !accountReady
            ? noAccounts
              ? tt("Viloyat hisob raqamini kiriting", "Введите расчётный счёт области")
              : tt("Hisob raqamini tanlang", "Выберите расчётный счёт")
            : undefined;

  // Xatolar birinchi, keyin ogohlantirishlar (qator tartibida)
  const issues = useMemo(
    () =>
      [...(preview?.issues ?? [])].sort(
        (a, b) => (a.level === b.level ? (a.row ?? 0) - (b.row ?? 0) : a.level === "error" ? -1 : 1)
      ),
    [preview]
  );

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
      key: "doc",
      header: tt("Shartnoma №", "№ договора"),
      width: "7rem",
      cell: (i) => <span className="tabular-nums">{i.doc_num ?? "—"}</span>,
    },
    {
      key: "msg",
      header: tt("Izoh", "Описание"),
      cell: (i) => (
        <span className={i.level === "error" ? "text-destructive" : "text-foreground"}>{i.message}</span>
      ),
    },
  ];

  const contractColumns: TableColumn<PreviewContract>[] = [
    {
      key: "state",
      header: "",
      width: "2.5rem",
      align: "center",
      cell: (c) =>
        c.ok ? (
          <CheckCircle2 className="mx-auto size-4 text-success" />
        ) : (
          <XCircle className="mx-auto size-4 text-destructive" />
        ),
    },
    {
      key: "doc",
      header: "№",
      width: "4.5rem",
      cell: (c) => (
        <div className="flex flex-col">
          <span className="font-medium tabular-nums">{c.doc_num}</span>
          <span className="text-[0.6875rem] text-muted-foreground tabular-nums">
            {tt("qator", "стр.")} {c.rows.join(", ")}
          </span>
        </div>
      ),
    },
    {
      key: "date",
      header: tt("Sana", "Дата"),
      width: "6.5rem",
      cell: (c) => <span className="tabular-nums">{c.doc_date ? formatDate(c.doc_date) : "—"}</span>,
    },
    {
      key: "org",
      header: tt("Buyurtmachi", "Заказчик"),
      cell: (c) => (
        <div className="min-w-0 max-w-[min(30rem,32vw)]">
          <div className="truncate font-medium" title={c.organization_db_name || c.organization}>
            {c.organization_db_name || c.organization}
          </div>
          <div className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
            {c.organization_str && <span className="tabular-nums">{c.organization_str}</span>}
            {c.organization_id ? (
              <Badge tone="success">{tt("bazada bor", "есть в базе")}</Badge>
            ) : (
              <Badge tone="primary">{tt("yangi", "новая")}</Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "event",
      header: tt("Tadbir", "Мероприятие"),
      hideOnMobile: true,
      cell: (c) => (
        <div className="min-w-0 max-w-[min(24rem,24vw)]">
          <div className="truncate" title={c.adress}>
            {c.adress}
          </div>
          <div className="text-[0.6875rem] text-muted-foreground tabular-nums">
            {c.start_date ? formatDate(c.start_date) : "—"}
            {c.end_date && c.end_date !== c.start_date ? ` – ${formatDate(c.end_date)}` : ""}
            {c.start_time ? ` · ${c.start_time}–${c.end_time ?? ""}` : ""}
          </div>
        </div>
      ),
    },
    {
      key: "tasks",
      header: tt("Batalon × xodim × soat", "Батальон × сотр. × часы"),
      cell: (c) => (
        <div className="flex flex-col gap-0.5 text-[0.75rem] tabular-nums">
          {c.tasks.map((t) => (
            <span key={t.row} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-medium">{t.batalon_name ?? "?"}</span>
              {t.batalon_new && <Badge tone="primary">{tt("yangi", "новый")}</Badge>}
              <span>
                · {t.worker_number} × {t.task_time}
              </span>
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "template",
      header: tt("Shablon", "Шаблон"),
      width: "9rem",
      hideOnMobile: true,
      cell: (c) => (
        <span className="text-[0.75rem] text-muted-foreground">
          {templateName(templateId === "auto" ? c.template_id : Number(templateId))}
        </span>
      ),
    },
    {
      key: "summa",
      header: tt("Summa", "Сумма"),
      align: "right",
      width: "9rem",
      cell: (c) => <span className="font-medium tabular-nums">{c.summa != null ? formatSum(c.summa) : "—"}</span>,
    },
  ];

  // Fayl tashlash / tanlash maydoni
  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      pickFile(e.dataTransfer.files?.[0]);
    },
  };

  return (
    <div className="flex min-h-full flex-col bg-card" {...dropProps}>
      <NavbarPortal>
        <p className="hidden min-w-0 truncate text-[0.75rem] text-muted-foreground xl:block">
          {tt(
            "Viloyat to'ldirgan shablonni yuklang: tekshiriladi, yo'q tashkilot va batalonlar avtomatik yaratiladi",
            "Загрузите заполненный областью шаблон: проверка, недостающие организации и батальоны создаются автоматически"
          )}
        </p>
      </NavbarPortal>

      <PageBar className="items-end gap-3">
        <div className="flex w-full flex-col gap-1.5 sm:w-[15rem]">
          <Label>{tt("Viloyat", "Область")}</Label>
          <Select
            selectSize="sm"
            placeholder={tt("Viloyatni tanlang", "Выберите область")}
            value={regionId}
            onChange={(e) => {
              setResult(null);
              setRegionId(e.target.value);
            }}
            options={regions.map((r) => ({ value: String(r.id), label: r.name }))}
          />
        </div>
        <div className="flex w-full flex-col gap-1.5 sm:w-[15rem]">
          <Label htmlFor="ci-account">
            {noAccounts ? tt("Hisob raqami (yangi)", "Расчётный счёт (новый)") : tt("Hisob raqami", "Расчётный счёт")}
          </Label>
          {noAccounts ? (
            <Input
              id="ci-account"
              inputSize="sm"
              inputMode="numeric"
              value={newAccount}
              onChange={(e) => setNewAccount(e.target.value.replace(/[^\d\s]/g, ""))}
              placeholder={tt("Viloyat hisob raqami", "Расчётный счёт области")}
              title={tt(
                "Viloyatda hisob raqami yo'q — kiriting, import bilan birga yaratiladi",
                "У области нет счёта — введите, он будет создан вместе с импортом"
              )}
            />
          ) : (
            <Select
              selectSize="sm"
              placeholder={regionId ? tt("Tanlang", "Выберите") : "—"}
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              options={(options?.accounts ?? []).map((a) => ({ value: String(a.id), label: a.account_number }))}
              disabled={!options}
            />
          )}
        </div>
        <div className="flex w-full flex-col gap-1.5 sm:w-[15rem]">
          <Label>{tt("Shartnoma shabloni", "Шаблон договора")}</Label>
          <Select
            selectSize="sm"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            options={[
              { value: "auto", label: tt("Avtomatik (muddat va vaqtga qarab)", "Автоматически (по сроку и времени)") },
              ...(options?.templates ?? []).map((t) => ({ value: String(t.id), label: t.shablon_name })),
            ]}
          />
        </div>

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
        <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} className="max-w-[18rem]">
          <FileSpreadsheet />
          <span className="truncate">{file ? file.name : tt("Excel faylni tanlash", "Выбрать файл Excel")}</span>
        </Button>
        {file && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={check}
            disabled={!regionId || checking}
            title={tt("Qayta tekshirish", "Проверить снова")}
            aria-label={tt("Qayta tekshirish", "Проверить снова")}
          >
            {checking ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          </Button>
        )}
        <Button size="sm" onClick={() => setConfirmOpen(true)} disabled={!canImport || importing} title={importHint}>
          <Upload />
          {tt("Import qilish", "Импортировать")}
        </Button>

        <ToolbarSpacer />
        <Button variant="ghost" size="sm" onClick={downloadTemplate}>
          <Download />
          {tt("Shablonni yuklab olish", "Скачать шаблон")}
        </Button>
      </PageBar>

      {/* Viloyatda admin yo'q — import mumkin emas */}
      {missing.length > 0 && (
        <div className="flex flex-col gap-1 border-b border-warning/30 bg-warning/10 px-3 py-2.5 text-[0.8125rem] text-foreground sm:px-4">
          <span className="flex items-center gap-1.5 font-medium text-warning">
            <AlertTriangle className="size-4" />
            {tt(`${options?.region.name}: import qilib bo'lmaydi`, `${options?.region.name}: импорт невозможен`)}
          </span>
          {missing.map((m) => (
            <span key={m.key} className="pl-5">
              — {m.message}
            </span>
          ))}
        </div>
      )}

      {/* Hisob raqami yo'q — shu yerda kiritiladi */}
      {noAccounts && !missing.length && (
        <div className="flex items-center gap-2 border-b border-primary/20 bg-primary/5 px-3 py-2 text-[0.8125rem] sm:px-4">
          <Info className="size-4 shrink-0 text-primary" />
          {tt(
            `${options?.region.name}da hisob raqami yo'q — yuqorida kiriting, import bilan birga viloyatga qo'shiladi.`,
            `У области ${options?.region.name} нет расчётного счёта — введите выше, он будет добавлен вместе с импортом.`
          )}
        </div>
      )}

      {result && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-success/30 bg-success/10 px-3 py-2.5 text-[0.8125rem] sm:px-4">
          <CheckCircle2 className="size-4 text-success" />
          <span>
            {tt(
              `${result.region}: ${result.count} ta shartnoma import qilindi`,
              `${result.region}: импортировано договоров — ${result.count}`
            )}
            {result.orgs > 0 && tt(`, ${result.orgs} ta tashkilot`, `, организаций — ${result.orgs}`)}
            {result.batalons > 0 && tt(`, ${result.batalons} ta batalon yaratildi`, `, создано батальонов — ${result.batalons}`)}
            {result.account && tt(`, hisob raqami ${result.account} qo'shildi`, `, добавлен счёт ${result.account}`)}.
          </span>
        </div>
      )}

      {!preview ? (
        // Fayl tashlash / tanlash maydoni
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex w-full max-w-[44rem] flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/30 hover:border-primary/60 hover:bg-primary/5"
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
            <span className="max-w-[34rem] text-[0.8125rem] text-muted-foreground">
              {!regionId
                ? tt(
                    "Avval yuqorida viloyatni tanlang — fayl tanlanishi bilan o'zi tekshiriladi.",
                    "Сначала выберите область вверху — файл проверится сразу после выбора."
                  )
                : tt(
                    "Viloyat to'ldirgan shablon (birinchi varaq, ma'lumot 3-qatordan). Fayl o'zi tekshiriladi; yo'q tashkilot va batalonlar import paytida yaratiladi.",
                    "Шаблон, заполненный областью (первый лист, данные с 3-й строки). Файл проверится сам; недостающие организации и батальоны будут созданы при импорте."
                  )}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[0.8125rem] font-medium text-primary">
              <FileSpreadsheet className="size-4" />
              {tt("Faylni tanlash", "Выбрать файл")}
            </span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-[0.8125rem] sm:px-4">
            <FileSpreadsheet className="size-4 text-success" />
            <span className="truncate font-medium">{file?.name}</span>
            {checking && <Loader2 className="size-4 animate-spin text-primary" />}
            <Button variant="ghost" size="xs" onClick={clearFile} className="ml-auto">
              <X />
              {tt("Boshqa fayl", "Другой файл")}
            </Button>
          </div>

          <SummaryRow>
            <SummaryTile label={tt("Shartnomalar", "Договоры")} value={preview.meta.contracts} />
            <SummaryTile label={tt("Jami summa", "Общая сумма")} value={formatSum(preview.meta.total_summa) || "0"} />
            <SummaryTile label={tt("Yangi tashkilotlar", "Новые организации")} value={preview.meta.new_organizations} />
            <SummaryTile label={tt("Yangi batalonlar", "Новые батальоны")} value={preview.meta.new_batalons} />
            <SummaryTile
              label={tt("Xatolar", "Ошибки")}
              value={preview.meta.errors}
              tone={preview.meta.errors ? "danger" : "success"}
            />
            <SummaryTile label={tt("Ogohlantirishlar", "Предупреждения")} value={preview.meta.warnings} />
          </SummaryRow>

          {issues.length > 0 && (
            <div className="border-t border-border">
              <div className="px-3 pb-1 pt-3 text-[0.8125rem] font-semibold sm:px-4">
                {preview.meta.errors
                  ? tt(
                      "Xatolar — tuzatmaguncha import qilinmaydi; ogohlantirishlarni tekshirib chiqing",
                      "Ошибки — без исправления импорт невозможен; проверьте предупреждения"
                    )
                  : tt(
                      "Ogohlantirishlar — import to'xtamaydi, lekin tekshirib chiqing",
                      "Предупреждения — импорт возможен, но проверьте"
                    )}
              </div>
              <DataTable columns={issueColumns} rows={issues} keyOf={(_i, n) => n} stickyHeader={false} />
            </div>
          )}

          <div className="border-t border-border">
            <div className="px-3 pb-1 pt-3 text-[0.8125rem] font-semibold sm:px-4">
              {tt("Import qilinadigan shartnomalar", "Договоры к импорту")}
            </div>
            <DataTable
              columns={contractColumns}
              rows={preview.contracts}
              keyOf={(c) => c.doc_num}
              stickyHeader={false}
              empty={tt("Shartnoma topilmadi", "Договоров нет")}
            />
          </div>
        </>
      )}

      <Modal
        open={confirmOpen}
        onClose={importing ? () => {} : () => setConfirmOpen(false)}
        size="md"
        title={tt("Import qilishni tasdiqlang", "Подтвердите импорт")}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={importing}>
              {tt("Bekor qilish", "Отмена")}
            </Button>
            <Button onClick={runImport} disabled={importing}>
              {importing ? <Loader2 className="animate-spin" /> : <Upload />}
              {tt("Import qilish", "Импортировать")}
            </Button>
          </div>
        }
      >
        {preview && (
          <div className="flex flex-col gap-2 text-[0.8125rem] text-foreground">
            <p>
              {tt(
                `${options?.region.name}ga ${preview.meta.contracts} ta shartnoma (${formatSum(preview.meta.total_summa)} so'm) yoziladi. Shartnomalar viloyat admini (${options?.admin?.login}) nomidan qo'shiladi.`,
                `В область ${options?.region.name} будет записано договоров: ${preview.meta.contracts} (${formatSum(preview.meta.total_summa)} сум). Договоры добавляются от имени админа области (${options?.admin?.login}).`
              )}
            </p>
            {(preview.meta.new_organizations > 0 || preview.meta.new_batalons > 0 || (!accountId && newAccountClean)) && (
              <div className="border border-border bg-muted/40 px-3 py-2">
                <div className="mb-1 font-medium">{tt("Avtomatik yaratiladi:", "Будет создано автоматически:")}</div>
                <ul className="flex list-disc flex-col gap-0.5 pl-4">
                  {preview.meta.new_organizations > 0 && (
                    <li>{tt(`${preview.meta.new_organizations} ta tashkilot`, `организаций: ${preview.meta.new_organizations}`)}</li>
                  )}
                  {preview.meta.new_batalons > 0 && (
                    <li>
                      {tt(`${preview.meta.new_batalons} ta batalon`, `батальонов: ${preview.meta.new_batalons}`)}:{" "}
                      <span className="font-medium">{preview.meta.new_batalon_names.join(", ")}</span>
                    </li>
                  )}
                  {!accountId && newAccountClean && (
                    <li>
                      {tt("hisob raqami", "расчётный счёт")}: <span className="font-medium tabular-nums">{newAccountClean}</span>
                    </li>
                  )}
                </ul>
                <p className="mt-1.5 text-[0.75rem] text-muted-foreground">
                  {tt(
                    "Ularning rekvizitlarini (manzil, bank, STIR) viloyat keyin o'z ma'lumotnomasida to'ldiradi.",
                    "Их реквизиты (адрес, банк, ИНН) область потом заполнит в своём справочнике."
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
