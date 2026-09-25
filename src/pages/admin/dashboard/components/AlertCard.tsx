import { useState, useRef, useEffect } from "react";
import { tt } from "@/utils";
import { baseUri } from "@/services/api";
import { authFetch } from "@/services/tokenManager";
import { RedWorkersResponse } from "../types";
import ExportMenu, { reportItems, type ExportMenuItem } from "@/Components/ExportMenu";

interface AlertCardProps {
  redData: RedWorkersResponse | null;
  from: string;
  to: string;
  regionId: number | null;
}

const formatAmount = (num?: number): string => {
  if (!num && num !== 0) return "0";
  return Number(num).toLocaleString("ru-RU");
};

export default function AlertCard({ redData, from, to, regionId }: AlertCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Backend hisobot: Excel va xuddi o'sha hisobotning PDF varianti
  const redReportItems = reportItems({
    key: "red-workers",
    fetchBlob: () => {
      const regionParam = regionId ? `&region_id=${regionId}` : "";
      return authFetch(
        `${baseUri}/admin/dashboard/red-border?from=${from}&to=${to}${regionParam}&excel=true`
      ).then((res) => res.blob());
    },
    fileName: "qizil_chegara_xodimlar.xlsx",
  });

  return (
    <>
      <div className="dash-glass p-[0.875rem] flex flex-col gap-3 shrink-0 border-l-[4px] border-l-rose-500">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-500/20 rounded-lg shrink-0">
            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-[0.875rem] font-bold text-[var(--dash-text)] leading-snug">
              {tt("Qizil chegaraga tushgan xodimlar", "Сотрудники в красной зоне")}
            </h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[1.75rem] font-bold text-rose-500 leading-none">{redData?.red_count || 0}</span>
              <span className="text-[var(--dash-text-muted)] text-[0.75rem]">{tt("xodim aniqlandi", "сотрудников выявлено")}</span>
            </div>
            <p className="text-[0.6875rem] text-[var(--dash-text-secondary)] leading-snug mt-1">
              {tt("Tizim avtomatik ravishda qizil chegaraga tushgan xodimlarni aniqlaydi.", "Система автоматически выявляет сотрудников, попавших в красную зону.")}
            </p>
          </div>
        </div>

        <div className="flex gap-[0.5rem]">
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 h-[2.25rem] bg-transparent border border-success/30 rounded-lg text-success text-[0.75rem] font-medium flex items-center justify-center gap-1.5 hover:bg-success/10 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {tt("Ro'yxatni ko'rsatish", "Показать список")}
          </button>
          <ExportMenu items={redReportItems} className="size-[2.25rem] rounded-lg" title={tt("Yuklab olish", "Скачать")} />
        </div>
      </div>

      {/* Red Workers Modal */}
      <RedWorkersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        redData={redData}
        reportItems={redReportItems}
      />
    </>
  );
}

function RedWorkersModal({
  isOpen, onClose, redData, reportItems,
}: {
  isOpen: boolean; onClose: () => void; redData: RedWorkersResponse | null; reportItems: ExportMenuItem[];
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !redData) return null;

  return (
    <div ref={overlayRef} className="dash-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="shadow-2xl rounded-2xl w-[95vw] max-w-[100rem] max-h-[85vh] flex flex-col"
        style={{ background: "var(--dash-modal-bg)", border: "1px solid var(--dash-modal-border)" }}>

        {/* Header */}
        <div className="px-5 py-4 flex justify-between items-center rounded-t-2xl shrink-0"
          style={{ background: "var(--dash-modal-header-bg)", borderBottom: "1px solid var(--dash-modal-border)" }}>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-rose-500/20 rounded-lg">
              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--dash-text)]">{tt("Qizil chegaraga tushgan xodimlar", "Сотрудники в красной зоне")}</h3>
              <p className="text-[0.75rem] text-[var(--dash-text-muted)]">{redData.red_count} xodim aniqlandi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] p-2 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="px-5 py-4 overflow-y-auto flex-1">
          <div className="overflow-auto rounded-xl max-h-[60vh]" style={{ border: "1px solid var(--dash-table-border)" }}>
            <table className="table-grid w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 z-10" style={{ background: "var(--dash-table-header-bg)" }}>
                <tr className="text-[var(--dash-text-secondary)] uppercase text-[0.6875rem]">
                  <th className="px-4 py-3 font-semibold w-[3.125rem]">№</th>
                  <th className="px-4 py-3 font-semibold min-w-[15.625rem]">{tt("Xodim ismi", "Ф.И.О. сотрудника")}</th>
                  <th className="px-4 py-3 font-semibold min-w-[6.25rem]">{tt("Batalon", "Батальон")}</th>
                  <th className="px-4 py-3 font-semibold text-center min-w-[6.25rem]">{tt("Xodimlar soni", "Количество сотрудников")}</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[8.125rem]">{tt("Batalon summasi", "Сумма батальона")}</th>
                  <th className="px-4 py-3 font-semibold min-w-[8.125rem]">{tt("Viloyat", "Регион")}</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[9.375rem]">{tt("Xodimning olgan summasi", "Сумма, полученная сотрудником")}</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[7.5rem]">{tt("O'rtacha", "Среднее")}</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[7.5rem]">{tt("Chegara (×2)", "Порог (×2)")}</th>
                  <th className="px-4 py-3 font-semibold text-center min-w-[6.875rem]">{tt("Necha marta", "Во сколько раз")}</th>
                </tr>
              </thead>
              <tbody>
                {redData.red_workers.map((w, i) => (
                  <tr key={w.worker_id} className="transition hover:opacity-80"
                    style={{
                      background: i % 2 === 1 ? "var(--dash-table-row-alt)" : "transparent",
                     
                    }}>
                    <td className="px-4 py-3 text-[var(--dash-text-muted)]">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-[var(--dash-text)]">{w.worker_name}</td>
                    <td className="px-4 py-3 text-[var(--dash-text-secondary)]">{w.batalon_name}</td>
                    <td className="px-4 py-3 text-center text-[var(--dash-text)]">{w.batalon_workers_count || 0}</td>
                    <td className="px-4 py-3 text-right text-[var(--dash-text-secondary)]">{formatAmount(w.batalon_summa)}</td>
                    <td className="px-4 py-3 text-[var(--dash-text-secondary)]">{w.region_name}</td>
                    <td className="px-4 py-3 text-right text-rose-500 font-semibold">{formatAmount(w.summa)}</td>
                    <td className="px-4 py-3 text-right text-[var(--dash-text-secondary)]">{formatAmount(w.average)}</td>
                    <td className="px-4 py-3 text-right text-warning">{formatAmount(w.threshold)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded text-[0.6875rem] border bg-rose-500/20 text-rose-500 border-rose-500/30 font-bold">
                        ×{w.times_average}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex justify-end items-center gap-2 shrink-0" style={{ borderTop: "1px solid var(--dash-modal-border)" }}>
          {/* Excel va PDF — ikkalasi ham backenddagi bitta hisobot */}
          <ExportMenu items={reportItems} />
        </div>
      </div>
    </div>
  );
}
