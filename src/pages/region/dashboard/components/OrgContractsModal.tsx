import { useEffect, useRef, useState, useCallback } from "react";
import useApi, { baseUri } from "@/services/api";
import { authFetch } from "@/services/tokenManager";
import { ContractsMeta, OrgDebtContractItem, OrganizationDebtRow } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  to: string;
  accountId: number | null;
  organization: OrganizationDebtRow | null;
}

const formatAmount = (num?: number): string => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ru-RU");
};

export default function OrgContractsModal({ isOpen, onClose, to, accountId, organization }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [contracts, setContracts] = useState<OrgDebtContractItem[]>([]);
  const [meta, setMeta] = useState<ContractsMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 15;

  const api = useApi();

  const buildQs = (extra: Record<string, string> = {}) => {
    const qs = new URLSearchParams({ to, ...extra });
    if (accountId) qs.set("account_number_id", String(accountId));
    if (organization) qs.set("organization_id", String(organization.organization_id));
    return qs;
  };

  const fetchContracts = useCallback(async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const qs = buildQs({ page: String(page), limit: String(limit) });
      const res = await api.get<OrgDebtContractItem[]>(`region/dashboard/organization-debt-contracts?${qs.toString()}`);
      if (res?.success) {
        setContracts(res.data || []);
        setMeta((res as any).meta || null);
      }
    } finally {
      setLoading(false);
    }
  }, [to, accountId, organization?.organization_id, page]);

  useEffect(() => { if (isOpen) setPage(1); }, [isOpen, organization?.organization_id]);
  useEffect(() => { if (isOpen) fetchContracts(); }, [isOpen, fetchContracts]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleExcel = () => {
    if (!organization) return;

    const qs = buildQs({ excel: "true" });
    const url = `${baseUri}/region/dashboard/organization-debt-contracts?${qs.toString()}`;

    authFetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        const safe = (organization.organization_name || "tashkilot").replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 40);
        link.setAttribute("download", `${safe}_qarzdor_shartnomalar.xlsx`);
        link.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => console.error("Excel yuklashda xatolik:", err));
  };

  if (!isOpen || !organization) return null;

  return (
    <div ref={overlayRef} className="dash-modal-overlay fixed inset-0 z-[110] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="shadow-2xl rounded-2xl w-[95vw] max-w-[1500px] max-h-[85vh] flex flex-col"
        style={{ background: "var(--dash-modal-bg)", border: "1px solid var(--dash-modal-border)" }}>

        <div className="px-5 py-4 flex justify-between items-center rounded-t-2xl shrink-0"
          style={{ background: "var(--dash-modal-header-bg)", borderBottom: "1px solid var(--dash-modal-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-full bg-rose-500" />
            <div>
              <h3 className="text-[15px] font-bold text-[var(--dash-text)]">{organization.organization_name}</h3>
              <p className="text-[11px] text-[var(--dash-text-muted)]">
                Qarz: <span className="text-rose-500 font-semibold">{formatAmount(organization.debt_summa)}</span>
                {" · "}Shartnomalar: {organization.contract_count}
                {" · "}{to} sanasigacha
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExcel}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-medium rounded-md transition flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Excel
            </button>
            <button onClick={onClose} className="text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] p-2 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
                    <th className="px-4 py-3 font-semibold w-[120px]">Hujjat raqami</th>
                    <th className="px-4 py-3 font-semibold w-[110px]">Sana</th>
                    <th className="px-4 py-3 font-semibold w-[160px]">Hisob raqami</th>
                    <th className="px-4 py-3 font-semibold">Foydalanuvchi</th>
                    <th className="px-4 py-3 font-semibold text-right w-[160px]">Shartnoma summasi</th>
                    <th className="px-4 py-3 font-semibold text-right w-[140px]">To'langan</th>
                    <th className="px-4 py-3 font-semibold text-right w-[140px]">Qarz</th>
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
                          <td className="px-4 py-3 font-medium text-[var(--dash-text)] w-[120px]">{c.doc_num}</td>
                          <td className="px-4 py-3 text-[var(--dash-text-secondary)] w-[110px]">{c.doc_date?.slice(0, 10)}</td>
                          <td className="px-4 py-3 text-[var(--dash-text-secondary)] w-[160px]">{c.account_number || "—"}</td>
                          <td className="px-4 py-3 text-[var(--dash-text-secondary)]">{c.user_name}</td>
                          <td className="px-4 py-3 text-right text-[var(--dash-text)] w-[160px]">{formatAmount(c.result_summa)}</td>
                          <td className="px-4 py-3 text-right text-emerald-500 w-[140px]">{formatAmount(c.paid_summa)}</td>
                          <td className="px-4 py-3 text-right text-rose-500 font-semibold w-[140px]">{formatAmount(c.debt_summa)}</td>
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
                className="dash-btn dash-btn-secondary">
                Oldingi
              </button>
              <button disabled={!meta.nextPage} onClick={() => setPage((p) => p + 1)}
                className="dash-btn dash-btn-secondary">
                Keyingi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
