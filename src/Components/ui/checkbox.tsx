import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { tt } from "@/utils";

interface Props {
  label?: string;
  checked: boolean;
  handleChange: () => void;
  deleted?: boolean;
}

/**
 * Belgilash katakchasi — dizayn tokenlariga o'tkazildi.
 *
 * Ilgari ranglar qotirilgan edi (`#3a7eae`, `#ff3d3d`, `#323232`) va
 * qorong'i rejimda chegara deyarli ko'rinmasdi. O'lchov ham nomutanosib
 * edi: 22×20px. Endi kvadrat va mavzuga moslashadi.
 */
export const Checkbox = ({ label, checked, handleChange, deleted }: Props) => {
  return (
    <button
      type="button"
      onClick={() => handleChange()}
      aria-pressed={checked}
      className="flex items-center gap-3 text-left"
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? deleted
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "border-primary bg-primary text-primary-foreground"
            : "border-input bg-card"
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>

      <p className="text-sm font-normal text-foreground">
        {label ? label : ""}{" "}
        {deleted && tt("Hozirda mavjud emas", "В настоящее время недоступен")}
      </p>
    </button>
  );
};
