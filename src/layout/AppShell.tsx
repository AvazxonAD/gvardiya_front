import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";
import Alert from "@/Components/Alert";
import { alertt } from "@/Redux/LanguageSlice";
import AppNavbar from "./AppNavbar";
import ErrorBoundary from "./ErrorBoundary";
import AppSidebar from "./AppSidebar";

const COLLAPSE_KEY = "sidebar:collapsed";

/**
 * Ilova qobig'i: yon panel + yuqori panel + kontent.
 *
 * Eski `Root.tsx` dan farqi — balandlik JS bilan hisoblanmaydi
 * (`useFullHeight` yo'q), qobiq `sticky`/`flex` ustida qurilgan va
 * `lg` dan pastda yon panel sirg'aluvchi qatlamga aylanadi.
 *
 * Yig'ilgan/yoyilgan holat shu yerda turadi, chunki kontentning chap
 * bo'shlig'i ham shunga bog'liq.
 */
export default function AppShell() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const alert = useSelector((s: any) => s.lan.alert);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "true"
  );

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  // Alert avtomatik yopilishi
  useEffect(() => {
    if (!alert?.isVisible) return;
    const timer = setTimeout(
      () => dispatch(alertt({ text: "", open: false })),
      alert.time || 2000
    );
    return () => clearTimeout(timer);
  }, [alert, dispatch]);

  // Sahifa almashganda tepaga qaytish va mobil menyuni yopish
  useEffect(() => {
    setMobileNavOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      {/* Yon panel `fixed`, shuning uchun kontent chapdan siljitiladi.
          Bu kengliklar AppSidebar dagilar bilan mos bo'lishi shart. */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200 ease-out",
          collapsed ? "lg:pl-[68px]" : "lg:pl-[260px]"
        )}
      >
        <AppNavbar onMenuClick={() => setMobileNavOpen(true)} />

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
          {/* Sahifadagi istisno qobiqni (menyu, chiqish) o'chirmasin */}
          <ErrorBoundary resetKey={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {alert?.open && <Alert />}
    </div>
  );
}
