import { Check, Circle, X } from "lucide-react";
import Input from "@/Components/Input";
import { cn } from "@/lib/utils";
import {
  PASSWORD_MAX,
  checkPassword,
  type PasswordContext,
} from "@/lib/passwordPolicy";

/**
 * Parol shartlari ro'yxati — har bir belgi yozilganda qayta tekshiriladi.
 * `showErrors` (forma yuborilgan yoki maydondan chiqilgan) bo'lsa,
 * bajarilmagan shartlar qizil bo'ladi, aks holda kulrang.
 */
export function PasswordChecklist({
  value,
  login,
  oldPassword,
  showErrors,
  className,
}: PasswordContext & {
  value: string;
  showErrors?: boolean;
  className?: string;
}) {
  const checks = checkPassword(value, { login, oldPassword });

  return (
    <ul
      data-slot="password-checklist"
      className={cn(
        "grid grid-cols-1 gap-x-3 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 sm:grid-cols-2",
        className
      )}
    >
      {checks.map((c) => {
        const failed = !c.ok && showErrors;
        return (
          <li
            key={c.id}
            data-ok={c.ok}
            className={cn(
              "flex items-start gap-1.5 text-xs leading-4 transition-colors",
              c.ok
                ? "text-success"
                : failed
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            <span className="mt-px flex size-3.5 shrink-0 items-center justify-center [&_svg]:size-3.5">
              {c.ok ? (
                <Check strokeWidth={3} />
              ) : failed ? (
                <X strokeWidth={3} />
              ) : (
                <Circle className="!size-2.5" />
              )}
            </span>
            <span>{c.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Formik formalaridagi parol maydoni + jonli shartlar ro'yxati.
 *
 * Xato matni faqat maydon bo'sh bo'lganda chiqadi — to'ldirilgan bo'lsa
 * nimasi yetmayotgani ro'yxatda qizil bilan ko'rinadi.
 * `optional` — tahrirlash: bo'sh maydon "parol o'zgarmaydi" degani, shuning
 * uchun ro'yxat faqat nimadir yozilganda chiqadi.
 */
export default function PasswordField({
  n = "password",
  label,
  v,
  change,
  blur,
  touched,
  error,
  login,
  optional,
  p,
  className,
}: {
  n?: string;
  label: React.ReactNode;
  v: string;
  change: (e: React.ChangeEvent<HTMLInputElement>) => void;
  blur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  touched?: boolean;
  error?: string;
  login?: string;
  optional?: boolean;
  p?: string;
  className?: string;
}) {
  const showErrors = Boolean(touched && error);

  return (
    <div className="flex w-full flex-col gap-2">
      <Input
        n={n}
        t="password"
        label={label}
        v={v}
        change={change}
        blur={blur}
        // Brauzer saqlangan parolni o'zi to'ldirib qo'ymasin
        autoComplete="new-password"
        maxLength={PASSWORD_MAX}
        p={p}
        error={showErrors && !v ? error : undefined}
        aria-invalid={showErrors || undefined}
        className={className}
      />
      {!(optional && !v) && (
        <PasswordChecklist value={v} login={login} showErrors={showErrors} />
      )}
    </div>
  );
}
