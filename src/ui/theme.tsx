import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { colorSwitcher } from "@/Redux/colorSwitcher";

export type Theme = "light" | "dark";

/**
 * Mavzu Redux'da (`theme` slice) saqlanadi — bu yerda faqat qulay
 * kirish nuqtasi berilgan.
 */
export function useTheme() {
  const theme = useSelector((s: any) => s.theme) as Theme;
  const dispatch = useDispatch();

  return {
    theme,
    isDark: theme === "dark",
    toggle: () => dispatch(colorSwitcher()),
  };
}

/**
 * `.dark` sinfini <html> ga yozadi va localStorage bilan sinxronlaydi.
 *
 * Ilgari buni Root.tsx qilardi — natijada login sahifasi (Root'dan
 * tashqarida) mavzuni umuman olmasdi. Endi App darajasida turadi,
 * shuning uchun barcha ekranlar, portal'lar va modal'lar bir xil
 * mavzuda ochiladi.
 */
export function ThemeSync() {
  const theme = useSelector((s: any) => s.theme) as Theme;

  useEffect(() => {
    const next: Theme = theme === "dark" ? "dark" : "light";
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(next);
    // Eski sahifalardagi `body.dark ...` qoidalari uchun
    document.body.classList.remove("light", "dark");
    document.body.classList.add(next);

    localStorage.setItem("theme", next);
  }, [theme]);

  return null;
}
