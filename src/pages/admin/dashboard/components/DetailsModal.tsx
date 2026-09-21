import { useEffect, useRef } from "react";
import { tt } from "../../../../utils";

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tableData = [
  {
    name: "Markaziy Apparat",
    hisoblangan: "4,500,000,000",
    kelib: "4,100,000,000",
    tarqatilgan: "1,025,000,000",
    qoldiq: "3,075,000,000",
    status: "Muvaffaqiyatli",
    statusClass: "bg-success/20 text-success border-success/30/30",
  },
  {
    name: "Hududiy Boshqarmalar",
    hisoblangan: "8,200,000,000",
    kelib: "6,500,000,000",
    tarqatilgan: "1,625,000,000",
    qoldiq: "4,875,000,000",
    status: "Jarayonda",
    statusClass: "bg-warning/20 text-warning border-warning/30/30",
  },
  {
    name: "Maxsus Tadbirlar",
    hisoblangan: "2,540,000,000",
    kelib: "1,500,000,000",
    tarqatilgan: "375,000,000",
    qoldiq: "1,125,000,000",
    status: "Tasdiqlashda",
    statusClass: "bg-primary/20 text-primary border-primary/30/30",
  },
];

export default function DetailsModal({ isOpen, onClose }: DetailsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="dash-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="shadow-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        style={{
          background: "var(--dash-modal-bg)",
          borderColor: "var(--dash-modal-border)",
          borderWidth: 1,
        }}
      >
        <div
          className="px-6 py-4 flex justify-between items-center rounded-t-2xl"
          style={{
            background: "var(--dash-modal-header-bg)",
            borderBottom: "1px solid var(--dash-modal-border)",
          }}
        >
          <h3 className="text-xl font-bold flex items-center text-[var(--dash-text)]">
            <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {tt("Moliya tahlili tafsilotlari", "Детали финансового анализа")}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] p-2 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--dash-table-border)" }}>
            <table className="table-grid w-full text-left text-sm whitespace-nowrap">
              <thead style={{ background: "var(--dash-table-header-bg)" }}>
                <tr className="text-[var(--dash-text-secondary)] uppercase">
                  <th className="px-6 py-4 font-semibold">{tt("Yo'nalish / Bo'lim", "Направление / Раздел")}</th>
                  <th className="px-6 py-4 font-semibold">{tt("Hisoblangan (SUM)", "Начислено (сум)")}</th>
                  <th className="px-6 py-4 font-semibold">{tt("Kelib tushgan (so'm)", "Поступило (сум)")}</th>
                  <th className="px-6 py-4 font-semibold">{tt("Tarqatilgan (so'm)", "Распределено (сум)")}</th>
                  <th className="px-6 py-4 font-semibold">{tt("Qoldiq (so'm)", "Остаток (сум)")}</th>
                  <th className="px-6 py-4 font-semibold">{tt("Holati", "Статус")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr
                    key={i}
                    className="transition hover:opacity-80"
                    style={{
                      background: i % 2 === 1 ? "var(--dash-table-row-alt)" : "transparent",
                     
                    }}
                  >
                    <td className="px-6 py-4 font-medium text-[var(--dash-text)]">{row.name}</td>
                    <td className="px-6 py-4 text-[var(--dash-text-secondary)]">{row.hisoblangan}</td>
                    <td className="px-6 py-4 text-success">{row.kelib}</td>
                    <td className="px-6 py-4 text-primary">{row.tarqatilgan}</td>
                    <td className="px-6 py-4 text-rose-500">{row.qoldiq}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs border ${row.statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition">
              {tt("Hisobotni yuklash", "Скачать отчёт")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
