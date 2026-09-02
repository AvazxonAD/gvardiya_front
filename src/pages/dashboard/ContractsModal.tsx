import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";

import { formatSum, tt } from "@/utils";
import useApi, { baseUri } from "@/services/api";
import { authFetch } from "@/services/tokenManager";
import { RootState } from "@/Redux/store";
import type {
  ContractItem,
  ContractsMeta,
  ContractType,
} from "@/pages/region/dashboard/types";
import {
  Button,
  DataTable,
  EmptyState,
  Modal,
  type TableColumn,
} from "@/ui";

const LIMIT = 15;

const TITLES: Record<ContractType, [string, string]> = {
  all: ["Jami shartnomalar", "Все договоры"],
  paid: ["To'lab berilgan shartnomalar", "Оплаченные договоры"],
  debt: ["Qarzdorligi bor shartnomalar", "Договоры с задолженностью"],
};

export default function ContractsModal({
  open,
  onClose,
  type,
}: {
  open: boolean;
  onClose: () => void;
  type: ContractType;
}) {
  const api = useApi();
  const { startDate, endDate } = useSelector((s: RootState) => s.defaultDate);

  const [rows, setRows] = useState<ContractItem[]>([]);
  const [meta, setMeta] = useState<ContractsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Turi o'zgarsa yoki oyna qayta ochilsa — birinchi sahifadan
  useEffect(() => {
    if (open) setPage(1);
  }, [open, type]);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ContractItem[]>(
        `region/dashboard/contracts?from=${startDate}&to=${endDate}&type=${type}&page=${page}&limit=${LIMIT}`
      );
      if (res?.success) {
        setRows(res.data || []);
        setMeta((res as any).meta || null);
      }
    } catch (e) {
      console.error("Contracts fetch error:", e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, type, page]);

  useEffect(() => {
    if (open) fetchContracts();
  }, [open, fetchContracts]);

  const downloadExcel = () => {
    const url = `${baseUri}/region/dashboard/contracts?from=${startDate}&to=${endDate}&type=${type}&page=1&limit=99999&excel=true`;
    authFetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `shartnomalar_${type}.xlsx`;
        link.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => console.error("Excel yuklashda xatolik:", err));
  };

  const columns: TableColumn<ContractItem>[] = [
    {
      key: "n",
      header: "№",
      width: "52px",
      align: "center",
      cell: (_r, i) => (
        <span className="text-muted-foreground tabular-nums">
          {(page - 1) * LIMIT + i + 1}
        </span>
      ),
    },
    {
      key: "doc",
      header: tt("Hujjat №", "Документ №"),
      width: "110px",
      cell: (r) => <span className="font-medium">{r.doc_num}</span>,
    },
    {
      key: "date",
      header: tt("Sana", "Дата"),
      width: "110px",
      hideOnMobile: true,
      cell: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {r.doc_date?.slice(0, 10)}
        </span>
      ),
    },
    {
      key: "org",
      header: tt("Tashkilot", "Организация"),
      cell: (r) => r.organization_name || "—",
    },
    {
      key: "user",
      header: tt("Foydalanuvchi", "Пользователь"),
      width: "170px",
      hideOnMobile: true,
      cell: (r) => <span className="text-muted-foreground">{r.user_name}</span>,
    },
    {
      key: "summa",
      header: tt("Summasi", "Сумма"),
      align: "right",
      width: "150px",
      cell: (r) => (
        <span className="tabular-nums">{formatSum(r.result_summa) || "0"}</span>
      ),
    },
    {
      key: "paid",
      header: tt("To'langan", "Оплачено"),
      align: "right",
      width: "140px",
      hideOnMobile: true,
      cell: (r) => (
        <span className="tabular-nums text-success">
          {formatSum(r.paid_summa) || "0"}
        </span>
      ),
    },
    {
      key: "debt",
      header: tt("Qarz", "Долг"),
      align: "right",
      width: "140px",
      cell: (r) => (
        <span className="font-medium tabular-nums text-destructive">
          {formatSum(r.debt_summa) || "0"}
        </span>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      title={tt(...TITLES[type])}
      description={
        meta ? (
          <>
            {tt("Jami", "Всего")}: {meta.count} · {startDate} — {endDate}
          </>
        ) : (
          `${startDate} — ${endDate}`
        )
      }
      className="max-h-[88vh]"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <Button variant="secondary" size="sm" onClick={downloadExcel}>
            <Download />
            {tt("Excel", "Excel")}
          </Button>

          {meta && meta.pageCount > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] tabular-nums text-muted-foreground">
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
          )}
        </div>
      }
    >
      <div className="-mx-5 -my-4">
        <DataTable
          columns={columns}
          rows={rows}
          keyOf={(r) => r.id}
          loading={loading}
          loadingRows={8}
          empty={
            <EmptyState
              icon={FileText}
              title={tt("Shartnoma topilmadi", "Договоры не найдены")}
              description={tt(
                "Tanlangan davr uchun bu turdagi shartnomalar yo'q",
                "За выбранный период договоров такого типа нет"
              )}
            />
          }
        />
      </div>
    </Modal>
  );
}
