import { useEffect, useState } from "react";

const read = () =>
  parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;

/**
 * Interfeysning joriy masshtabi: `html` shrift o'lchami / 16px.
 *
 * Katta monitorda interfeys `html` shrift o'lchami orqali kattalashadi
 * (index.css). Qat'iy px dagi narsalar — masalan A4 hujjat ko'rinishi —
 * shu koeffitsient bilan ko'rinishda kattalashtiriladi.
 */
export function useRemScale() {
  const [scale, setScale] = useState(read);

  useEffect(() => {
    const onResize = () => setScale(read());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return scale;
}
