import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import useApi from "@/services/api";
import { ContractItem, ContractsMeta, ContractType } from "../types";

interface ContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ContractType;
}

const typeLabels: Record<ContractType, string> = {
  all: "Jami shartnomalar",
  paid: "Puli to'lab berilgan shartnomalar",
  debt: "Qarzdorligi bor shartnomalar",
};

const formatAmount = (num?: number): string => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ru-RU");
};

export default function ContractsModal({ isOpen, onClose, type }: ContractsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [meta, setMeta] = useState<ContractsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 15;

  const { startDate, endDate } = useSelector((state: RootState) => state.defaultDate);
  const api = useApi();

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<ContractItem[]>(
        `region/dashboard/contracts?from=${startDate}&to=${endDate}&type=${type}&page=${page}&limit=${limit}`
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
  }, [startDate, endDate, type, page]);

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

  const borderColor = type === "debt" ? "border-l-rose-500" : "border-l-emerald-500";

  return (
    <div ref={overlayRef} className="dash-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="shadow-2xl rounded-2xl w-[95vw] max-h-[85vh] flex flex-col"
        style={{ background: "var(--dash-modal-bg)", border: "1px solid var(--dash-modal-border)" }}>

        <div className="px-5 py-4 flex justify-between items-center rounded-t-2xl shrink-0"
          style={{ background: "var(--dash-modal-header-bg)", borderBottom: "1px solid var(--dash-modal-border)" }}>
          <div className="flex items-center gap-3">
            <div className={`w-1 h-8 rounded-full ${borderColor.replace("border-l-", "bg-")}`} />
            <div>
              <h3 className="text-lg font-bold text-[var(--dash-text)]">{typeLabels[type]}</h3>
              {meta && (
                <p className="text-[11px] text-[var(--dash-text-muted)]">
                  Jami: {meta.count} ta shartnoma
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] p-2 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="rounded-xl flex flex-col overflow-hidden flex-1" style={{ border: "1px solid var(--dash-table-border)" }}>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead style={{ background: "var(--dash-table-header-bg)", borderBottom: "1px solid var(--dash-table-border)" }}>
                  <tr className="text-[var(--dash-text-secondary)] uppercase text-[11px]">
                    <th className="px-4 py-3 font-semibold w-[50px]">№</th>
                    <th className="px-4 py-3 font-semibold w-[100px]">Hujjat raqami</th>
                    <th className="px-4 py-3 font-semibold w-[100px]">Sana</th>
                    <th className="px-4 py-3 font-semibold">Tashkilot</th>
                    <th className="px-4 py-3 font-semibold w-[160px]">Foydalanuvchi</th>
                    <th className="px-4 py-3 font-semibold text-right w-[150px]">Shartnoma summasi</th>
                    <th className="px-4 py-3 font-semibold text-right w-[120px]">To'langan</th>
                    <th className="px-4 py-3 font-semibold text-right w-[120px]">Qarz</th>
                  </tr>
                </thead>
              </table>
              <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <tbody>
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-[var(--dash-text-muted)]">
                        Ma'lumot topilmadi
                      </td>
                    </tr>
                  ) : (
                    contracts.map((c, i) => (
                      <tr key={c.id} className="transition hover:opacity-80"
                        style={{ background: i % 2 === 1 ? "var(--dash-table-row-alt)" : "transparent", borderBottom: "1px solid var(--dash-table-border)" }}>
                        <td className="px-4 py-3 text-[var(--dash-text-muted)] w-[50px]">{(page - 1) * limit + i + 1}</td>
                        <td className="px-4 py-3 font-medium text-[var(--dash-text)] w-[100px]">{c.doc_num}</td>
                        <td className="px-4 py-3 text-[var(--dash-text-secondary)] w-[100px]">{c.doc_date?.slice(0, 10)}</td>
                        <td className="px-4 py-3 text-[var(--dash-text)]">{c.organization_name || "—"}</td>
                        <td className="px-4 py-3 text-[var(--dash-text-secondary)] w-[160px]">{c.user_name}</td>
                        <td className="px-4 py-3 text-right text-[var(--dash-text)] w-[150px]">{formatAmount(c.result_summa)}</td>
                        <td className="px-4 py-3 text-right text-emerald-500 w-[120px]">{formatAmount(c.paid_summa)}</td>
                        <td className="px-4 py-3 text-right text-rose-500 w-[120px]">{formatAmount(c.debt_summa)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>

        {meta && meta.pageCount > 1 && (
          <div className="px-5 py-3 flex items-center justify-between shrink-0" style={{ borderTop: "1px solid var(--dash-modal-border)" }}>
            <p className="text-[12px] text-[var(--dash-text-muted)]">
              {meta.currentPage} / {meta.pageCount} sahifa
            </p>
            <div className="flex gap-2">
              <button disabled={!meta.backPage} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-[12px] font-medium rounded-lg border border-[var(--dash-modal-border)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] transition disabled:opacity-30 disabled:cursor-not-allowed">
                Oldingi
              </button>
              <button disabled={!meta.nextPage} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-[12px] font-medium rounded-lg border border-[var(--dash-modal-border)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] transition disabled:opacity-30 disabled:cursor-not-allowed">
                Keyingi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
