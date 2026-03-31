import { useState, useRef, useEffect } from "react";
import { baseUri } from "@/services/api";
import { RedWorkersResponse } from "../types";

interface AlertCardProps {
  redData: RedWorkersResponse | null;
  from: string;
  to: string;
}

const formatAmount = (num?: number): string => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ru-RU");
};

export default function AlertCard({ redData, from, to }: AlertCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleExcel = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const url = `${baseUri}/region/dashboard/red-border?from=${from}&to=${to}&excel=true`;

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "qizil_chegara_xodimlar.xlsx");

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        link.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => console.error("Excel yuklashda xatolik:", err));
  };

  return (
    <>
      <div className="dash-glass p-[14px] flex flex-col gap-3 shrink-0 border-l-[4px] border-l-rose-500">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-500/20 rounded-lg shrink-0">
            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-[14px] font-bold text-[var(--dash-text)] leading-snug">
              Qizil chegaraga tushgan xodimlar
            </h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[28px] font-bold text-rose-500 leading-none">{redData?.red_count || 0}</span>
              <span className="text-[var(--dash-text-muted)] text-[12px]">xodim aniqlandi</span>
            </div>
          </div>
        </div>

        <div className="flex gap-[8px]">
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 h-[36px] bg-transparent border border-emerald-500 rounded-lg text-emerald-500 text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-500/10 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Ro'yxatni ko'rsatish
          </button>
          <button
            onClick={handleExcel}
            className="flex-1 h-[36px] bg-emerald-500 rounded-lg text-white text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Excel yuklab olish
          </button>
        </div>
      </div>

      <RedWorkersModal isOpen={modalOpen} onClose={() => setModalOpen(false)} redData={redData} onExcel={handleExcel} />
    </>
  );
}

function RedWorkersModal({ isOpen, onClose, redData, onExcel }: { isOpen: boolean; onClose: () => void; redData: RedWorkersResponse | null; onExcel: () => void }) {
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
      <div className="shadow-2xl rounded-2xl w-[95vw] max-w-[1600px] max-h-[85vh] flex flex-col"
        style={{ background: "var(--dash-modal-bg)", border: "1px solid var(--dash-modal-border)" }}>

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
              <h3 className="text-lg font-bold text-[var(--dash-text)]">Qizil chegaraga tushgan xodimlar</h3>
              <p className="text-[12px] text-[var(--dash-text-muted)]">{redData.red_count} xodim aniqlandi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] p-2 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1">
          <div className="overflow-auto rounded-xl max-h-[60vh]" style={{ border: "1px solid var(--dash-table-border)" }}>
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 z-10" style={{ background: "var(--dash-table-header-bg)", borderBottom: "1px solid var(--dash-table-border)" }}>
                <tr className="text-[var(--dash-text-secondary)] uppercase text-[11px]">
                  <th className="px-4 py-3 font-semibold w-[50px]">№</th>
                  <th className="px-4 py-3 font-semibold min-w-[250px]">Xodim ismi</th>
                  <th className="px-4 py-3 font-semibold min-w-[100px]">Batalon</th>
                  <th className="px-4 py-3 font-semibold text-center min-w-[100px]">Xodimlar soni</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[130px]">Batalon summasi</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[150px]">Xodimning olgan summasi</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[120px]">O'rtacha</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[120px]">Chegara (×2)</th>
                  <th className="px-4 py-3 font-semibold text-center min-w-[110px]">Necha marta</th>
                </tr>
              </thead>
              <tbody>
                {redData.red_workers.map((w, i) => (
                  <tr key={w.worker_id} className="transition hover:opacity-80"
                    style={{ background: i % 2 === 1 ? "var(--dash-table-row-alt)" : "transparent", borderBottom: "1px solid var(--dash-table-border)" }}>
                    <td className="px-4 py-3 text-[var(--dash-text-muted)]">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-[var(--dash-text)]">{w.worker_name}</td>
                    <td className="px-4 py-3 text-[var(--dash-text-secondary)]">{w.batalon_name}</td>
                    <td className="px-4 py-3 text-center text-[var(--dash-text)]">{w.batalon_workers_count || 0}</td>
                    <td className="px-4 py-3 text-right text-[var(--dash-text-secondary)]">{formatAmount(w.batalon_summa)}</td>
                    <td className="px-4 py-3 text-right text-rose-500 font-semibold">{formatAmount(w.summa)}</td>
                    <td className="px-4 py-3 text-right text-[var(--dash-text-secondary)]">{formatAmount(w.average)}</td>
                    <td className="px-4 py-3 text-right text-amber-500">{formatAmount(w.threshold)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded text-[11px] border bg-rose-500/20 text-rose-500 border-rose-500/30 font-bold">
                        ×{w.times_average}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-5 py-3 flex justify-end shrink-0" style={{ borderTop: "1px solid var(--dash-modal-border)" }}>
          <button onClick={onExcel}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-medium rounded-lg transition flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Excel yuklab olish
          </button>
        </div>
      </div>
    </div>
  );
}
