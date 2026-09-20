import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
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
import { removeAccountNumber } from "@/Redux/accountSlice";
import { clearUserData } from "@/Redux/apiSlice";
import { clearTokens, revokeRefreshToken } from "@/services/tokenManager";
import { RootState } from "@/Redux/store";
import { AccountNumberSelect } from "@/Components/AccountNumberSelect";
import { SpecialDatePicker } from "@/Components/SpecialDatePicker";
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

type Props = { onMenuClick: () => void };

export default function AppNavbar({ onMenuClick }: Props) {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const request = useRequest();
  const { isDark, toggle } = useTheme();

  const { user, jwt } = useSelector((s: any) => s.auth);
  const account = useSelector((s: any) => s.account);
  const { startDate, endDate } = useSelector(
    (s: RootState) => s.defaultDate
  );

  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountModal, setAccountModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isRegionUser = Boolean(user?.region_id);
  const lang = localStorage.getItem("lang") ?? "0";

  // ── Sahifa sarlavhasi menyudan olinadi ────────────────────────
  const pageTitle = useMemo(() => {
    const items = getMenuForUser(user);
    const match = items
      .filter((i) =>
        i.path === "/"
          ? pathname === "/"
          : pathname === i.path || pathname.startsWith(i.path + "/")
      )
      .sort((a, b) => b.path.length - a.path.length)[0];
    return match ? tt(match.uz, match.ru) : "";
  }, [pathname, user]);

  // ── Hisob raqamlari ───────────────────────────────────────────
  useEffect(() => {
    if (!jwt || jwt === "out" || !isRegionUser) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await request.get("/account");
        if (!cancelled && (res?.status === 200 || res?.status === 201)) {
          setAccounts(res.data?.data ?? []);
        }
      } catch (e) {
        console.error("Hisob raqamlarini olishda xatolik:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt, isRegionUser]);

  // Hisob raqam tanlanmagan bo'lsa — majburiy tanlash oynasi.
  // Tanlaydigan hisob umuman bo'lmasa oyna ochilmaydi: aks holda uni
  // yopib ham, chiqib ham bo'lmaydigan qopqonga aylanardi.
  useEffect(() => {
    if (isRegionUser && accounts.length > 0 && !account?.account_number_id) {
      setAccountModal(true);
    }
  }, [isRegionUser, accounts.length, account?.account_number_id]);

  const handleLogout = async () => {
    await revokeRefreshToken();
    clearTokens();

    // Tartib muhim — izohi AppSidebar dagi bir xil funksiyada
    dispatch(clearUserData());
    dispatch(removeAccountNumber());

    localStorage.removeItem("account");
    localStorage.removeItem("standartDate");
    localStorage.removeItem("user");

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

        <h1 className="truncate text-sm font-semibold text-foreground">
          {pageTitle}
        </h1>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Sana oralig'i — faqat asosiy sahifada */}
          {pathname === "/" && (
            <div className="hidden items-center gap-1.5 md:flex">
              <SpecialDatePicker
                defaultValue={startDate}
                onChange={(iso) =>
                  dispatch(changeDefaultDate({ startDate: iso }))
                }
              />
              <span className="text-muted-foreground">—</span>
              <SpecialDatePicker
                defaultValue={endDate}
                onChange={(iso) => dispatch(changeDefaultDate({ endDate: iso }))}
              />
            </div>
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
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                    {tt("Hisob raqam", "Номер счета")}
                  </span>
                  <span className="block text-[12px] font-medium tabular-nums text-foreground">
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
              <span className="hidden max-w-[140px] truncate text-[13px] font-medium text-foreground xl:block">
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
        accountData={accounts}
        openmodal={accountModal}
        setOpenmodal={setAccountModal}
      />

      <ProfileModal
        open={profileModal}
        onClose={() => setProfileModal(false)}
        jwt={jwt}
      />

      <DefaultDateModal open={dateModal} onClose={() => setDateModal(false)} />
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
    <span className="flex size-7 shrink-0 items-center justify-center rounded-none bg-primary/12 text-[11px] font-semibold text-primary">
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

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.login || !form.oldPassword || !form.newPassword) {
      setError(tt("Barcha maydonlarni to'ldiring", "Заполните все поля"));
      return;
    }

    if (form.newPassword.trim().length < 8) {
      setError(
        tt(
          "Yangi parol kamida 8 ta belgi bo'lishi kerak",
          "Новый пароль должен содержать минимум 8 символов"
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
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive">
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
          />
        </Field>
      </form>
    </Modal>
  );
}

function DefaultDateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const { startDate, endDate } = useSelector((s: RootState) => s.defaultDate);
  const [range, setRange] = useState({ from: startDate, to: endDate });

  useEffect(() => {
    if (open) setRange({ from: startDate, to: endDate });
  }, [open, startDate, endDate]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tt("Standart sana oralig'i", "Период по умолчанию")}
      description={tt(
        "Ilova ochilganda shu oraliq qo'llanadi",
        "Этот период применяется при открытии приложения"
      )}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tt("Bekor qilish", "Отмена")}
          </Button>
          <Button
            onClick={() => {
              dispatch(
                changeDefaultDate({ startDate: range.from, endDate: range.to })
              );
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
