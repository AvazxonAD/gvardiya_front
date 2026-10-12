/** @format */

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { tt } from "../../utils";
import { Button, PageBar } from "@/ui";

/**
 * Shartnoma bo'limining qobig'i.
 *
 * Ilgari bu yerda `grid grid-rows-[auto_1fr]` ishlatilardi va ichki element
 * `min-width: auto` bo'lgani uchun keng jadval qobiqni cho'zib yuborardi —
 * butun sahifa gorizontal aylanardi. Endi oddiy flex-ustun va `min-w-0`:
 * jadval o'z qutisi ichida aylanadi.
 */
const Contract = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const title =
    pathname === "/contract/add"
      ? tt("Shartnomani kiritish", "Добавление договора")
      : pathname.startsWith("/contract/tasks/")
      ? tt("Topshiriqlar", "Задачи")
      : pathname !== "/contract" &&
        !pathname.startsWith("/contract/view/") &&
        !pathname.startsWith("/contract/analiz/")
      ? tt("Shartnoma tahrirlash", "Редактировать договор")
      : "";

  // Sahifa paddingsiz: sarlavha qatori `PageBar` ichida, ostidagi kontent
  // ekran oxirigacha cho'ziladi (shakl sirti `flex-1` bilan to'ldiradi)
  return (
    <div className="flex min-h-[calc(100dvh_-_3.5rem)] min-w-0 flex-col">
      {title && (
        <PageBar className="gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft />
            {tt("Orqaga", "Назад")}
          </Button>
          <h1 className="truncate text-[1rem] font-semibold text-foreground">
            {title}
          </h1>
        </PageBar>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default Contract;
