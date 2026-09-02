/** @format */

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNum, tt } from "../utils";

/**
 * Loyihaning eski tanlagichi — yangi dizayn tokenlariga o'tkazildi.
 *
 * Props interfeysi o'zgarmadi. Ko'rinishdan tashqari ikkita xatti-harakat
 * tuzatildi:
 *  1. Tashqariga bosilganda yoki Escape bosilganda ro'yxat yopiladi —
 *     ilgari faqat qayta bosish yoki tanlash yopardi.
 *  2. `w` kengligi ilgari `w-[${w}px]` sinfi orqali berilardi; Tailwind
 *     bunday dinamik sinfni ishlab chiqmaydi, shuning uchun u hech qachon
 *     qo'llanmagan. Endi inline uslub bilan haqiqatan ishlaydi.
 */
const Select = ({
  value,
  def,
  data,
  onChange,
  label,
  p,
  error,
  up,
  w,
  className,
  setOpenProps,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: any) => {
    onChange(id);
    setIsOpen(false);
  };

  useEffect(() => {
    if (setOpenProps) setOpenProps?.(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const options: any[] = Array.isArray(data) ? data : [];
  const selectedOption = options.find((item: any) => item.id === value);
  const optionText = (item: any) =>
    item?.name || formatNum(item?.bxm_07 ?? 0, true);

  const invalid = Boolean(error && !value);

  return (
    <div
      ref={boxRef}
      style={{ width: w ? `${w}px` : undefined }}
      className={cn("relative", !w && "w-[300px]", className)}
    >
      <div className="flex flex-col gap-1.5">
        {label && (
          <span
            className={cn(
              "text-[13px] font-medium leading-none",
              invalid ? "text-destructive" : "text-foreground"
            )}
          >
            {label}
          </span>
        )}

        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((o) => !o)}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-card px-3",
            "text-left text-sm text-foreground shadow-xs",
            "transition-[border-color,box-shadow] duration-150 hover:border-muted-foreground/40",
            "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
            invalid
              ? "border-destructive focus-visible:ring-destructive/25"
              : "border-input"
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            {selectedOption ? (
              optionText(selectedOption)
            ) : (
              <span className="text-muted-foreground/70">{p}</span>
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </div>

      {isOpen && (
        <ul
          role="listbox"
          className={cn(
            "absolute z-50 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-[13px] shadow-lg",
            "max-h-60 animate-fade-in",
            up ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          {def && (
            <Option
              active={value === 0}
              onClick={() => handleSelect(0)}
              text={tt("Hammasi", "Все")}
            />
          )}

          {options.map((item: any) => (
            <Option
              key={item.id}
              active={value === item.id}
              onClick={() => handleSelect(item.id)}
              text={optionText(item)}
            />
          ))}
        </ul>
      )}

      {invalid ? (
        <span className="mt-1.5 block text-[12px] font-medium leading-tight text-destructive">
          {error}
        </span>
      ) : null}
    </div>
  );
};

function Option({
  active,
  onClick,
  text,
}: {
  active: boolean;
  onClick: () => void;
  text: React.ReactNode;
}) {
  return (
    <li
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-none px-2.5 py-1.5",
        "transition-colors hover:bg-accent hover:text-accent-foreground",
        active ? "bg-accent font-medium text-accent-foreground" : "text-popover-foreground"
      )}
    >
      <span className="min-w-0 flex-1 truncate">{text}</span>
      {active && <Check className="size-3.5 shrink-0 text-primary" />}
    </li>
  );
}

export default Select;
