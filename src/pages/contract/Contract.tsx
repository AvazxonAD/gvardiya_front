/** @format */

import BackButton from "@/Components/reusable/BackButton";
import { Outlet, useLocation } from "react-router-dom";
import { tt } from "../../utils";

const Contract = () => {
  const { pathname } = useLocation();

  return (
    <div className={`grid grid-rows-[auto_1fr]  h-full `}>
      {pathname !== "/contract" && !pathname.startsWith("/contract/analiz") && (
        <div>
          {!pathname.includes("contract/view/") && (
            <div className="flex justify-center relative items-center">
              <div className="absolute left-0">
                <BackButton />
              </div>
              <h1 className="text-[20px] text-center font-[700] text-mytextcolor">
                {pathname === "/contract/add"
                  ? tt("Shartnomani kiritish", "Заключение договора")
                  : pathname.startsWith("/contract/tasks/")
                  ? tt("Topshiriqlar", "Задачи")
                  : pathname !== "/contract/add" &&
                    !pathname.startsWith("/contract/analiz/")
                  ? tt("Shartnoma tahrirlash", "Редактировать контракт")
                  : ""}
              </h1>
            </div>
          )}
        </div>
      )}
      <div className="h-full w-full">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default Contract;
