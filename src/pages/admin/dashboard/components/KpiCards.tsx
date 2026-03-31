import { KpiData, ContractType } from "../types";

interface KpiCardProps {
  title: string;
  count: number;
  amount: number;
  borderColor: string;
  icon: React.ReactNode;
  onDetail?: () => void;
}

const formatAmount = (num?: number): string => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ru-RU");
};

function KpiCard({ title, count, amount, borderColor, icon, onDetail }: KpiCardProps) {
  return (
    <div className={`dash-glass relative overflow-hidden flex items-center px-[16px] py-[12px] border-l-[4px] ${borderColor}`}>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[var(--dash-text-secondary)] font-semibold uppercase tracking-wider mb-2 truncate">
          {title}
        </p>
        <div className="flex items-baseline gap-4">
          <div>
            <span className="text-[10px] text-[var(--dash-text-muted)] uppercase tracking-wider">Soni</span>
            <p className="text-[22px] font-bold text-[var(--dash-text)] leading-none">{count || 0}</p>
          </div>
          <div>
            <span className="text-[10px] text-[var(--dash-text-muted)] uppercase tracking-wider">Summasi</span>
            <p className="text-[15px] font-semibold text-[var(--dash-text-secondary)] leading-none mt-0.5">{formatAmount(amount)}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 ml-3 shrink-0">
        <div className="opacity-30">
          {icon}
        </div>
        <button onClick={onDetail} className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 border border-blue-400/40 hover:border-blue-300/60 rounded-md px-2.5 py-1 transition">
          Batafsil
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function KpiCards({ data, onDetail }: { data: KpiData; onDetail: (type: ContractType) => void }) {
  const cards: KpiCardProps[] = [
    {
      title: "Jami shartnomalar",
      count: data.all.count,
      amount: data.all.summa,
      borderColor: "border-l-emerald-500",
      onDetail: () => onDetail("all"),
      icon: (
        <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Puli to'lab berilgan shartnomalar",
      count: data.paid.count,
      amount: data.paid.summa,
      borderColor: "border-l-emerald-500",
      onDetail: () => onDetail("paid"),
      icon: (
        <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Qarzdorligi bor shartnomalar",
      count: data.debt.count,
      amount: data.debt.summa,
      borderColor: "border-l-rose-500",
      onDetail: () => onDetail("debt"),
      icon: (
        <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[10px]">
      {cards.map((card, i) => (
        <KpiCard key={i} {...card} />
      ))}
    </div>
  );
}
