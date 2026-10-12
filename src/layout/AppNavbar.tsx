import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarRange,
  Check,
  Globe,
  KeyRound,
  Landmark,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Settings2,
  Sun,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { textNum, tt } from "@/utils";
import { updateAuth } from "@/api";
import { baseUri } from "@/services/api";
import { useRequest } from "@/hooks/useRequest";
import { changeDefaultDate } from "@/Redux/dateSlice";
import { DASHBOARD_DATE_KEY, changeDashboardDate } from "@/Redux/dashboardDateSlice";
import {
  ACCOUNTS_CHANGED,
  changeAccountNumber,
  removeAccountNumber,
} from "@/Redux/accountSlice";
import { clearUserData } from "@/Redux/apiSlice";
import { clearTokens, revokeRefreshToken } from "@/services/tokenManager";
import { RootState } from "@/Redux/store";
import { AccountNumberSelect } from "@/Components/AccountNumberSelect";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
import { PasswordChecklist } from "@/Components/PasswordField";
import { PASSWORD_MAX, passwordProblem } from "@/lib/passwordPolicy";
import {
  Button,
  Field,
  Input,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
  Modal,
  useTheme,
} from "@/ui";
import { getMenuForUser } from "./menu";

const LANGUAGES = [
  { id: "0", label: "O'zbek" },
  { id: "1", label: "Ўзбек" },
  { id: "2", label: "Русский" },
];

type Props = {
  onMenuClick: () => void;
  /** Sahifa o'z tablari/izohini chizadigan joy (`navbarSlot.tsx`) */
  slotRef?: (el: HTMLDivElement | null) => void;
};

export default function AppNavbar({ onMenuClick, slotRef }: Props) {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const request = useRequest();
  const { isDark, toggle } = useTheme();

  const { user, jwt } = useSelector((s: any) => s.auth);
  const account = useSelector((s: any) => s.account);
  const defaultDate = useSelector((s: RootState) => s.defaultDate);
  const dashboardDate = useSelector((s: RootState) => s.dashboardDate);

  // `null` — hali yuklanmagan (bo'sh ro'yxat bilan farqlanadi)
  const [accounts, setAccounts] = useState<any[] | null>(null);
  const [accountModal, setAccountModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const [periodModal, setPeriodModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isRegionUser = Boolean(user?.region_id);
  const lang = localStorage.getItem("lang") ?? "0";

  // ── Sahifa sarlavhasi menyudan olinadi ────────────────────────
  const page = useMemo(() => {
    const items = getMenuForUser(user);
    const match = items
      .filter((i) =>
        i.path === "/"
          ? pathname === "/"
          : pathname === i.path || pathname.startsWith(i.path + "/")
      )
      .sort((a, b) => b.path.length - a.path.length)[0];
    return match ? { title: tt(match.uz, match.ru), path: match.path } : null;
  }, [pathname, user]);

  // ── Hisob raqamlari ───────────────────────────────────────────
  // Kirishda / token yangilanganda, hamda Rekvizitlarda ro'yxat
  // o'zgarganda (`notifyAccountsChanged`) qayta olinadi
  useEffect(() => {
    if (!jwt || jwt === "out" || !isRegionUser) return;

    let cancelled = false;
    const load = async () => {
      try {
        const res = await request.get("/account");
        if (!cancelled && (res?.status === 200 || res?.status === 201)) {
          setAccounts(res.data?.data ?? []);
        }
      } catch (e) {
        console.error("Hisob raqamlarini olishda xatolik:", e);
      }
    };

    load();
    window.addEventListener(ACCOUNTS_CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(ACCOUNTS_CHANGED, load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt, isRegionUser]);

  // Tanlangan hisob ro'yxatdan o'chirilgan bo'lsa — tanlov bekor qilinadi
  // (keyingi effekt tanlash oynasini ochadi); raqami tahrirlangan bo'lsa —
  // yuqori paneldagi raqam yangilanadi
  useEffect(() => {
    const selected = account?.account_number_id;
    if (!accounts || !selected) return;

    const found = accounts.find((a) => String(a.id) === String(selected));
    if (!found) {
      dispatch(removeAccountNumber());
    } else if (found.account_number !== account?.account_number) {
      dispatch(changeAccountNumber({ id: found.id, number: found.account_number }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  // Hisob raqam tanlanmagan bo'lsa — majburiy tanlash oynasi.
  // Tanlaydigan hisob umuman bo'lmasa oyna o'zi ochilmaydi (qo'lda
  // ochilsa, "avval Rekvizitlarda qo'shing" degan yozuv chiqadi).
  const accountCount = accounts?.length ?? 0;
  useEffect(() => {
    if (isRegionUser && accountCount > 0 && !account?.account_number_id) {
      setAccountModal(true);
    }
  }, [isRegionUser, accountCount, account?.account_number_id]);

  const handleLogout = async () => {
    await revokeRefreshToken();
    clearTokens();

    // Tartib muhim — izohi AppSidebar dagi bir xil funksiyada
    dispatch(clearUserData());
    dispatch(removeAccountNumber());

    localStorage.removeItem("account");
    localStorage.removeItem("standartDate");
    localStorage.removeItem("user");
    sessionStorage.removeItem(DASHBOARD_DATE_KEY);

    location.href = "/";
  };

  const changeLanguage = (id: string) => {
    localStorage.setItem("lang", id);
    location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-md sm:px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label={tt("Menyu", "Меню")}
        >
          <MenuIcon />
        </Button>

        {/* Ichki sahifada (masalan, /video-lessons/manual) sarlavha bo'lim
            boshiga qaytaradigan havola bo'ladi */}
        <h1 className="truncate text-sm font-semibold text-foreground">
          {page && pathname !== page.path ? (
            <Link to={page.path} className="transition-colors hover:text-primary">
              {page.title}
            </Link>
          ) : (
            page?.title
          )}
        </h1>

        <div ref={slotRef} className="flex min-w-0 flex-1 items-center gap-3" />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Dashboard davri — faqat asosiy sahifada. O'zining holati bor
              (yil boshidan): boshqa sahifalarning sanasi o'zgarmaydi */}
          {pathname === "/" && (
            <>
              <div className="hidden items-center gap-1.5 md:flex">
                <SpecialDatePicker
                  defaultValue={dashboardDate.startDate}
                  onChange={(iso) =>
                    dispatch(changeDashboardDate({ startDate: iso }))
                  }
                />
                <span className="text-muted-foreground">—</span>
                <SpecialDatePicker
                  defaultValue={dashboardDate.endDate}
                  onChange={(iso) => dispatch(changeDashboardDate({ endDate: iso }))}
                />
              </div>
              {/* Kichik ekranda sanalar sig'maydi — davr oynada tanlanadi */}
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                onClick={() => setPeriodModal(true)}
                aria-label={tt("Dashboard davri", "Период дашборда")}
                title={tt("Dashboard davri", "Период дашборда")}
              >
                <CalendarRange />
              </Button>
            </>
          )}

          {isRegionUser && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDateModal(true)}
                aria-label={tt("Standart sana", "Дата по умолчанию")}
                title={tt("Standart sana", "Дата по умолчанию")}
              >
                <Settings2 />
              </Button>

              {/* Hisob raqam almashtirgich */}
              <button
                onClick={() => setAccountModal(true)}
                className={cn(
                  "hidden items-center gap-2 rounded-md border border-border px-2.5 py-1.5",
                  "text-left transition-colors hover:border-primary/40 hover:bg-accent sm:flex"
                )}
              >
                <Landmark className="size-4 shrink-0 text-muted-foreground" />
                <span className="leading-tight">
                  <span className="block text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                    {tt("Hisob raqam", "Номер счета")}
                  </span>
                  <span className="block text-[0.75rem] font-medium tabular-nums text-foreground">
                    {textNum(account?.account_number, 4) || "—"}
                  </span>
                </span>
              </button>
            </>
          )}

          {/* Til */}
          <Menu>
            <MenuTrigger
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label={tt("Til", "Язык")}
              title={tt("Til", "Язык")}
            >
              <Globe className="size-4" />
            </MenuTrigger>
            <MenuContent className="min-w-[10rem]">
              {LANGUAGES.map((l) => (
                <MenuItem key={l.id} onClick={() => changeLanguage(l.id)}>
                  <span className="flex-1">{l.label}</span>
                  {lang === l.id && <Check className="text-primary" />}
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>

          {/* Mavzu */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            aria-label={
              isDark ? tt("Yorug' rejim", "Светлая тема") : tt("Tungi rejim", "Тёмная тема")
            }
            title={
              isDark ? tt("Yorug' rejim", "Светлая тема") : tt("Tungi rejim", "Тёмная тема")
            }
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>

          {/* Foydalanuvchi */}
          <Menu>
            <MenuTrigger
              className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-accent"
              aria-label={tt("Foydalanuvchi", "Пользователь")}
            >
              <Avatar user={user} error={imageError} onError={setImageError} />
              <span className="hidden max-w-[8.75rem] truncate text-[0.8125rem] font-medium text-foreground xl:block">
                {user?.fio}
              </span>
            </MenuTrigger>
            <MenuContent>
              <MenuLabel>
                <span className="block truncate font-medium text-foreground">
                  {user?.fio || "—"}
                </span>
                <span className="block truncate">{user?.login}</span>
              </MenuLabel>
              <MenuSeparator />
              <MenuItem onClick={() => setProfileModal(true)}>
                <KeyRound />
                {tt("Parolni o'zgartirish", "Сменить пароль")}
              </MenuItem>
              {isRegionUser && (
                <MenuItem onClick={() => setAccountModal(true)}>
                  <Landmark />
                  {tt("Hisob raqam", "Номер счета")}
                </MenuItem>
              )}
              <MenuSeparator />
              <MenuItem tone="danger" onClick={handleLogout}>
                <LogOut />
                {tt("Chiqish", "Выход")}
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </header>

      <AccountNumberSelect
        accountData={accounts ?? []}
        openmodal={accountModal}
        setOpenmodal={setAccountModal}
      />

      <ProfileModal
        open={profileModal}
        onClose={() => setProfileModal(false)}
        jwt={jwt}
      />

      <DateRangeModal
        open={dateModal}
        onClose={() => setDateModal(false)}
        title={tt("Standart sana oralig'i", "Период по умолчанию")}
        description={tt(
          "Ilova ochilganda sahifalarda shu oraliq qo'llanadi. Dashboard bundan mustasno — u yil boshidan ochiladi",
          "Этот период применяется на страницах при открытии приложения. Кроме дашборда — он открывается с начала года"
        )}
        value={defaultDate}
        onSave={(range) => dispatch(changeDefaultDate(range))}
      />

      <DateRangeModal
        open={periodModal}
        onClose={() => setPeriodModal(false)}
        title={tt("Dashboard davri", "Период дашборда")}
        description={tt(
          "Faqat dashboard uchun — boshqa sahifalarning sanasi o'zgarmaydi",
          "Только для дашборда — даты на других страницах не меняются"
        )}
        value={dashboardDate}
        onSave={(range) => dispatch(changeDashboardDate(range))}
      />
    </>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function Avatar({
  user,
  error,
  onError,
}: {
  user: any;
  error: boolean;
  onError: (v: boolean) => void;
}) {
  const initials =
    user?.fio
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p: string) => p[0])
      .join("")
      .toUpperCase() || "?";

  if (user?.image && !error) {
    return (
      <img
        src={baseUri + user.image}
        alt=""
        onError={() => onError(true)}
        className="size-7 shrink-0 rounded-none border border-border object-cover"
      />
    );
  }

  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-none bg-primary/12 text-[0.6875rem] font-semibold text-primary">
      {initials}
    </span>
  );
}

function ProfileModal({
  open,
  onClose,
  jwt,
}: {
  open: boolean;
  onClose: () => void;
  jwt: string;
}) {
  const [form, setForm] = useState({
    login: "",
    oldPassword: "",
    newPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Saqlash bosilgach bajarilmagan shartlar qizil bo'ladi
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setError("");
    }
  }, [open]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);

    if (!form.login || !form.oldPassword || !form.newPassword) {
      setError(tt("Barcha maydonlarni to'ldiring", "Заполните все поля"));
      return;
    }

    const problem = passwordProblem(form.newPassword, {
      login: form.login,
      oldPassword: form.oldPassword,
    });
    if (problem) {
      setError(
        tt(
          `Yangi parol talabga javob bermaydi: ${problem}`,
          `Новый пароль не соответствует требованиям: ${problem}`
        )
      );
      return;
    }

    setSaving(true);
    try {
      const res = await updateAuth(form, jwt);
      if (res.success) {
        location.reload();
      } else {
        setError(res?.message || tt("Xatolik yuz berdi", "Произошла ошибка"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tt("Parolni o'zgartirish", "Смена пароля")}
      description={tt(
        "Yangi parol saqlangach tizimga qayta kirasiz",
        "После сохранения вы войдёте заново"
      )}
      size="sm"
      dismissOnOverlay={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tt("Bekor qilish", "Отмена")}
          </Button>
          <Button form="profile-form" type="submit" loading={saving}>
            {tt("Saqlash", "Сохранить")}
          </Button>
        </>
      }
    >
      <form id="profile-form" onSubmit={submit} className="flex flex-col gap-3.5">
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-[0.8125rem] font-medium text-destructive">
            {error}
          </p>
        )}
        <Field label={tt("Login", "Логин")} required>
          <Input
            value={form.login}
            onChange={set("login")}
            autoComplete="username"
            data-autofocus
          />
        </Field>
        <Field label={tt("Eski parol", "Старый пароль")} required>
          <Input
            type="password"
            value={form.oldPassword}
            onChange={set("oldPassword")}
            autoComplete="current-password"
          />
        </Field>
        <Field label={tt("Yangi parol", "Новый пароль")} required>
          <Input
            type="password"
            value={form.newPassword}
            onChange={set("newPassword")}
            autoComplete="new-password"
            maxLength={PASSWORD_MAX}
          />
        </Field>
        <PasswordChecklist
          value={form.newPassword}
          login={form.login}
          oldPassword={form.oldPassword}
          showErrors={submitted}
          // Oyna tor — ikki ustunda yozuvlar bo'linib ketadi
          className="-mt-1.5 sm:grid-cols-1"
        />
      </form>
    </Modal>
  );
}

type DateRange = { startDate: string; endDate: string };

/** Sana oralig'i oynasi: "Standart sana" va kichik ekranda dashboard davri */
function DateRangeModal({
  open,
  onClose,
  title,
  description,
  value,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  value: DateRange;
  onSave: (range: DateRange) => void;
}) {
  const [range, setRange] = useState({ from: value.startDate, to: value.endDate });

  useEffect(() => {
    if (open) setRange({ from: value.startDate, to: value.endDate });
  }, [open, value.startDate, value.endDate]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tt("Bekor qilish", "Отмена")}
          </Button>
          <Button
            onClick={() => {
              onSave({ startDate: range.from, endDate: range.to });
              onClose();
            }}
          >
            {tt("Saqlash", "Сохранить")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <Field label={tt("dan", "с")}>
          <SpecialDatePicker
            defaultValue={range.from}
            onChange={(iso) => setRange((r) => ({ ...r, from: iso }))}
          />
        </Field>
        <Field label={tt("gacha", "по")}>
          <SpecialDatePicker
            defaultValue={range.to}
            onChange={(iso) => setRange((r) => ({ ...r, to: iso }))}
          />
        </Field>
      </div>
    </Modal>
  );
}
