import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { tt } from "@/utils";
import { loginAuth, loginEimzoAuth } from "@/api";
import { putJwt, setUserData } from "@/Redux/apiSlice";
import { alertt } from "@/Redux/LanguageSlice";
import {
  EimzoCertificate,
  listCertificatesWithBridge,
  signWithBridge,
} from "@/lib/eimzo";
import {
  Badge,
  Button,
  Field,
  Input,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  useTheme,
} from "@/ui";
import { getHomePathForUser } from "@/layout/menu";
import { AppFullName, appFullName } from "@/lib/appName";
import Logo from "@/assets/logo.png";

/** Login 2-bosqichi (E-IMZO) — 1-bosqich javobidan keladi */
interface EimzoStep {
  login_token: string;
  challenge: string;
  bridge: string;
  /** Sinov rejimi: backend EIMZO_LOGIN=off — imzo va USB Manager kerak emas */
  disabled: boolean;
}

const LANGUAGES = [
  { id: "0", label: "O'zbek" },
  { id: "1", label: "Ўзбек" },
  { id: "2", label: "Русский" },
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── E-IMZO bosqichi ────────────────────────────────────────────
  const [eimzo, setEimzo] = useState<EimzoStep | null>(null);
  const [certs, setCerts] = useState<EimzoCertificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<EimzoCertificate | null>(null);
  const [certsLoading, setCertsLoading] = useState(false);
  const [signing, setSigning] = useState(false);

  const finishLogin = (res: any) => {
    dispatch(setUserData(res.data));
    dispatch(alertt({ text: res.message, success: true }));
    navigate(getHomePathForUser(res?.data?.user));
    dispatch(putJwt(res.data.token));
  };

  const loadCertificates = async (bridge: string) => {
    setError("");
    setCertsLoading(true);
    setCerts([]);
    setSelectedCert(null);

    try {
      const list = await listCertificatesWithBridge(bridge);
      if (!list?.length) {
        setError(tt("E-IMZO kaliti topilmadi", "Ключ E-IMZO не найден"));
        return;
      }
      setCerts(list);
      // Bitta kalit bo'lsa avtomatik tanlanadi
      const usable = list.filter((c) => !c.expired);
      if (usable.length === 1) setSelectedCert(usable[0]);
    } catch (e: any) {
      setError(e?.message || tt("Xatolik yuz berdi", "Произошла ошибка"));
    } finally {
      setCertsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError("");

    if (!form.login.trim() || !form.password) {
      setError(tt("Login va parolni kiriting", "Введите логин и пароль"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginAuth(form.login, form.password);

      if (!res.success) {
        setError(
          res?.error ||
            res?.message ||
            tt("Login yoki parol noto'g'ri", "Неверный логин или пароль")
        );
        return;
      }

      // 2-bosqich: parol to'g'ri, endi E-IMZO bilan tasdiqlash kerak
      if (res.data?.requires_eimzo) {
        const step: EimzoStep = {
          login_token: res.data.login_token,
          challenge: res.data.challenge,
          bridge: res.data.eimzo_bridge?.token || "",
          disabled: Boolean(res.data.eimzo_disabled),
        };
        setEimzo(step);
        // Sinov rejimida kalit ham, USB Manager ham so'ralmaydi
        if (!step.disabled) loadCertificates(step.bridge);
        return;
      }

      finishLogin(res);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmEimzo = async () => {
    if (!eimzo || signing) return;
    if (!eimzo.disabled && !selectedCert) return;
    setError("");
    setSigning(true);

    try {
      // Sinov rejimida imzo yaratilmaydi — login_token'ning o'zi yetarli
      let pkcs7 = "";
      if (!eimzo.disabled) {
        const content64 = btoa(eimzo.challenge);
        const sig = await signWithBridge(eimzo.bridge, content64, selectedCert!);
        pkcs7 = sig.pkcs7_64;
      }
      const res = await loginEimzoAuth(eimzo.login_token, pkcs7);

      if (res.success) {
        finishLogin(res);
      } else {
        setError(
          res?.error || res?.message || tt("Xatolik yuz berdi", "Произошла ошибка")
        );
      }
    } catch (e: any) {
      const msg = String(e?.message || e).toLowerCase();
      if (msg.includes("password") || msg.includes("padding")) {
        setError(
          tt(
            "Kalit paroli noto'g'ri. Qaytadan urinib ko'ring.",
            "Неверный пароль ключа. Попробуйте снова."
          )
        );
      } else if (msg.includes("cancel")) {
        setError(tt("Bekor qilindi", "Отменено"));
      } else {
        setError(e?.message || tt("Xatolik yuz berdi", "Произошла ошибка"));
      }
    } finally {
      setSigning(false);
    }
  };

  const cancelEimzo = () => {
    setEimzo(null);
    setCerts([]);
    setSelectedCert(null);
    setError("");
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[auto_minmax(22rem,1fr)]">
      <LoginHero />

      {/* Forma paneli — `bg-card` qorong'i banner yonida toza "qog'oz"
          effektini beradi va ikkala mavzuda ham ajralib turadi */}
      <main className="relative flex min-h-screen flex-col bg-card lg:border-l lg:border-border">
        <div className="flex items-center gap-2 px-5 pt-5 sm:px-8">
          {/* lg dan boshlab brend chap panelda ko'rinadi */}
          <div className="flex items-center gap-2 lg:hidden">
            <img src={Logo} alt="" className="size-7 rounded-md object-contain" />
            <span className="text-[0.75rem] leading-snug text-muted-foreground">
              <AppFullName />
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <LanguageMenu />
            <ThemeButton />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[23.75rem]">
            {eimzo ? (
              <EimzoStepView
                disabled={eimzo.disabled}
                certs={certs}
                selected={selectedCert}
                onSelect={setSelectedCert}
                loading={certsLoading}
                signing={signing}
                error={error}
                onRetry={() => loadCertificates(eimzo.bridge)}
                onConfirm={confirmEimzo}
                onCancel={cancelEimzo}
              />
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h1 className="text-[1.375rem] font-semibold tracking-tight text-foreground">
                  {tt("Tizimga kirish", "Вход в систему")}
                </h1>
                <p className="mt-1.5 text-[0.8125rem] text-muted-foreground">
                  {tt(
                    "Davom etish uchun hisob ma'lumotlaringizni kiriting",
                    "Введите данные учётной записи для входа"
                  )}
                </p>

                <div className="mt-7 flex flex-col gap-4">
                  {error && <ErrorNote>{error}</ErrorNote>}

                  <Field label={tt("Login", "Логин")}>
                    <Input
                      name="login"
                      value={form.login}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, login: e.target.value }))
                      }
                      placeholder={tt("Login kiriting", "Введите логин")}
                      autoComplete="username"
                      autoFocus
                      inputSize="lg"
                      startIcon={<User />}
                    />
                  </Field>

                  <Field label={tt("Parol", "Пароль")}>
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      placeholder={tt("Parol kiriting", "Введите пароль")}
                      autoComplete="current-password"
                      inputSize="lg"
                      startIcon={<Lock />}
                      endIcon={
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword
                              ? tt("Parolni yashirish", "Скрыть пароль")
                              : tt("Parolni ko'rsatish", "Показать пароль")
                          }
                          className="rounded p-0.5 transition-colors hover:text-foreground"
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      }
                    />
                  </Field>

                  <Button
                    type="submit"
                    size="lg"
                    className="mt-1 w-full"
                    loading={submitting}
                  >
                    {submitting
                      ? tt("Tekshirilmoqda...", "Проверка...")
                      : tt("Kirish", "Войти")}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="px-5 pb-5 text-center text-[0.6875rem] text-muted-foreground sm:px-8">
          © {new Date().getFullYear()} {appFullName()}
        </p>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Chap panel — brend
   ═══════════════════════════════════════════════════════════════════ */

function LoginHero() {
  // Banner rasmi — sarlavha, logo va afzalliklar rasmning o'zida. Panel
  // kengligi rasm nisbatida (balandlik × 1672/940), shuning uchun rasm
  // to'liq sig'adi. Tor ekranda login ustuniga 22rem qoladi va rasm
  // o'ngdan kesiladi — matn chapda, shu sabab chap chetga yopishtirilgan.
  return (
    <aside className="relative hidden h-screen max-w-[calc(100vw-22rem)] overflow-hidden bg-slate-950 lg:sticky lg:top-0 lg:block lg:aspect-[1672/940]">
      <img
        src="/login-banner.jpg?v=3"
        alt={appFullName()}
        className="absolute inset-0 size-full object-cover object-left"
      />
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   E-IMZO bosqichi
   ═══════════════════════════════════════════════════════════════════ */

function EimzoStepView({
  disabled,
  certs,
  selected,
  onSelect,
  loading,
  signing,
  error,
  onRetry,
  onConfirm,
  onCancel,
}: {
  disabled: boolean;
  certs: EimzoCertificate[];
  selected: EimzoCertificate | null;
  onSelect: (c: EimzoCertificate) => void;
  loading: boolean;
  signing: boolean;
  error: string;
  onRetry: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onCancel}
        disabled={signing}
        className="mb-5 inline-flex items-center gap-1 text-[0.8125rem] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        <ChevronLeft className="size-4" />
        {tt("Orqaga", "Назад")}
      </button>

      <div className="mb-1.5 flex items-center gap-2">
        <ShieldCheck className="size-5 text-primary" />
        <h1 className="text-[1.1875rem] font-semibold tracking-tight text-foreground">
          {tt("E-IMZO bilan tasdiqlash", "Подтверждение E-IMZO")}
        </h1>
      </div>
      <p className="text-[0.8125rem] text-muted-foreground">
        {disabled
          ? tt(
              "Sinov rejimi — imzo talab qilinmaydi",
              "Тестовый режим — подпись не требуется"
            )
          : certs.length > 1
          ? tt(
              "Bir nechta kalit topildi — birini tanlang",
              "Найдено несколько ключей — выберите один"
            )
          : tt(
              "Kirishni elektron raqamli imzo bilan tasdiqlang",
              "Подтвердите вход электронной цифровой подписью"
            )}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <ErrorNote
            action={
              <button
                type="button"
                onClick={onRetry}
                className="font-semibold underline underline-offset-2"
              >
                {tt("Qayta urinish", "Повторить")}
              </button>
            }
          >
            {error}
          </ErrorNote>
        )}

        {disabled ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-[0.8125rem] text-amber-700 dark:text-amber-400">
            <AlertCircle className="mt-px size-4 shrink-0" />
            <p>
              {tt(
                "Test uchun E-IMZO o'chirilib turibdi. \"Kirish\" tugmasini bosing.",
                "E-IMZO временно отключён для тестирования. Нажмите \"Войти\"."
              )}
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3.5 py-3 text-[0.8125rem] text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {tt("Kalitlar qidirilmoqda...", "Поиск ключей...")}
          </div>
        ) : (
          <div className="flex max-h-[17.5rem] flex-col gap-2 overflow-y-auto">
            {certs.map((c) => {
              const active = selected?.alias === c.alias;
              return (
                <button
                  key={c.alias}
                  type="button"
                  disabled={c.expired || signing}
                  onClick={() => onSelect(c)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border px-3.5 py-3 text-left",
                    "transition-[border-color,background-color] duration-150",
                    active
                      ? "border-primary bg-primary/[0.06]"
                      : "border-border hover:border-muted-foreground/40",
                    c.expired && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-none border",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    )}
                    aria-hidden
                  >
                    {active && <Check className="size-2.5" strokeWidth={3.5} />}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8125rem] font-semibold uppercase text-foreground">
                      {c.fio}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] text-muted-foreground">
                      <span>
                        {tt("Amal qiladi", "Действует до")}: {c.validTo}
                      </span>
                      {c.expired && (
                        <Badge tone="danger">
                          {tt("muddati o'tgan", "истёк")}
                        </Badge>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <Button
          size="lg"
          className="w-full"
          onClick={onConfirm}
          disabled={disabled ? false : !selected || loading}
          loading={signing}
        >
          {signing
            ? tt("Kirilmoqda...", "Вход...")
            : disabled
              ? tt("Kirish", "Войти")
              : tt("E-IMZO bilan kirish", "Войти через E-IMZO")}
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Kichik yordamchilar
   ═══════════════════════════════════════════════════════════════════ */

function ErrorNote({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-3 text-[0.8125rem] text-destructive"
    >
      <AlertCircle className="mt-px size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="break-words">{children}</p>
        {action && <div className="mt-1.5">{action}</div>}
      </div>
    </div>
  );
}

function ThemeButton() {
  const { isDark, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={
        isDark ? tt("Yorug' rejim", "Светлая тема") : tt("Tungi rejim", "Тёмная тема")
      }
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}

function LanguageMenu() {
  const current = localStorage.getItem("lang") ?? "0";
  return (
    <Menu>
      <MenuTrigger
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[0.8125rem] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label={tt("Til", "Язык")}
      >
        <Globe className="size-4" />
        {LANGUAGES.find((l) => l.id === current)?.label}
      </MenuTrigger>
      <MenuContent className="min-w-[10rem]">
        {LANGUAGES.map((l) => (
          <MenuItem
            key={l.id}
            onClick={() => {
              localStorage.setItem("lang", l.id);
              location.reload();
            }}
          >
            <span className="flex-1">{l.label}</span>
            {current === l.id && <Check className="text-primary" />}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
