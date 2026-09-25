import { useEffect, useRef, useState, useCallback } from "react";
import { formatDate, tt } from "@/utils";
import { DebtStatusBadge, debtStatusLabel } from "@/lib/debtStatus";
import ExportButtons from "@/Components/ExportButtons";
import { EXPORT_ALL_LIMIT, type ExportColumn } from "@/lib/tableExport";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { ContractItem, ContractsMeta, ContractType } from "../types";
import "../dashboard.css";

interface ContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ContractType;
  regionId: number | null;
  /** Davr — berilmasa umumiy (redux) sana oralig'i */
  from?: string;
  to?: string;
}

const formatAmount = (num?: number): string => {
  if (!num && num !== 0) return "0";
  return Number(num).toLocaleString("ru-RU");
};

/** Eksport sarlavhasi — tanlangan tilda (tt bosilgan paytda hisoblanadi). */
const exportTitle = (type: ContractType): string =>
  ({
    all: tt("Jami shartnomalar", "Всего договоров"),
    paid: tt("Puli to'lab berilgan shartnomalar", "Оплаченные договоры"),
    debt: tt("Qarzdorligi bor shartnomalar", "Договоры с задолженностью"),
    not_due: tt("Qarz — to'lov muddati kelmagan", "Долг — срок оплаты не наступил"),
    late: tt("Qarz — to'lov kechiktirilgan", "Долг — оплата просрочена"),
    overdue: tt("Qarz — muddati o'tgan", "Долг — срок истёк"),
  })[type];

const exportColumns = (): ExportColumn<ContractItem>[] => [
  { header: "№", value: (_, i) => i + 1, width: 6, align: "center" },
  { header: tt("Hujjat raqami", "Номер документа"), value: (c) => c.doc_num },
  { header: tt("Sana", "Дата"), value: (c) => c.doc_date?.slice(0, 10), align: "center" },
  { header: tt("Tashkilot", "Организация"), value: (c) => c.organization_name || "—" },
  { header: tt("Foydalanuvchi", "Пользователь"), value: (c) => c.user_name },
  { header: tt("Viloyat", "Регион"), value: (c) => c.region_name },
  { header: tt("Shartnoma summasi", "Сумма договора"), value: (c) => formatAmount(c.result_summa), excelValue: (c) => Number(c.result_summa) || 0, align: "right" },
  { header: tt("To'langan", "Оплачено"), value: (c) => formatAmount(c.paid_summa), excelValue: (c) => Number(c.paid_summa) || 0, align: "right" },
  { header: tt("Qarz", "Долг"), value: (c) => formatAmount(c.debt_summa), excelValue: (c) => Number(c.debt_summa) || 0, align: "right" },
  {
    header: tt("To'lov muddati", "Срок оплаты"),
    value: (c) => {
      if (!c.debt_status || c.debt_status === "paid") return "";
      const label = debtStatusLabel(c.debt_status);
      return c.event_date ? `${label} (${tt("Tadbir", "Мероприятие")}: ${formatDate(c.event_date)})` : label;
    },
  },
];

export default function ContractsModal({ isOpen, onClose, type, regionId, from, to }: ContractsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [meta, setMeta] = useState<ContractsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 15;

  const def = useSelector((state: RootState) => state.defaultDate);
  const startDate = from ?? def.startDate;
  const endDate = to ?? def.endDate;
  const api = useApi();

  const fetchAllContracts = async (): Promise<ContractItem[]> => {
    const regionParam = regionId ? `&region_id=${regionId}` : "";
    const res = await api.get<ContractItem[]>(
      `admin/dashboard/contracts?from=${startDate}&to=${endDate}&type=${type}&page=1&limit=${EXPORT_ALL_LIMIT}${regionParam}`
    );
    return res?.success ? res.data ?? [] : [];
  };

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const regionParam = regionId ? `&region_id=${regionId}` : "";
      const res = await api.get<ContractItem[]>(
        `admin/dashboard/contracts?from=${startDate}&to=${endDate}&type=${type}&page=${page}&limit=${limit}${regionParam}`
      );

      if (res?.success) {
        setContracts(res.data);
        setMeta((res as any).meta || null);
      }
    } catch (error) {
      console.error("Contracts fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, type, page, regionId]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
    }
  }, [isOpen, type]);

  useEffect(() => {
    if (isOpen) {
      fetchContracts();
    }
  }, [isOpen, fetchContracts]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Sarlavha yonidagi chiziq — holat rangi
  const accent =
    type === "overdue" || type === "debt"
      ? "bg-destructive"
      : type === "late"
      ? "bg-warning"
      : type === "not_due"
      ? "bg-primary"
      : "bg-success";

  return (
    <div ref={overlayRef} className="dash-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="shadow-2xl w-[95vw] max-h-[85vh] flex flex-col"
        style={{ background: "var(--dash-modal-bg)", border: "1px solid var(--dash-modal-border)" }}>

        {/* Header */}
        <div className="px-5 py-4 flex justify-between items-center shrink-0"
          style={{ background: "var(--dash-modal-header-bg)", borderBottom: "1px solid var(--dash-modal-border)" }}>
          <div className="flex items-center gap-3">
            <div className={`w-1 h-8 rounded-none ${accent}`} />
            <div>
              <h3 className="text-lg font-bold text-[var(--dash-text)]">{exportTitle(type)}</h3>
              {meta && (
                <p className="text-[0.6875rem] text-[var(--dash-text-muted)]">
                  {tt("Jami", "Всего")}: {meta.count} {tt("ta shartnoma", "договоров")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons
              title={exportTitle(type)}
              columns={exportColumns()}
              fetchRows={fetchAllContracts}
            />
            <button onClick={onClose} className="text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] p-2 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="px-5 py-4 flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-[12.5rem]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary/30" />
            </div>
          ) : (
            <div className="flex-1 overflow-auto" style={{ border: "1px solid var(--dash-table-border)" }}>
              {/* Bitta jadval: sarlavha yopishqoq, ustunlar tana bilan bir xil kenglikda */}
              <table className="table-grid w-full text-left text-sm whitespace-nowrap">
                <thead className="sticky top-0 z-[1] bg-muted">
                  <tr className="text-[var(--dash-text-secondary)] uppercase text-[0.6875rem]">
                    <th className="px-4 py-3 font-semibold w-[3.125rem]">№</th>
                    <th className="px-4 py-3 font-semibold w-[6.25rem]">{tt("Hujjat raqami", "Номер документа")}</th>
                    <th className="px-4 py-3 font-semibold w-[6.25rem]">{tt("Sana", "Дата")}</th>
                    <th className="px-4 py-3 font-semibold">{tt("Tashkilot", "Организация")}</th>
                    <th className="px-4 py-3 font-semibold w-[10rem]">{tt("Foydalanuvchi", "Пользователь")}</th>
                    <th className="px-4 py-3 font-semibold w-[8.75rem]">{tt("Viloyat", "Регион")}</th>
                    <th className="px-4 py-3 font-semibold text-right w-[9.375rem]">{tt("Shartnoma summasi", "Сумма договора")}</th>
                    <th className="px-4 py-3 font-semibold text-right w-[7.5rem]">{tt("To'langan", "Оплачено")}</th>
                    <th className="px-4 py-3 font-semibold text-right w-[7.5rem]">{tt("Qarz", "Долг")}</th>
                    <th className="px-4 py-3 font-semibold w-[9.5rem]">{tt("To'lov muddati", "Срок оплаты")}</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-[var(--dash-text-muted)]">
                        {tt("Ma'lumot topilmadi", "Данные не найдены")}
                      </td>
                    </tr>
                  ) : (
                    contracts.map((c, i) => (
                      <tr key={c.id} className="transition-colors hover:!bg-accent"
                        style={{ background: i % 2 === 1 ? "var(--dash-table-row-alt)" : "hsl(var(--card))" }}>
                        <td className="px-4 py-3 text-[var(--dash-text-muted)] w-[3.125rem]">{(page - 1) * limit + i + 1}</td>
                        <td className="px-4 py-3 font-medium text-[var(--dash-text)] w-[6.25rem]">{c.doc_num}</td>
                        <td className="px-4 py-3 text-[var(--dash-text-secondary)] w-[6.25rem]">{c.doc_date?.slice(0, 10)}</td>
                        <td className="max-w-[22rem] truncate px-4 py-3 text-[var(--dash-text)]" title={c.organization_name || ""}>{c.organization_name || "—"}</td>
                        <td className="max-w-[12rem] truncate px-4 py-3 text-[var(--dash-text-secondary)]" title={c.user_name}>{c.user_name}</td>
                        <td className="px-4 py-3 text-[var(--dash-text-secondary)] w-[8.75rem]">{c.region_name}</td>
                        <td className="px-4 py-3 text-right text-[var(--dash-text)] w-[9.375rem]">{formatAmount(c.result_summa)}</td>
                        <td className="px-4 py-3 text-right text-success w-[7.5rem]">{formatAmount(c.paid_summa)}</td>
                        <td className="px-4 py-3 text-right text-rose-500 w-[7.5rem]">{formatAmount(c.debt_summa)}</td>
                        <td className="px-4 py-3 w-[9.5rem]">
                          {c.debt_status && c.debt_status !== "paid" && (
                            <div className="flex flex-col gap-0.5">
                              <DebtStatusBadge status={c.debt_status} dueDate={c.payment_due_date} />
                              {c.event_date && (
                                <span className="text-[0.6875rem] text-[var(--dash-text-muted)]">
                                  {tt("Tadbir", "Мероприятие")}: {formatDate(c.event_date)}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.pageCount > 1 && (
          <div className="px-5 py-3 flex items-center justify-between shrink-0" style={{ borderTop: "1px solid var(--dash-modal-border)" }}>
            <p className="text-[0.75rem] text-[var(--dash-text-muted)]">
              {meta.currentPage} / {meta.pageCount} {tt("sahifa", "стр.")}
            </p>
            <div className="flex gap-2">
              <button
                disabled={!meta.backPage}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-[0.75rem] font-medium border border-[var(--dash-modal-border)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {tt("Oldingi", "Предыдущая")}
              </button>
              <button
                disabled={!meta.nextPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-[0.75rem] font-medium border border-[var(--dash-modal-border)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {tt("Keyingi", "Следующая")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
