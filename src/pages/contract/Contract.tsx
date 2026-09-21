/** @format */

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { tt } from "../../utils";
import { Button } from "@/ui";

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

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {title && (
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft />
            {tt("Orqaga", "Назад")}
          </Button>
          <h1 className="truncate text-[16px] font-semibold text-foreground">
            {title}
          </h1>
        </div>
      )}

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default Contract;
