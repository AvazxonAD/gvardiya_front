import * as Yup from "yup";
import { tt } from "@/utils";

/**
 * Parol qo'yish tartibi — foydalanuvchi qo'shish, parolni tiklash va o'z
 * parolini o'zgartirishda. Kirish sahifasida tekshirilmaydi: eski, oddiy
 * parolli foydalanuvchilar avvalgidek kiraveradi.
 *
 * Xuddi shu qoidalar backend/src/utils/passwordPolicy.js da ham bor —
 * birini o'zgartirsangiz, ikkinchisini ham o'zgartiring. Aks holda ekranda
 * hamma shart bajarilgan ko'rinib, server parolni rad etadi.
 */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 100;

// Parolda login bo'lmasligi shu uzunlikdan boshlab tekshiriladi
const LOGIN_CHECK_MIN = 3;

export type PasswordContext = {
  login?: string;
  /** Faqat o'z parolini o'zgartirishda — yangisi eskisidan farq qilsin */
  oldPassword?: string;
};

type Rule = {
  id: string;
  label: () => string;
  test: (pw: string, ctx: PasswordContext) => boolean;
  /** Faqat shu kontekstda ko'rsatiladi */
  when?: (ctx: PasswordContext) => boolean;
};

const RULES: Rule[] = [
  {
    id: "length",
    label: () =>
      tt(`Kamida ${PASSWORD_MIN} ta belgi`, `Не менее ${PASSWORD_MIN} символов`),
    test: (pw) => pw.length >= PASSWORD_MIN,
  },
  {
    id: "upper",
    label: () => tt("Katta harf (A-Z)", "Заглавная буква (A-Z)"),
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    id: "lower",
    label: () => tt("Kichik harf (a-z)", "Строчная буква (a-z)"),
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    id: "digit",
    label: () => tt("Raqam (0-9)", "Цифра (0-9)"),
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    id: "special",
    label: () => tt("Maxsus belgi (!@#$%&*)", "Спецсимвол (!@#$%&*)"),
    test: (pw) => /[!-/:-@[-`{-~]/.test(pw),
  },
  {
    // Kirill harfi yoki bo'sh joy: boshqa klaviatura tartibida kirib
    // bo'lmay qoladi
    id: "charset",
    label: () =>
      tt("Kirill harfi va bo'sh joy yo'q", "Без кириллицы и пробелов"),
    test: (pw) => /^[\x21-\x7E]*$/.test(pw),
  },
  {
    id: "login",
    label: () => tt("Loginni o'z ichiga olmaydi", "Не содержит логин"),
    test: (pw, { login }) => {
      const l = String(login ?? "").trim().toLowerCase();
      return l.length < LOGIN_CHECK_MIN || !pw.toLowerCase().includes(l);
    },
  },
  {
    id: "old",
    label: () => tt("Eski paroldan farq qiladi", "Отличается от старого"),
    test: (pw, { oldPassword }) => !oldPassword || pw.trim() !== oldPassword.trim(),
    when: (ctx) => ctx.oldPassword !== undefined,
  },
];

export type PasswordCheck = { id: string; label: string; ok: boolean };

/** Har bir shart: bajarildimi */
export const checkPassword = (
  password: string,
  ctx: PasswordContext = {}
): PasswordCheck[] => {
  const pw = String(password ?? "");
  return RULES.filter((r) => !r.when || r.when(ctx)).map((r) => ({
    id: r.id,
    label: r.label(),
    // Bo'sh parolda "kirill yo'q", "login yo'q" kabilar ham yashil
    // ko'rinmasin — hali hech narsa bajarilmagan
    ok: pw.length > 0 && r.test(pw, ctx),
  }));
};

/** Birinchi bajarilmagan shart yoki null */
export const passwordProblem = (password: string, ctx: PasswordContext = {}) =>
  checkPassword(password, ctx).find((c) => !c.ok)?.label ?? null;

/**
 * Formik uchun Yup sxemasi. Login shu formaning `login` maydonidan olinadi.
 * `optional` — tahrirlash: bo'sh qoldirilsa parol o'zgarmaydi.
 */
export const passwordYup = ({ optional = false } = {}) => {
  const schema = Yup.string()
    .max(
      PASSWORD_MAX,
      tt(
        `Parol ko'pi bilan ${PASSWORD_MAX} ta belgi bo'lishi kerak`,
        `Пароль не длиннее ${PASSWORD_MAX} символов`
      )
    )
    .test("password-policy", "", function (value) {
      if (!value) return true;
      const problem = passwordProblem(value, { login: this.parent?.login });
      return problem
        ? this.createError({
            message: tt(
              `Parol talabga javob bermaydi: ${problem}`,
              `Пароль не соответствует требованиям: ${problem}`
            ),
          })
        : true;
    });
  return optional
    ? schema
    : schema.required(tt("Parolni kiriting", "Введите пароль"));
};
