import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";
import { getErrorMessage, isRequestError } from "@/lib/errorMessage";
import Alert from "@/Components/Alert";
import { alertt } from "@/Redux/LanguageSlice";
import AppNavbar from "./AppNavbar";
import ErrorBoundary from "./ErrorBoundary";
import AppSidebar from "./AppSidebar";
import { NavbarSlotProvider } from "./navbarSlot";
import { setPermissions } from "@/Redux/apiSlice";
import { isStaffUser } from "@/lib/permissions";
import { useRequest } from "@/hooks/useRequest";

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
  // Yuqori paneldagi sahifa joyi (`NavbarPortal` shu yerga chizadi)
  const [navbarSlot, setNavbarSlot] = useState<HTMLElement | null>(null);

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

  // Hech kim ushlamagan so'rov xatosi ham ko'rinsin — aks holda foydalanuvchi
  // tugmani bosadi-yu, hech narsa bo'lmaganini ko'radi
  useEffect(() => {
    const onUnhandled = (event: PromiseRejectionEvent) => {
      if (!isRequestError(event.reason)) return;
      dispatch(alertt({ text: getErrorMessage(event.reason), success: false }));
    };
    window.addEventListener("unhandledrejection", onUnhandled);
    return () => window.removeEventListener("unhandledrejection", onUnhandled);
  }, [dispatch]);

  // Xodim (yurist, buxgalter) ruhsatlari: admin o'zgartirsa, qayta kirmasdan
  // yangilanadi — ilova ochilganda va oynaga qaytilganda serverdan olinadi
  const user = useSelector((s: any) => s.auth.user);
  const staff = isStaffUser(user);
  const request = useRequest();
  useEffect(() => {
    if (!staff) return;
    const load = async () => {
      try {
        const res = await request.get("/auth/permissions");
        const permissions = res?.data?.data?.permissions;
        if (permissions) dispatch(setPermissions(permissions));
      } catch {
        /* tarmoq xatosi — mavjud ruhsatlar bilan davom etiladi */
      }
    };
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff]);

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
          collapsed ? "lg:pl-[4.25rem]" : "lg:pl-[16.25rem]"
        )}
      >
        <AppNavbar
          onMenuClick={() => setMobileNavOpen(true)}
          slotRef={setNavbarSlot}
        />

        {/* `py-5` va yuqori panelning `h-14` i o'zgarsa, `ListCard` dagi
            `100dvh - 6rem` ham o'zgarishi kerak: ro'yxat sahifalari shu
            hisob bilan ekranga aynan sig'adi. */}
        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
          {/* Sahifadagi istisno qobiqni (menyu, chiqish) o'chirmasin */}
          <ErrorBoundary resetKey={pathname}>
            <NavbarSlotProvider value={navbarSlot}>
              <Outlet />
            </NavbarSlotProvider>
          </ErrorBoundary>
        </main>
      </div>

      {alert?.open && <Alert />}
    </div>
  );
}
