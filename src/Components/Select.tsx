/** @format */

import { useEffect, useId, useState } from "react";

import { cn, pxToRem } from "@/lib/utils";
import {
  SelectContent,
  SelectEmpty,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  selectItemKey,
} from "@/ui/select";
import { formatNum, tt } from "../utils";

/**
 * Loyihaning eski tanlagichi — endi `@/ui/select` qismlaridan yig'iladi,
 * shuning uchun ko'rinishi va klaviatura boshqaruvi loyihadagi boshqa
 * tanlagichlar bilan bir xil.
 *
 * Props interfeysi o'zgarmadi: `data` ([{ id, name }]), `value` — tanlangan
 * `id`, `onChange(id)` — `id` asl turida (son yoki satr) qaytadi.
 * `up` — ro'yxat tepaga ochiladi (joy bo'lmasa o'zi pastga o'tadi).
 * `w` — kenglik px da, `rem` ga o'tkaziladi (katta monitorda kattalashsin).
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
  const labelId = useId();

  useEffect(() => {
    if (setOpenProps) setOpenProps?.(isOpen);
  }, [isOpen]);

  const options: any[] = Array.isArray(data) ? data : [];
  const items = def ? [{ id: 0, name: tt("Hammasi", "Все") }, ...options] : options;
  const selectedOption = items.find((item: any) => item.id === value);
  const optionText = (item: any) =>
    item?.name || formatNum(item?.bxm_07 ?? 0, true);

  // Radix qiymatni satr sifatida beradi — asl `id` shu jadvaldan olinadi
  const byKey = new Map(items.map((item: any) => [selectItemKey(item.id), item]));

  const invalid = Boolean(error && !value);

  return (
    <div
      style={{ width: w ? pxToRem(Number(w)) : undefined }}
      className={cn("relative", !w && "w-[18.75rem]", className)}
    >
      <div className="flex flex-col gap-1.5">
        {label && (
          <span
            id={labelId}
            className={cn(
              "text-[0.8125rem] font-medium leading-none",
              invalid ? "text-destructive" : "text-foreground"
            )}
          >
            {label}
          </span>
        )}

        <SelectRoot
          open={isOpen}
          onOpenChange={setIsOpen}
          value={selectedOption ? selectItemKey(selectedOption.id) : ""}
          onValueChange={(key) => {
            const item = byKey.get(key);
            if (item) onChange(item.id);
          }}
        >
          <SelectTrigger
            aria-labelledby={label ? labelId : undefined}
            aria-invalid={invalid || undefined}
            title={selectedOption ? String(optionText(selectedOption)) : undefined}
          >
            <SelectValue placeholder={p}>
              {selectedOption ? optionText(selectedOption) : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent side={up ? "top" : "bottom"} className="text-sm">
            {items.map((item: any) => (
              <SelectItem key={selectItemKey(item.id)} value={selectItemKey(item.id)}>
                {optionText(item)}
              </SelectItem>
            ))}
            {!items.length && <SelectEmpty />}
          </SelectContent>
        </SelectRoot>
      </div>

      {invalid ? (
        <span className="mt-1.5 block text-[0.75rem] font-medium leading-tight text-destructive">
          {error}
        </span>
      ) : null}
    </div>
  );
};

export default Select;
