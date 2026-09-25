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
function Input(props: any) {
  const {
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
  } = props;

  const showClear = removeValue && v && String(v).length > 0;

  /**
   * Boshqariladigan (controlled) bo'lish-bo'lmaslikni CHAQIRUVCHI hal qiladi.
   *
   * Ilgari bu yerda qiymat shartsiz `v ?? ""` ga tushirilardi. Natijada
   * `v` bermagan chaqiruvlar — masalan
   *     <Input change={onChange} search p="Izlash..." />
   * (prixod/rasxod tanlash modallaridagi qidiruv) — doimo `value=""` bilan
   * boshqariladigan inputga aylanardi. Ota-komponent qiymatni hech qachon
   * qaytarmagani uchun yozilgan matn ekranga chiqmasdi: qidiruv butunlay
   * ishlamay qolgandi.
   *
   * Endi `v` berilmagan bo'lsa `value` umuman uzatilmaydi va input o'z
   * holicha ishlaydi; `change` esa avvalgidek chaqiriladi.
   */
  const controlled = "v" in props;

  // Boshqariladigan holatda `undefined` bo'lmasin — aks holda React
  // "uncontrolled -> controlled" ogohlantirishini beradi. NaN esa
  // inputga umuman yozilmasligi kerak.
  const value =
    defaultValue !== undefined
      ? v
      : typeof v === "number" && Number.isNaN(v)
      ? ""
      : v ?? "";

  const field = (
    <UIInput
      defaultValue={defaultValue}
      value={controlled ? value : undefined}
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
        tush ? "w-[20rem]" : "",
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
