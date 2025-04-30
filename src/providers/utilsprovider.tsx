import { store } from "@/Redux/store";
import React from "react";

export const Utilsprovider = ({ children }: { children: React.ReactNode }) => {
  store.subscribe(() => {
    const accountobj = store.getState().account;
    localStorage.setItem("account", JSON.stringify(accountobj));

    const dateObj = store.getState().defaultDate;
    localStorage.setItem("standartDate", JSON.stringify(dateObj));
  });
  return <>{children}</>;
};
