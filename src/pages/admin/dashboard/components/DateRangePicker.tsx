interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export default function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <label className="text-[12px] text-[var(--dash-text-secondary)] font-medium">Dan:</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          className="bg-[var(--dash-glass-bg)] border border-[var(--dash-glass-border)] rounded-lg text-[var(--dash-text)] px-3 py-1.5 text-[13px] font-medium outline-none focus:border-blue-500 transition"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[12px] text-[var(--dash-text-secondary)] font-medium">Gacha:</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onChange(from, e.target.value)}
          className="bg-[var(--dash-glass-bg)] border border-[var(--dash-glass-border)] rounded-lg text-[var(--dash-text)] px-3 py-1.5 text-[13px] font-medium outline-none focus:border-blue-500 transition"
        />
      </div>
    </div>
  );
}
