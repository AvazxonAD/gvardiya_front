import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string | number;
  label: string;
};

export type SelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  options: SelectOption[];
  /** Bo'sh qiymat uchun band — masalan "Barchasi" */
  placeholder?: string;
  selectSize?: "sm" | "md";
};

/**
 * Native `<select>` ustidagi ingichka qatlam.
 *
 * Loyihadagi qo'lda yozilgan ochiluvchi ro'yxatlar klaviatura bilan
 * boshqarilmasdi va tashqariga bosilganda yopilmasdi. Native element
 * bularning barchasini bepul beradi; `color-scheme` tokeni tufayli
 * ochiladigan ro'yxat ham mavzuga mos keladi.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, options, placeholder, selectSize = "md", ...props },
  ref
) {
  return (
    <div className="relative inline-flex w-full">
      <select
        ref={ref}
        data-slot="select"
        className={cn(
          "w-full min-w-0 appearance-none rounded-md border border-input bg-card text-foreground",
          "pr-8 shadow-xs outline-none transition-[border-color,box-shadow] duration-150",
          "hover:border-muted-foreground/40",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
          "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50",
          selectSize === "sm" ? "h-8 pl-2.5 text-[13px]" : "h-9 pl-3 text-sm",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
});

export { Select };
