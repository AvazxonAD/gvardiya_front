import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { tt } from "@/utils";
import { removeAccountNumber } from "@/Redux/accountSlice";
import { clearUserData } from "@/Redux/apiSlice";
import { clearTokens, revokeRefreshToken } from "@/services/tokenManager";
import Logo from "@/assets/logo.png";
import { getMenuForUser, type MenuItem } from "./menu";

const SPR_OPEN_KEY = "sidebar:spravochnikOpen";

type Props = {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
  /** Mobil qatlamda ochiqmi */
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function AppSidebar({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileClose,
}: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s: any) => s.auth);

  const [sprOpen, setSprOpen] = useState(
    () => sessionStorage.getItem(SPR_OPEN_KEY) === "true"
  );

  const items = useMemo(() => getMenuForUser(user), [user]);

  useEffect(() => {
    sessionStorage.setItem(SPR_OPEN_KEY, String(sprOpen));
  }, [sprOpen]);

  // Spravochnik ichidagi sahifaga o'tilsa bo'lim o'zi ochiladi
  useEffect(() => {
    if (pathname.startsWith("/spravichnik")) setSprOpen(true);
  }, [pathname]);

  /**
   * Faol bandni aniqlash: eng uzun mos keluvchi yo'l g'olib.
   * Shu sabab `/rasxod` va `/rasxod-workers` bir vaqtda yonib turmaydi.
   */
  const activePath = useMemo(() => {
    const matches = items
      .map((i) => i.path)
      .filter((p) =>
        p === "/"
          ? pathname === "/"
          : pathname === p || pathname.startsWith(p + "/")
      );
    return matches.sort((a, b) => b.length - a.length)[0] ?? "";
  }, [items, pathname]);

  const handleLogout = async () => {
    await revokeRefreshToken();
    clearTokens();

    // Avval store tozalanadi: Utilsprovider obunasi holatni localStorage'ga
    // ko'chiradi, shuning uchun store'da eski foydalanuvchi qolsa kalitlarni
    // o'chirgandan keyin ular qaytadan yozilib qolardi.
    dispatch(clearUserData());
    dispatch(removeAccountNumber());

    localStorage.removeItem("account");
    localStorage.removeItem("standartDate");
    localStorage.removeItem("user");

    navigate("/");
    location.reload();
  };

  const showLabels = !collapsed;

  return (
    <>
      {/* Mobil qatlam foni */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 animate-fade-in bg-foreground/40 backdrop-blur-[2px] lg:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar",
          "transition-[width,transform] duration-200 ease-out",
          collapsed ? "w-[68px]" : "w-[260px]",
          // Mobil: sirg'alib chiqadi. lg dan boshlab doim ko'rinadi.
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label={tt("Asosiy menyu", "Главное меню")}
      >
        {/* ── Brend ─────────────────────────────────────────────── */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border",
            collapsed ? "justify-center px-2" : "px-4"
          )}
        >
          <img
            src={Logo}
            alt=""
            className="size-8 shrink-0 rounded-md object-contain"
          />
          {showLabels && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                {tt("Tadbir-Hisob", "Тадбир-Ҳисоб")}
              </p>
              <p className="truncate text-[11px] leading-tight text-muted-foreground">
                {tt("Moliyaviy hisob tizimi", "Финансовый учёт")}
              </p>
            </div>
          )}
        </div>

        {/* ── Menyu ─────────────────────────────────────────────── */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-2">
          {items.map((item) =>
            item.subItems ? (
              <SidebarGroup
                key={item.path}
                item={item}
                collapsed={collapsed}
                open={sprOpen}
                onToggle={() => setSprOpen((v) => !v)}
                pathname={pathname}
                onExpand={() => onCollapsedChange(false)}
              />
            ) : (
              <SidebarLink
                key={item.path}
                item={item}
                collapsed={collapsed}
                active={activePath === item.path}
              />
            )
          )}
        </nav>

        {/* ── Pastki qism ───────────────────────────────────────── */}
        <div className="shrink-0 space-y-0.5 border-t border-sidebar-border p-2">
          <button
            onClick={handleLogout}
            title={collapsed ? tt("Chiqish", "Выход") : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium",
              "text-destructive transition-colors hover:bg-destructive/10",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="size-[18px] shrink-0" />
            {showLabels && tt("Chiqish", "Выход")}
          </button>

          <button
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              "hidden w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium",
              "text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:flex",
              collapsed && "justify-center px-0"
            )}
            aria-label={
              collapsed
                ? tt("Menyuni kengaytirish", "Развернуть меню")
                : tt("Menyuni yig'ish", "Свернуть меню")
            }
          >
            {collapsed ? (
              <PanelLeftOpen className="size-[18px] shrink-0" />
            ) : (
              <PanelLeftClose className="size-[18px] shrink-0" />
            )}
            {showLabels && tt("Yig'ish", "Свернуть")}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ───────────────────────────────────────────────────────────────── */

const itemClass = (active: boolean, collapsed: boolean) =>
  cn(
    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium",
    "transition-colors duration-150",
    collapsed && "justify-center px-0",
    active
      ? "bg-sidebar-accent/10 text-sidebar-accent-foreground"
      : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
  );

/** Faol bandning chap chetidagi ko'rsatkich chizig'i */
function ActiveMark({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-sidebar-accent"
      aria-hidden
    />
  );
}

function SidebarLink({
  item,
  collapsed,
  active,
}: {
  item: MenuItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      title={collapsed ? tt(item.uz, item.ru) : undefined}
      aria-current={active ? "page" : undefined}
      className={itemClass(active, collapsed)}
    >
      <ActiveMark show={active} />
      <Icon
        className={cn("size-[18px] shrink-0", active && "text-sidebar-accent")}
      />
      {!collapsed && <span className="truncate">{tt(item.uz, item.ru)}</span>}
    </Link>
  );
}

function SidebarGroup({
  item,
  collapsed,
  open,
  onToggle,
  pathname,
  onExpand,
}: {
  item: MenuItem;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  pathname: string;
  onExpand: () => void;
}) {
  const Icon = item.icon;
  const groupActive = pathname.startsWith(item.path);
  const subPath = pathname.replace(item.path, "") || "/";

  return (
    <div>
      <button
        type="button"
        onClick={collapsed ? onExpand : onToggle}
        title={collapsed ? tt(item.uz, item.ru) : undefined}
        aria-expanded={collapsed ? undefined : open}
        className={cn(itemClass(groupActive, collapsed), "w-full text-left")}
      >
        <ActiveMark show={groupActive} />
        <Icon
          className={cn(
            "size-[18px] shrink-0",
            groupActive && "text-sidebar-accent"
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{tt(item.uz, item.ru)}</span>
            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {!collapsed && open && (
        <div className="ml-[22px] mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2.5">
          {item.subItems!.map((sub) => {
            const active = subPath === sub.path;
            return (
              <Link
                key={sub.path}
                to={item.path + (sub.path === "/" ? "" : sub.path)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px]",
                  "transition-colors duration-150",
                  active
                    ? "bg-sidebar-accent/10 font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-none transition-colors",
                    active ? "bg-sidebar-accent" : "bg-border"
                  )}
                  aria-hidden
                />
                <span className="truncate">{tt(sub.uz, sub.ru)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
