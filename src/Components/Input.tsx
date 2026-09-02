/** @format */

import { Search, X } from "lucide-react";
import { Field, Input as UIInput } from "@/ui";

/**
 * Eski input — endi dizayn tizimidagi `@/ui` Input ustidagi moslashtiruvchi.
 *
 * Props nomlari ataylab o'zgarmadi (`p`, `t`, `v`, `n`, `change`, `tush` …):
 * o'nlab sahifa shu qisqartmalar bilan chaqiradi. Ilgari bu komponent o'z
 * uslubini yozardi va natijada `@/ui` Input dan farq qilardi — balandligi
 * 40px (yangisi 36px), foni `bg-background` (yangisi `bg-card`). Bir
 * sahifada ikkalasi uchraganda maydonlar bir tekis turmasdi. Endi ichkarida
 * bitta komponent ishlaydi, shuning uchun farq yo'q.
 */
function Input({
  label,
  error,
  p,
  t,
  v,
  change,
  search,
  n,
  blur,
  disabled,
  className,
  defaultValue,
  tush,
  onDoubleClick,
  readonly,
  removeValue,
  // Qolgan proplar inputga o'tkaziladi — masalan `autoComplete`,
  // `maxLength`, `inputMode`. Ilgari ular yo'qolib ketardi.
  ...rest
}: any) {
  const showClear = removeValue && v && String(v).length > 0;

  // React `value={undefined}` ni boshqarilmagan input deb qabul qiladi va
  // keyin qiymat kelganda "uncontrolled -> controlled" ogohlantirishini
  // beradi. `defaultValue` ishlatilmayotgan bo'lsa bo'sh matnga tushiramiz.
  // NaN esa inputga umuman yozilmasligi kerak.
  const value =
    defaultValue !== undefined
      ? v
      : typeof v === "number" && Number.isNaN(v)
      ? ""
      : v ?? "";

  const field = (
    <UIInput
      defaultValue={defaultValue}
      value={value}
      name={n}
      type={t ? t : "text"}
      onChange={(e) => change?.(e)}
      onBlur={blur}
      placeholder={p}
      disabled={disabled}
      onDoubleClick={onDoubleClick}
      readOnly={readonly}
      aria-invalid={error ? true : undefined}
      startIcon={search ? <Search /> : undefined}
      endIcon={
        showClear ? (
          <button
            type="button"
            onClick={removeValue}
            aria-label="Tozalash"
            className="rounded p-0.5 transition-colors hover:text-foreground"
          >
            <X />
          </button>
        ) : undefined
      }
      {...rest}
      className={[
        tush ? "w-[320px]" : "",
        readonly ? "read-only:bg-muted/50" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );

  // Yorliq yoki xato bo'lmasa ortiqcha o'ram qo'shmaymiz — ba'zi
  // chaqiruvlar inputni to'g'ridan-to'g'ri grid katagiga joylaydi.
  if (!label && !error) return field;

  return (
    <Field label={label} error={error}>
      {field}
    </Field>
  );
}

export default Input;
