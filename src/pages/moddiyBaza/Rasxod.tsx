import DeleteModal from "@/Components/DeleteModal";
import ExportButtons from "@/Components/ExportButtons";
import FilterActions from "@/Components/FilterActions";
import SearchInput from "@/Components/Input";
import Paginatsiya from "@/Components/Paginatsiya";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import Table from "@/Components/reusable/table/Table";
import { usePagedFetch } from "@/hooks/usePagedFetch";
import { useRequest } from "@/hooks/useRequest";
import { sortParamsObject, useTableSort } from "@/hooks/useTableSort";
import { permBtn, usePermission } from "@/lib/permissions";
import { EXPORT_ALL_LIMIT, type ExportColumn } from "@/lib/tableExport";
import { cn } from "@/lib/utils";
import { alertt } from "@/Redux/LanguageSlice";
import { RootState } from "@/Redux/store";
import { formatDate, formatSum, toNumber, tt } from "@/utils";
import {
  Button,
  Field,
  Input,
  ListCard,
  Modal,
  SummaryRow,
  SummaryTile,
  Textarea,
  Toolbar,
  ToolbarSpacer,
} from "@/ui";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "use-debounce";
import { MARKAZIY_BAZA, MODDIY_BAZA, type BazaConfig, type BazaLabels } from "./baza";

/** Baza mablag'idan chiqim (backend: moddiy.baza/rasxod, markaziy.baza/rasxod) */
type ModdiyRasxod = {
  id: number;
  doc_num: string;
  doc_date: string;
  summa: number;
  comment: string | null;
};

type ListMeta = {
  pageCount: number;
  count: number;
  /** Davrdagi barcha chiqimlar yig'indisi (qidiruvga bog'liq emas) */
  summa: string | number;
};

/**
 * Backend: GET `${api}/monitoring/balance` — hujjat sanasidagi qoldiq (shu
 * kun ham). Monitoring'da davr oxiri shu sana bo'lgandagi "Yakuniy qoldiq"
 * bilan bir xil
 */
type Balance = {
  date: string;
  /** Shu sanagacha bazaga ajratilgan (to'langan hujjatlardan) */
  kirim: number;
  /** Shu sanagacha baza chiqimlari (tahrirlanayotgan hujjatsiz) */
  chiqim: number;
  qoldiq: number;
  /** Shu sanagacha to'lanmagan hujjatlar — kirimga hali qo'shilmagan */
  pending: { count: number; summa: number };
};

/** Bo'sh shakl — "Qo'shish" bosilganda shu holatga qaytadi */
const EMPTY_FORM = { doc_num: "", doc_date: "", summa: "", comment: "" };

// Summa yozilayotganda: raqamlar va bitta kasr ajratgich (nuqta yoki
// vergul), tiyin — 2 xonagacha. Butun qism backenddagi chegaradan oshmaydi
const SUMMA_RE = /^\d{0,15}([.,]\d{0,2})?$/;

// Funksiya: `tt` til tanlovini chaqirilgan paytda o'qiydi
const exportColumns = (): ExportColumn<ModdiyRasxod>[] => [
  { header: "№", value: (r) => r.doc_num, width: 10, align: "center" },
  { header: tt("Sana", "Дата"), value: (r) => formatDate(r.doc_date), align: "center" },
  {
    header: tt("Summa", "Сумма"),
    value: (r) => formatSum(r.summa),
    excelValue: (r) => toNumber(r.summa) || 0,
    align: "right",
  },
  { header: tt("Izoh", "Комментарий"), value: (r) => r.comment || "" },
];

const errorText = (error: any) =>
  error?.response?.data?.message || error?.message || tt("Xatolik yuz berdi", "Произошла ошибка");

const round2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Chiqim oynasidagi qoldiq: hujjat sanasigacha ajratilgan, sarflangan va
 * qolgan pul. Yuklanayotganda eski raqamlar xira turadi (0 ko'rinib qolmasin)
 */
function BalancePanel({
  date,
  balance,
  loading,
  error,
  labels,
}: {
  date: string;
  balance: Balance | null;
  loading: boolean;
  error: boolean;
  labels: BazaLabels;
}) {
  if (!date) return null;

  const value = (v?: number) => (balance ? formatSum(v ?? 0) : "…");
  const negative = (balance?.qoldiq ?? 0) < 0;

  return (
    <div
      aria-busy={loading}
      className={cn("rounded-md border border-border bg-muted/40 px-3 py-2.5 transition-opacity", loading && "opacity-60")}
    >
      <p className="mb-1.5 text-[0.75rem] font-semibold text-foreground">
        {labels.fundsAt(formatDate(date))}
      </p>

      {error ? (
        <p className="text-[0.8125rem] text-destructive">
          {tt("Qoldiqni olib bo'lmadi", "Не удалось получить остаток")}
        </p>
      ) : (
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[0.8125rem]">
          <dt className="text-muted-foreground">{tt("Ajratilgan (kirim)", "Выделено (приход)")}</dt>
          <dd className="text-right tabular-nums text-success">{value(balance?.kirim)}</dd>

          <dt className="text-muted-foreground">{tt("Sarflangan (chiqim)", "Израсходовано (расход)")}</dt>
          <dd className="text-right tabular-nums">{value(balance?.chiqim)}</dd>

          <dt className="border-t border-border pt-1 font-semibold text-foreground">{tt("Qoldiq", "Остаток")}</dt>
          <dd
            className={cn(
              "border-t border-border pt-1 text-right font-semibold tabular-nums",
              negative ? "text-destructive" : "text-primary"
            )}
          >
            {value(balance?.qoldiq)}
          </dd>
        </dl>
      )}

      {!!balance?.pending?.count && (
        <p className="mt-1.5 text-[0.6875rem] leading-snug text-muted-foreground">
          {tt(
            `To'lanmagan ${balance.pending.count} ta hujjat (${labels.shareLower} ${formatSum(balance.pending.summa)}) kirimga qo'shilmagan — «To'landi» deb belgilangach hisobga olinadi.`,
            `Неоплаченные документы (${balance.pending.count} шт., ${labels.shareLower} ${formatSum(balance.pending.summa)}) не учтены в приходе — будут учтены после отметки об оплате.`
          )}
        </p>
      )}
    </div>
  );
}

/**
 * Chiqimlar (bazaga ajratilgan pul hisobidan). "Moddiy baza" va "Markaziy
 * baza" uchun bir xil — farqi `config` da (baza.ts)
 */
export function BazaRasxod({ config }: { config: BazaConfig }) {
  const request = useRequest();
  const dispatch = useDispatch();
  const perm = usePermission(config.permKey);
  const { account_number_id } = useSelector((state: any) => state.account);
  const defDate = useSelector((state: RootState) => state.defaultDate);
  const L = config.labels();

  const API = `${config.api}/rasxod`;
  const BALANCE_API = `${config.api}/monitoring/balance`;
  // Moddiy baza — tanlangan hisob raqam bo'yicha; markaziy — hisob raqamsiz
  const accountParams = config.withAccount ? { account_number_id } : {};
  const accountReady = !config.withAccount || Boolean(account_number_id);

  const [from, setFrom] = useState(defDate.startDate);
  const [to, setTo] = useState(defDate.endDate);

  useEffect(() => {
    setFrom(defDate.startDate);
    setTo(defDate.endDate);
  }, [defDate.startDate, defDate.endDate]);

  const [rows, setRows] = useState<ModdiyRasxod[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Maydondagi matn va so'rovga ketadigan matn ajratilgan — har harfda so'rov ketmasin
  const [q, setQ] = useState("");
  const [search] = useDebounce(q.trim(), 400);
  const { sort, toggle: toggleSort, reset: resetSort } = useTableSort();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ModdiyRasxod | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<ModdiyRasxod | null>(null);

  // Oynadagi hujjat sanasidagi baza qoldig'i
  const [balance, setBalance] = useState<Balance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(false);

  const notify = (text: string, success = true) => dispatch(alertt({ text, success }));

  // Qoldiq oyna ochilganda va hujjat sanasi o'zgarganda olinadi. Tahrirlashda
  // shu hujjat chiqimga qo'shilmaydi (`exclude_id`) — pastda "bu chiqimdan
  // keyingi qoldiq"da u yana ayiriladi, ikki marta hisoblanmasin
  const editingId = editing?.id;
  useEffect(() => {
    if (!formOpen || !form.doc_date || !accountReady) return;

    // Kechikkan javob (oldingi sana) yangisining ustidan yozib yubormasin
    let stale = false;
    setBalanceLoading(true);
    setBalanceError(false);
    request
      .get(BALANCE_API, {
        params: {
          date: form.doc_date,
          ...accountParams,
          ...(editingId ? { exclude_id: editingId } : {}),
        },
      })
      .then((res) => {
        if (stale) return;
        if (res.data?.success) setBalance(res.data.data);
        else setBalanceError(true);
      })
      .catch(() => {
        if (stale) return;
        setBalance(null);
        setBalanceError(true);
      })
      .finally(() => {
        if (!stale) setBalanceLoading(false);
      });

    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen, form.doc_date, editingId, account_number_id]);

  // Joriy filtrlar — ro'yxat ham, eksport ham aynan shu shartlar bilan oladi
  const listParams = (p: number, l: number) => ({
    from,
    to,
    ...accountParams,
    page: p,
    limit: l,
    ...(search ? { search } : {}),
    ...sortParamsObject(sort),
  });

  const fetchList = () => request.get(API, { params: listParams(page, limit) });

  const apply = (res: any) => {
    if (res?.data?.success) {
      setRows(res.data.data ?? []);
      setMeta(res.data.meta);
    }
  };

  /** Yangilash, saqlash va o'chirishdan keyin ro'yxatni qayta oladi */
  const reload = async () => {
    if (!from || !to || !accountReady) return;
    try {
      apply(await fetchList());
    } catch (error) {
      notify(errorText(error), false);
    }
  };

  // Filtr (sana, qidiruv, saralash, hisob raqam) o'zgarsa — 1-sahifadan
  usePagedFetch({
    page,
    setPage,
    filters: [limit, from, to, search, sort, account_number_id],
    fetch: () => {
      if (!from || !to || !accountReady) return;

      // Kechikkan javob yangisining ustidan yozib yubormasin
      let stale = false;
      fetchList()
        .then((res) => {
          if (!stale) apply(res);
        })
        .catch((error) => {
          if (!stale) notify(errorText(error), false);
        });

      return () => {
        stale = true;
      };
    },
  });

  const clearFilters = () => {
    setQ("");
    resetSort();
    setFrom(defDate.startDate);
    setTo(defDate.endDate);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, doc_date: format(new Date(), "yyyy-MM-dd") });
    setErrors({});
    // Oldingi ochilishdagi (boshqa sana) qoldiq ko'rinib qolmasin
    setBalance(null);
    setFormOpen(true);
  };

  const openEdit = (row: ModdiyRasxod) => {
    setEditing(row);
    setBalance(null);
    setForm({
      doc_num: row.doc_num,
      doc_date: row.doc_date,
      summa: String(row.summa ?? ""),
      comment: row.comment ?? "",
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.doc_num.trim()) {
      next.doc_num = tt("Hujjat raqamini kiriting", "Введите номер документа");
    }
    if (!form.doc_date) {
      next.doc_date = tt("Sanani tanlang", "Выберите дату");
    }
    const summa = toNumber(form.summa);
    if (!Number.isFinite(summa) || summa <= 0) {
      next.summa = tt("Summa noldan katta bo'lishi kerak", "Сумма должна быть больше нуля");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (saving || !validate()) return;

    const body = {
      doc_num: form.doc_num.trim(),
      doc_date: form.doc_date,
      summa: toNumber(form.summa),
      comment: form.comment.trim() || null,
    };
    const reqConfig = { params: accountParams };

    setSaving(true);
    try {
      const res = editing
        ? await request.put(`${API}/${editing.id}`, body, reqConfig)
        : await request.post(API, body, reqConfig);

      if (res.data?.success) {
        notify(
          editing
            ? tt("Muvaffaqiyatli yangilandi", "Успешно обновлено")
            : tt("Muvaffaqiyatli qo'shildi", "Успешно добавлено")
        );
        setFormOpen(false);
        await reload();
      } else {
        notify(res.data?.message || tt("Xatolik", "Ошибка"), false);
      }
    } catch (error) {
      notify(errorText(error), false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const target = deleting;
    try {
      const res = await request.delete(`${API}/${target.id}`, { params: accountParams });
      if (res.data?.success) {
        notify(tt("Muvaffaqiyatli o'chirildi", "Успешно удалено"));
        // Sahifadagi oxirgi yozuv o'chsa — bo'sh sahifada qolib ketmaslik uchun oldingisiga
        if (rows.length === 1 && page > 1) setPage(page - 1);
        else await reload();
      } else {
        notify(res.data?.message || tt("Xatolik", "Ошибка"), false);
      }
    } catch (error) {
      notify(errorText(error), false);
    } finally {
      setDeleting(null);
    }
  };

  const summaPreview = toNumber(form.summa);
  const summaValid = Number.isFinite(summaPreview) && summaPreview > 0;
  // Saqlashni to'xtatmaydi (qoldiq manfiy bo'lishi mumkin) — faqat ogohlantiradi
  const afterExpense = balance && summaValid ? round2(balance.qoldiq - summaPreview) : null;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ListCard
        flush
        toolbar={
          <Toolbar>
            <div className="flex items-center gap-1.5">
              <SpecialDatePicker defaultValue={from} onChange={setFrom} />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker defaultValue={to} onChange={setTo} />
            </div>

            <div className="w-full sm:w-64">
              <SearchInput
                v={q}
                change={(e: any) => setQ(e.target.value)}
                removeValue={() => setQ("")}
                search
                p={tt("№ yoki izoh", "№ или комментарий")}
                className="h-9 w-full"
              />
            </div>

            <FilterActions onRefresh={reload} onClear={clearFilters} />

            <ToolbarSpacer />

            <ExportButtons
              title={L.expenses}
              columns={exportColumns()}
              fetchRows={async () => {
                const res = await request.get(API, { params: listParams(1, EXPORT_ALL_LIMIT) });
                return res?.data?.data ?? [];
              }}
            />
            <Button {...permBtn(perm.create)} size="sm" onClick={openCreate}>
              <Plus />
              {tt("Qo'shish", "Добавить")}
            </Button>
          </Toolbar>
        }
        footer={
          meta ? (
            <>
              <SummaryRow className="sm:grid-cols-1 lg:grid-cols-1">
                <SummaryTile
                  label={tt("Davr bo'yicha chiqim", "Расход за период")}
                  value={formatSum(meta.summa ?? 0)}
                  tone="primary"
                />
              </SummaryRow>

              <Paginatsiya
                currentPage={page}
                setCurrentPage={setPage}
                totalPages={meta.pageCount}
                limet={limit}
                setLimet={setLimit}
                count={meta.count}
              />
            </>
          ) : null
        }
      >
        <Table
          sort={sort}
          onSort={toggleSort}
          thead={[
            { text: "№", sortKey: "doc_num", className: "w-[8rem]" },
            { text: tt("Sana", "Дата"), sortKey: "doc_date", className: "w-[9rem]" },
            { text: tt("Summa", "Сумма"), sortKey: "summa", className: "w-[12.5rem] text-right" },
            { text: tt("Izoh", "Комментарий"), sortKey: "comment" },
            { text: tt("Amallar", "Действия"), className: "w-[6rem] text-center" },
          ]}
        >
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="border-b border-border py-8 text-center text-muted-foreground">
                {tt("Ma'lumot topilmadi", "Данные не найдены")}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td className="border-b border-border text-center tabular-nums">{row.doc_num}</td>
                <td className="border-b border-border text-center tabular-nums">{formatDate(row.doc_date)}</td>
                <td className="border-b border-border text-right font-semibold tabular-nums">
                  {formatSum(row.summa)}
                </td>
                <td className="border-b border-border whitespace-pre-line break-words">{row.comment}</td>
                <td className="border-b border-border">
                  <div className="flex items-center justify-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      {...permBtn(perm.update, tt("Tahrirlash", "Редактировать"))}
                      aria-label={tt("Tahrirlash", "Редактировать")}
                      onClick={() => openEdit(row)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      {...permBtn(perm.delete, tt("O'chirish", "Удалить"), "hover:bg-destructive/10 hover:text-destructive")}
                      aria-label={tt("O'chirish", "Удалить")}
                      onClick={() => setDeleting(row)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </Table>
      </ListCard>

      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        dismissOnOverlay={false}
        title={
          editing
            ? tt("Chiqimni tahrirlash", "Редактировать расход")
            : tt("Yangi chiqim", "Новый расход")
        }
        description={L.fromFunds}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="secondary" disabled={saving} onClick={() => setFormOpen(false)}>
              {tt("Bekor qilish", "Отмена")}
            </Button>
            <Button onClick={submit} loading={saving}>
              {tt("Saqlash", "Сохранить")}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tt("Hujjat raqami", "Номер документа")} error={errors.doc_num} required>
              <Input
                value={form.doc_num}
                maxLength={100}
                onChange={(e) => setForm((f) => ({ ...f, doc_num: e.target.value }))}
              />
            </Field>

            <Field label={tt("Hujjat sanasi", "Дата документа")} error={errors.doc_date} required>
              <SpecialDatePicker
                value={form.doc_date}
                error={errors.doc_date}
                className="w-full"
                onChange={(val) => setForm((f) => ({ ...f, doc_date: val }))}
              />
            </Field>
          </div>

          <BalancePanel
            date={form.doc_date}
            balance={balance}
            loading={balanceLoading}
            error={balanceError}
            labels={L}
          />

          <Field
            label={tt("Summa", "Сумма")}
            error={errors.summa}
            required
            hint={
              summaValid ? (
                <>
                  {formatSum(summaPreview)} {tt("so'm", "сум")}
                  {afterExpense !== null && (
                    <span className={cn("block", afterExpense < 0 && "font-medium text-destructive")}>
                      {tt("Bu chiqimdan keyin qoldiq", "Остаток после этого расхода")}: {formatSum(afterExpense)}
                      {afterExpense < 0 && ` — ${tt("qoldiq yetarli emas", "остатка недостаточно")}`}
                    </span>
                  )}
                </>
              ) : undefined
            }
          >
            <Input
              value={form.summa}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              className="text-right tabular-nums"
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, "");
                if (SUMMA_RE.test(value)) setForm((f) => ({ ...f, summa: value }));
              }}
            />
          </Field>

          <Field label={tt("Izoh", "Комментарий")}>
            <Textarea
              value={form.comment}
              maxLength={2000}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            />
          </Field>
        </div>
      </Modal>

      <DeleteModal open={!!deleting} closeModal={() => setDeleting(null)} deletee={remove} />
    </div>
  );
}

/** Viloyat: moddiy baza chiqimlari (F.I.Sh. chiqimlaridagi 75% hisobidan) */
export default function ModdiyBazaRasxod() {
  return <BazaRasxod config={MODDIY_BAZA} />;
}

/** Super-admin: markaziy baza chiqimlari (F.I.Sh. chiqimlaridagi 10% hisobidan) */
export function MarkaziyBazaRasxod() {
  return <BazaRasxod config={MARKAZIY_BAZA} />;
}
