import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Yuqori paneldagi sahifa joyi — sarlavha yonida.
 *
 * Sahifaning izohi va tablari kontentda alohida sarlavha bloki bo'lib bir
 * qator joy egallardi. Endi sahifa ularni shu joyga chiqaradi:
 *
 *     <NavbarPortal>...tablar...</NavbarPortal>
 *
 * Joy elementi `AppShell` da saqlanadi va kontekst orqali beriladi.
 */
const NavbarSlotContext = createContext<HTMLElement | null>(null);

export const NavbarSlotProvider = NavbarSlotContext.Provider;

/** Bolalarini yuqori paneldagi sahifa joyiga chizadi */
export function NavbarPortal({ children }: { children: ReactNode }) {
  const slot = useContext(NavbarSlotContext);
  return slot ? createPortal(children, slot) : null;
}
