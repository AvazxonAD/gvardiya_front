import { isRealUser } from "@/Redux/apiSlice";
import { store } from "@/Redux/store";
import React, { useEffect } from "react";

/**
 * Redux holatini localStorage bilan sinxronlaydi.
 *
 * Obuna shu yerda — ilova ildizida — turadi, chunki u butun sessiya
 * davomida yashashi kerak.
 *
 * Ilgari foydalanuvchi ma'lumoti Login sahifasida obuna qilingan edi va
 * shu sabab quyidagi xatolik yuzaga kelardi:
 *   `loginAuth()` javob kelishi bilan `setTokens()` ni chaqiradi, u esa
 *   `putJwt` dispatch qiladi → token paydo bo'lgani uchun Login darhol
 *   unmount bo'ladi → obuna uziladi → keyin kelgan `setUserData` hech
 *   qayerga yozilmaydi. Natijada refreshdan keyin foydalanuvchi bo'sh
 *   andoza bilan tiklanib, region_id yo'qolardi va viloyat foydalanuvchisi
 *   admin sifatida ochilardi.
 */
export const Utilsprovider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const persist = () => {
      const state = store.getState();

      localStorage.setItem("account", JSON.stringify(state.account));
      localStorage.setItem("standartDate", JSON.stringify(state.defaultDate));

      // Bo'sh andoza saqlanmaydi — aks holda haqiqiy foydalanuvchi
      // ustidan yozilib ketadi. Chiqishda `user` alohida o'chiriladi.
      const user = state.auth.user;
      if (isRealUser(user)) {
        localStorage.setItem("user", JSON.stringify({ user }));
      }
    };

    persist();
    return store.subscribe(persist);
  }, []);

  return <>{children}</>;
};
