import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { baseUri } from "@/services/api";
import { authFetch } from "@/services/tokenManager";
import { UserApiData } from "../types";

const formatAmount = (num?: number): string => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ru-RU");
};

interface UsersTableProps {
  usersData: UserApiData[];
  onDetail: () => void;
}

export default function UsersTable({ usersData, onDetail }: UsersTableProps) {
  return (
    <div className="dash-glass p-[12px] lg:col-span-2 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[16px] font-semibold flex items-center text-[var(--dash-text)]">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-3 animate-pulse" />
          Foydalanuvchilar bo'yicha
        </h2>
        <button
          onClick={onDetail}
          className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 border border-blue-400/40 hover:border-blue-300/60 rounded-md px-2.5 py-1 transition"
        >
          Batafsil
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="overflow-auto flex-1 rounded-xl" style={{ border: "1px solid var(--dash-table-border)" }}>
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 z-10" style={{ background: "var(--dash-table-header-bg)", borderBottom: "1px solid var(--dash-table-border)" }}>
            <tr className="text-[var(--dash-text-secondary)] uppercase text-[11px]">
              <th className="px-3 py-2.5 font-semibold">№</th>
              <th className="px-3 py-2.5 font-semibold">Foydalanuvchi</th>
              <th className="px-3 py-2.5 font-semibold text-center">Jami</th>
              <th className="px-3 py-2.5 font-semibold text-right">Summa</th>
              <th className="px-3 py-2.5 font-semibold text-center">To'langan</th>
              <th className="px-3 py-2.5 font-semibold text-right">Summa</th>
              <th className="px-3 py-2.5 font-semibold text-center">Qarzdor</th>
              <th className="px-3 py-2.5 font-semibold text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            {usersData.filter(u => u.data.all_contract.count > 0).map((user, i) => (
              <tr key={user.user_id} className="transition hover:opacity-80"
                style={{ background: i % 2 === 1 ? "var(--dash-table-row-alt)" : "transparent", borderBottom: "1px solid var(--dash-table-border)" }}>
                <td className="px-3 py-2.5 text-[var(--dash-text-muted)] text-[12px]">{i + 1}</td>
                <td className="px-3 py-2.5 font-medium text-[var(--dash-text)] text-[12px]">{user.user_name}</td>
                <td className="px-3 py-2.5 text-center text-[var(--dash-text)] text-[12px]">{user.data.all_contract.count}</td>
                <td className="px-3 py-2.5 text-right text-[var(--dash-text-secondary)] text-[12px]">{formatAmount(user.data.all_contract.summa)}</td>
                <td className="px-3 py-2.5 text-center text-emerald-500 text-[12px]">{user.data.prixod_contract.count}</td>
                <td className="px-3 py-2.5 text-right text-emerald-500 text-[12px]">{formatAmount(user.data.prixod_contract.summa)}</td>
                <td className="px-3 py-2.5 text-center text-rose-500 text-[12px]">{user.data.rasxod_contract.count}</td>
                <td className="px-3 py-2.5 text-right text-rose-500 text-[12px]">{formatAmount(user.data.rasxod_contract.summa)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UserModal({ isOpen, onClose, usersData }: { isOpen: boolean; onClose: () => void; usersData: UserApiData[] }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { startDate, endDate } = useSelector((state: RootState) => state.defaultDate);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleExcel = () => {
    const url = `${baseUri}/region/dashboard/by-user?from=${startDate}&to=${endDate}&excel=true`;

    authFetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", "foydalanuvchilar.xlsx");
        link.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => console.error("Excel yuklashda xatolik:", err));
  };

  if (!isOpen) return null;

  const totals = usersData.reduce((acc, r) => ({
    allCount: acc.allCount + r.data.all_contract.count,
    allSumma: acc.allSumma + r.data.all_contract.summa,
    paidCount: acc.paidCount + r.data.prixod_contract.count,
    paidSumma: acc.paidSumma + r.data.prixod_contract.summa,
    debtCount: acc.debtCount + r.data.rasxod_contract.count,
    debtSumma: acc.debtSumma + r.data.rasxod_contract.summa,
  }), { allCount: 0, allSumma: 0, paidCount: 0, paidSumma: 0, debtCount: 0, debtSumma: 0 });

  return (
    <div ref={overlayRef} className="dash-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="shadow-2xl rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col"
        style={{ background: "var(--dash-modal-bg)", border: "1px solid var(--dash-modal-border)" }}>

        <div className="px-5 py-4 flex justify-between items-center rounded-t-2xl shrink-0"
          style={{ background: "var(--dash-modal-header-bg)", borderBottom: "1px solid var(--dash-modal-border)" }}>
          <h3 className="text-lg font-bold text-[var(--dash-text)]">Foydalanuvchilar bo'yicha</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExcel}
              disabled={usersData.length === 0}
              className="h-[36px] px-3 bg-emerald-500 rounded-lg text-white text-[12px] font-medium flex items-center gap-1.5 hover:bg-emerald-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Excel yuklab olish
            </button>
            <button onClick={onClose} className="text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] p-2 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--dash-modal-border)" }}>
          {[
            { label: "Jami shartnomalar", count: totals.allCount, summa: totals.allSumma, border: "border-l-emerald-500", color: "" },
            { label: "Puli to'lab berilgan", count: totals.paidCount, summa: totals.paidSumma, border: "border-l-emerald-500", color: "text-emerald-500" },
            { label: "Qarzdorligi bor", count: totals.debtCount, summa: totals.debtSumma, border: "border-l-rose-500", color: "text-rose-500" },
          ].map((card, i) => (
            <div key={i} className={`rounded-xl p-3 border-l-[3px] ${card.border}`} style={{ background: "var(--dash-table-row-alt)" }}>
              <p className="text-[10px] text-[var(--dash-text-muted)] uppercase tracking-wider">{card.label}</p>
              <div className="flex items-baseline gap-3 mt-1">
                <div>
                  <span className="text-[10px] text-[var(--dash-text-muted)]">Soni</span>
                  <p className={`text-[20px] font-bold leading-none ${card.color || "text-[var(--dash-text)]"}`}>{card.count}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--dash-text-muted)]">Summasi</span>
                  <p className={`text-[14px] font-semibold leading-none mt-0.5 ${card.color || "text-[var(--dash-text-secondary)]"}`}>{formatAmount(card.summa)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1">
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--dash-table-border)" }}>
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead style={{ background: "var(--dash-table-header-bg)", borderBottom: "1px solid var(--dash-table-border)" }}>
                <tr className="text-[var(--dash-text-secondary)] uppercase text-[11px]">
                  <th className="px-4 py-3 font-semibold">№</th>
                  <th className="px-4 py-3 font-semibold">Foydalanuvchi</th>
                  <th className="px-4 py-3 font-semibold text-center">Jami</th>
                  <th className="px-4 py-3 font-semibold text-right">Jami summa</th>
                  <th className="px-4 py-3 font-semibold text-center">To'langan</th>
                  <th className="px-4 py-3 font-semibold text-right">To'langan summa</th>
                  <th className="px-4 py-3 font-semibold text-center">Qarzdor</th>
                  <th className="px-4 py-3 font-semibold text-right">Qarzdor summa</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((user, i) => (
                  <tr key={user.user_id} className="transition hover:opacity-80"
                    style={{ background: i % 2 === 1 ? "var(--dash-table-row-alt)" : "transparent", borderBottom: "1px solid var(--dash-table-border)" }}>
                    <td className="px-4 py-3 text-[var(--dash-text-muted)]">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-[var(--dash-text)]">{user.user_name}</td>
                    <td className="px-4 py-3 text-center text-[var(--dash-text)]">{user.data.all_contract.count}</td>
                    <td className="px-4 py-3 text-right text-[var(--dash-text-secondary)]">{formatAmount(user.data.all_contract.summa)}</td>
                    <td className="px-4 py-3 text-center text-emerald-500">{user.data.prixod_contract.count}</td>
                    <td className="px-4 py-3 text-right text-emerald-500">{formatAmount(user.data.prixod_contract.summa)}</td>
                    <td className="px-4 py-3 text-center text-rose-500">{user.data.rasxod_contract.count}</td>
                    <td className="px-4 py-3 text-right text-rose-500">{formatAmount(user.data.rasxod_contract.summa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
