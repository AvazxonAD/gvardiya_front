/** @format */

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Tizimga kirmagan foydalanuvchini login sahifasiga qaytaradi.
 *
 * Ilgari bu komponent unmount bo'lganda `giveUserData(localStorage'dagi
 * qiymat)` dispatch qilardi. Bu ikki jihatdan zarar edi:
 *   1. localStorage bo'sh bo'lsa store'dagi tirik foydalanuvchini
 *      o'chirib yuborardi (region_id yo'qolib, viloyat foydalanuvchisi
 *      admin ko'rinishiga tushib qolardi);
 *   2. `window.onbeforeunload` har renderda qayta biriktirilardi.
 * Ikkalasi ham olib tashlandi — saqlash endi `Utilsprovider` zimmasida.
 */
const Protected = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((s: any) => s.auth.jwt);
  const hasToken = Boolean(token) && token !== "out";

  // Boshqa tabda chiqib ketilsa bu tab ham login sahifasiga qaytadi
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue === null) location.reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!hasToken) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default Protected;
