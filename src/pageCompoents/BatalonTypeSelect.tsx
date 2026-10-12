import { cn } from "@/lib/utils";
import { tt } from "@/utils";
import { BATALON_TYPES, batalonTypeLabel, type BatalonType } from "@/lib/batalonType";

type Props = {
  value?: string | null;
  onChange: (value: BatalonType) => void;
};

/** Quyi tuzilma tegishliligi: Batalon / MG harbiy qismi / IIV / FVV */
const BatalonTypeSelect = ({ value, onChange }: Props) => {
  // Eski yozuvlarda qiymat bo'lmasa — standart "batalon"
  const current = BATALON_TYPES.includes(value as BatalonType) ? value : "batalon";

  return (
    <div
      role="radiogroup"
      className="inline-flex h-[2.3125rem] w-fit items-center gap-0.5 rounded-none border border-border bg-background px-1"
    >
      {BATALON_TYPES.map((type) => (
        <button
          key={type}
          type="button" // forma yuborilmasin
          role="radio"
          aria-checked={current === type}
          onClick={() => onChange(type)}
          className={cn(
            "h-[1.8125rem] whitespace-nowrap rounded-none px-3 text-[0.75rem] font-[600] leading-[0.9075rem] transition-colors",
            current === type
              ? "bg-card text-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {batalonTypeLabel(type)}
        </button>
      ))}
    </div>
  );
};

/** Batalon formasidagi "Tegishliligi" maydoni: sarlavha, tanlov va izoh */
export const BatalonTypeField = ({ value, onChange }: Props) => (
  <div className="mt-3 flex flex-col gap-2">
    <span className="text-[0.75rem] font-[600] leading-[0.9075rem] text-muted-foreground">
      {tt("Tegishliligi", "Принадлежность")}
    </span>
    <BatalonTypeSelect value={value} onChange={onChange} />
    <span className="text-[0.6875rem] leading-snug text-muted-foreground">
      {tt(
        "Ommaviy tadbirlar hisobotida pullar shu bo'yicha idoralarga ajratiladi",
        "По этому признаку средства распределяются по ведомствам в отчёте по массовым мероприятиям"
      )}
    </span>
  </div>
);

export default BatalonTypeSelect;
