import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { textNum, tt } from "@/utils";

/**
 * Maxfiy raqam (karta, hisob raqam, PINFL) — parol kabi yashirin,
 * ko'z tugmasi bosilsa ko'rinadi. Bazada shifrlangan holda saqlanadi
 * (backend: helper/secure.field.js), bu yerda faqat ekranda yashiriladi.
 */
export default function SecretText({
  value,
  group = 4,
  className,
}: {
  value?: string | number | null;
  /** Raqamlarni guruhlash (4 -> "5614 6814 ...") ; 0 — guruhlamaslik */
  group?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(false);
  const raw = value == null ? "" : String(value);

  if (!raw) return <span className="text-muted-foreground">—</span>;

  const text = group ? textNum(raw, group).trim() : raw;
  // Uzunligi bir xil nuqtalar — raqam soni ham bilinmasin desak ham,
  // ustun kengligi sakramasligi uchun asl uzunlik saqlanadi
  const masked = text.replace(/[^\s]/g, "•");

  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap", className)}>
      <span className="tabular-nums">{shown ? text : masked}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShown((v) => !v);
        }}
        title={shown ? tt("Yashirish", "Скрыть") : tt("Ko'rsatish", "Показать")}
        aria-label={shown ? tt("Yashirish", "Скрыть") : tt("Ko'rsatish", "Показать")}
        className="inline-flex size-[1.375rem] shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {shown ? <EyeOff className="size-[0.875rem]" /> : <Eye className="size-[0.875rem]" />}
      </button>
    </span>
  );
}
