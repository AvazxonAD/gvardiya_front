import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { Ban, ChevronLeft, ChevronRight, RotateCcw, Search, X } from "lucide-react";

import useApi from "@/services/api";
import { formatDate, formatSum, tt } from "@/utils";
import { permBtn, usePermission } from "@/lib/permissions";
import { OrganizationHover } from "@/pageCompoents/ContTab";
import {
  ContractStatusConfirm,
  type ContractStatusTarget,
  useContractStatusAction,
} from "@/lib/contractStatus";
import { Button, DataTable, EmptyState, Input, Modal, type TableColumn } from "@/ui";

const LIMIT = 15;

type Row = {
  id: number;
  doc_num: string;
  doc_date: string;
  organization_name: string;
  organization_address?: string;
  organization_str?: string;
  organization_account_number?: string;
  adress?: string;
  result_summa: number;
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
 * Bekor qilingan shartnomalar. Sana filtri yo'q — hammasi (butun davr),
 * qidiruv bilan. Summalari hech qayerga qo'shilmaydi, shuning uchun
 * jamlanma ham ko'rsatilmaydi. Har qatorni qayta faollashtirish mumkin.
 */
export default function CancelledContractsModal({
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
  const perm = usePermission("contract");
  const setStatus = useContractStatusAction();

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
        from: "2000-01-01",
        to: "2099-12-31",
        account_number_id: String(accountNumberId),
        contract_status: "cancelled",
      });
      if (searchText) qs.set("search", searchText);
      const res = await api.get<Row[]>(`contract?${qs.toString()}`);
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

  const columns: TableColumn<Row>[] = [
    {
      key: "n",
      header: "№",
      width: "3rem",
      align: "center",
      cell: (_r, i) => (
        <span className="tabular-nums text-muted-foreground">{(page - 1) * LIMIT + i + 1}</span>
      ),
    },
    {
      key: "doc",
      header: tt("Shartnoma №", "№ договора"),
      width: "7rem",
      cell: (r) => (
        <button
          type="button"
          onClick={() => navigate(`/contract/view/${r.id}`)}
          className="font-medium text-primary hover:underline"
          title={tt("Shartnomani ko'rish", "Открыть договор")}
        >
          {r.doc_num}
        </button>
      ),
    },
    {
      key: "date",
      header: tt("Sana", "Дата"),
      width: "6.5rem",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{formatDate(r.doc_date)}</span>,
    },
    {
      key: "org",
      header: tt("Buyurtmachi", "Заказчик"),
      // Hover'da tashkilot tafsiloti — "Shartnomalar" jadvalidagi kabi
      cell: (r) => (
        <div className="min-w-0 max-w-[min(32rem,40vw)]">
          <div className="truncate font-medium text-foreground">
            <OrganizationHover item={r} />
          </div>
          {/* Bo'sh manzil ba'zan '""' ko'rinishida saqlangan */}
          {r.adress?.replace(/["'s]/g, "") && (
            <div className="truncate text-[0.6875rem] text-muted-foreground" title={r.adress}>
              {r.adress}
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
        <span
          className="tabular-nums text-muted-foreground line-through"
          title={tt("Jamlanmalarga qo'shilmaydi", "Не входит в итоги")}
        >
          {formatSum(r.result_summa) || "0"}
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
          {...permBtn(perm.update, tt("Shartnomani qayta faollashtirish", "Восстановить договор"))}
          onClick={() => setRestoreItem(r)}
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
            {tt("Bekor qilingan shartnomalar", "Отменённые договоры")}
          </span>
        }
        description={tt(
          `Jami: ${meta?.count ?? 0} ta. Bu shartnomalar qarzdorlik, dashboard, hisobot va chiqimda hisobga olinmaydi.`,
          `Всего: ${meta?.count ?? 0}. Эти договоры не учитываются в задолженности, дашборде, отчётах и расходах.`
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
                placeholder={tt("№, tashkilot yoki INN", "№, организация или ИНН")}
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
                    : tt("Bekor qilingan shartnoma yo'q", "Отменённых договоров нет")
                }
              />
            }
          />
        </div>
      </Modal>

      <ContractStatusConfirm
        action="restore"
        contract={restoreItem}
        onClose={() => setRestoreItem(null)}
        onConfirm={restore}
      />
    </>
  );
}
