/**
 * Minimal ESLint sozlamasi — faqat React hook qoidalari.
 *
 * Loyihada umuman konfiguratsiya yo'q edi, shuning uchun `npm run lint`
 * ishlamasdi va quyidagi sinf xatolar hech nima bilan ushlanmasdi:
 * effekt bog'liqliklarida beqaror funksiya (har renderda yangi strelka
 * funksiya) — effekt qayta-qayta tozalanib, fokus va so'rovlar sakrab
 * ketardi.
 *
 * Ataylab TOR: `react` va `typescript-eslint` to'plamlari qo'shilsa,
 * ogohlantirishlar soni minglarga chiqib, natijada hech kim o'qimaydi.
 *
 *   rules-of-hooks  — XATO. Yiqiladigan kod, tuzatilishi shart.
 *   exhaustive-deps — ogohlantirish. Ko'pchiligi loyihaning ataylab
 *                     tanlangan uslubi (fetch funksiyasi deps'da yo'q),
 *                     lekin yangi xatolar shu ro'yxatda ko'rinadi.
 */
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist/**", "build/**", "node_modules/**", "public/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
