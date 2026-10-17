import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { Ban, ChevronLeft, ChevronRight, RotateCcw, Search, X } from "lucide-react";

import useApi from "@/services/api";
import { formatDate, formatSum, tt } from "@/utils";
import { permBtn, usePermission, NO_ACCESS_BTN_CLASS } from "@/lib/permissions";
import { ContractStatusConfirm, type ContractStatusTarget, useContractStatusAction } from "@/lib/contractStatus";
import { cn } from "@/lib/utils";
import { Button, DataTable, EmptyState, Input, Modal, type TableColumn } from "@/ui";

const LIMIT = 15;

type Row = {
  id: number;
  prixod_doc_num: string;
  prixod_date: string;
  prixod_summa: number;
  opisanie?: string | null;
  contract_id: number;
  contract_doc_num: string;
  /** Shartnoma bekor qilingan / o'chirilgan bo'lsa kirim faollashtirilmaydi */
  contract_status: "active" | "cancelled" | "deleted";
  organization_name: string;
  organization_str?: string;
  cancelled_at?: string | null;
  cancelled_by_fio?: string | null;
};

type Meta = {
  count: number;
  pageCount: number;
  currentPage: number;
  nextPage: number | null;
  backPage: number | null;
};

/**
 * Bekor qilingan kirimlar (backend: GET /prixod/cancelled). Sana filtri
 * yo'q — butun davr, qidiruv bilan. Summalari hech qayerga qo'shilmaydi.
 * Har qatorni qayta faollashtirish mumkin — shartnomasi faol bo'lsa.
 */
export default function CancelledPrixodModal({
  open,
  onClose,
  accountNumberId,
  onRestored,
}: {
  open: boolean;
  onClose: () => void;
  accountNumberId: number | string | null | undefined;
  /** Faollashtirilgandan keyin asosiy ro'yxatni yangilash */
  onRestored: () => void;
}) {
  const api = useApi();
  const navigate = useNavigate();
  const perm = usePermission("prixod");
  const setStatus = useContractStatusAction("prixod");

  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchText] = useDebounce(search.trim(), 400);
  const [restoreItem, setRestoreItem] = useState<ContractStatusTarget | null>(null);

  useEffect(() => {
    if (open) setPage(1);
  }, [open, searchText]);

  const fetchRows = useCallback(async () => {
    if (!accountNumberId) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        account_number_id: String(accountNumberId),
      });
      if (searchText) qs.set("search", searchText);
      const res = await api.get<Row[]>(`prixod/cancelled?${qs.toString()}`);
      if (res?.success) {
        setRows(res.data || []);
        setMeta((res as any).meta || null);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountNumberId, page, searchText]);

  useEffect(() => {
    if (open) fetchRows();
  }, [open, fetchRows]);

  const restore = async (c: ContractStatusTarget) => {
    const ok = await setStatus("restore", c.id, accountNumberId);
    if (ok) {
      // Sahifadagi oxirgi qator faollashtirilsa — oldingi sahifaga
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchRows();
      onRestored();
    }
    return ok;
  };

  const restoreBtn = (r: Row) => {
    if (r.contract_status === "active") {
      return permBtn(perm.update, tt("Kirimni qayta faollashtirish", "Восстановить приход"));
    }
    const reason =
      r.contract_status === "cancelled"
        ? tt("Shartnoma bekor qilingan — avval shartnomani faollashtiring", "Договор отменён — сначала восстановите договор")
        : tt("Shartnoma o'chirilgan", "Договор удалён");
    return { disabled: true, "aria-disabled": true, title: reason, className: cn(NO_ACCESS_BTN_CLASS) };
  };

  const columns: TableColumn<Row>[] = [
    {
      key: "n",
      header: "№",
      width: "3rem",
      align: "center",
      cell: (_r, i) => <span className="tabular-nums text-muted-foreground">{(page - 1) * LIMIT + i + 1}</span>,
    },
    {
      key: "doc",
      header: tt("Hujjat №", "№ документа"),
      width: "7rem",
      cell: (r) => <span className="font-medium tabular-nums text-foreground">{r.prixod_doc_num}</span>,
    },
    {
      key: "date",
      header: tt("O‘tkazma sanasi", "Дата проводки"),
      width: "7.5rem",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{formatDate(r.prixod_date)}</span>,
    },
    {
      key: "contract",
      header: tt("Shartnoma №", "№ договора"),
      width: "7.5rem",
      cell: (r) =>
        r.contract_status === "deleted" ? (
          <span className="text-muted-foreground">{r.contract_doc_num}</span>
        ) : (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => navigate(`/contract/view/${r.contract_id}`)}
              className="text-left font-medium text-primary hover:underline"
              title={tt("Shartnomani ko'rish", "Открыть договор")}
            >
              {r.contract_doc_num}
            </button>
            {r.contract_status === "cancelled" && (
              <span className="text-[0.6875rem] text-destructive">{tt("bekor qilingan", "отменён")}</span>
            )}
          </div>
        ),
    },
    {
      key: "org",
      header: tt("To'lovchi haqida", "О плательщике"),
      cell: (r) => (
        <div className="min-w-0 max-w-[min(28rem,36vw)]">
          <div className="truncate font-medium text-foreground" title={r.organization_name}>
            {r.organization_name}
          </div>
          {r.opisanie && (
            <div className="truncate text-[0.6875rem] text-muted-foreground" title={r.opisanie}>
              {r.opisanie}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "summa",
      header: tt("Summasi", "Сумма"),
      align: "right",
      width: "9rem",
      // Chizilgan: summa hech qayerga qo'shilmaydi
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground line-through" title={tt("Jamlanmalarga qo'shilmaydi", "Не входит в итоги")}>
          {formatSum(r.prixod_summa) || "0"}
        </span>
      ),
    },
    {
      key: "cancelled",
      header: tt("Bekor qilingan", "Отменён"),
      width: "12rem",
      hideOnMobile: true,
      cell: (r) => (
        <div className="flex flex-col">
          <span className="tabular-nums text-foreground">{r.cancelled_at || "—"}</span>
          {r.cancelled_by_fio && (
            <span className="truncate text-[0.6875rem] text-muted-foreground" title={r.cancelled_by_fio}>
              {r.cancelled_by_fio}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "10rem",
      align: "right",
      cell: (r) => (
        <Button
          variant="outline"
          size="xs"
          {...restoreBtn(r)}
          onClick={() =>
            setRestoreItem({
              id: r.id,
              doc_num: r.prixod_doc_num,
              organization_name: r.organization_name,
              result_summa: r.prixod_summa,
              note: `${tt("Shartnoma", "Договор")} № ${r.contract_doc_num}`,
            })
          }
        >
          <RotateCcw />
          {tt("Faollashtirish", "Восстановить")}
        </Button>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        size="full"
        title={
          <span className="inline-flex items-center gap-2">
            <Ban className="size-4 text-destructive" />
            {tt("Bekor qilingan kirimlar", "Отменённые приходы")}
          </span>
        }
        description={tt(
          `Jami: ${meta?.count ?? 0} ta. Bu kirimlar shartnomaga kelib tushgan pul, qarzdorlik, dashboard va hisobotlarda hisobga olinmaydi.`,
          `Всего: ${meta?.count ?? 0}. Эти приходы не учитываются в поступлениях по договору, задолженности, дашборде и отчётах.`
        )}
        className="max-h-[88vh]"
        footer={
          meta && meta.pageCount > 1 ? (
            <div className="flex items-center gap-2">
              <span className="text-[0.75rem] tabular-nums text-muted-foreground">
                {meta.currentPage} / {meta.pageCount}
              </span>
              <Button
                variant="secondary"
                size="icon-sm"
                disabled={!meta.backPage}
                onClick={() => setPage((p) => p - 1)}
                aria-label={tt("Oldingi", "Предыдущая")}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="secondary"
                size="icon-sm"
                disabled={!meta.nextPage}
                onClick={() => setPage((p) => p + 1)}
                aria-label={tt("Keyingi", "Следующая")}
              >
                <ChevronRight />
              </Button>
            </div>
          ) : undefined
        }
      >
        <div className="-mx-5 -my-4">
          <div className="border-b border-border px-5 py-3">
            <div className="relative w-[20rem] max-sm:w-full">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                inputSize="sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tt("№, tashkilot yoki tavsif", "№, организация или описание")}
                className="pl-8 pr-7"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={tt("Tozalash", "Очистить")}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
          <DataTable
            columns={columns}
            rows={rows}
            keyOf={(r) => r.id}
            loading={loading}
            loadingRows={6}
            empty={
              <EmptyState
                icon={Ban}
                title={
                  searchText
                    ? tt(`"${searchText}" bo'yicha topilmadi`, `По запросу "${searchText}" ничего нет`)
                    : tt("Bekor qilingan kirim yo'q", "Отменённых приходов нет")
                }
              />
            }
          />
        </div>
      </Modal>

      <ContractStatusConfirm
        kind="prixod"
        action="restore"
        contract={restoreItem}
        onClose={() => setRestoreItem(null)}
        onConfirm={restore}
      />
    </>
  );
}
