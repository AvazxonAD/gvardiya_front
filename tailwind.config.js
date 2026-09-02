/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },

      // ─────────────────────────────────────────────────────────
      // Design tokens — barcha ranglar `hsl(var(--x) / <alpha>)`
      // ko'rinishida, shuning uchun `bg-primary/10` kabi opacity
      // modifikatorlari to'g'ri ishlaydi.
      // ─────────────────────────────────────────────────────────
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          hover: "hsl(var(--primary-hover) / <alpha-value>)",
        },
        // Brend rangi — Gvardiya oltini. Aksentlar uchun, fon uchun emas.
        brand: {
          DEFAULT: "hsl(var(--brand) / <alpha-value>)",
          foreground: "hsl(var(--brand-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",

        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground":
            "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },

        chart: Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [
            i + 1,
            `hsl(var(--chart-${i + 1}) / <alpha-value>)`,
          ])
        ),

        // ── Eski (legacy) ranglar ──────────────────────────────
        // Hali ko'chirilmagan ~180 fayl shularga tayanadi.
        // Qiymatlari yangi palitraga moslab qayta belgilangan,
        // shuning uchun eski sahifalar ham yangi qobiq bilan
        // bir xil ko'rinadi. Yangi kodda ISHLATILMASIN.
        mybackground: "var(--mybackground)",
        mybgopacity: "var(--mybackgroundopacity)",
        mybordercolor: "var(--mybordercolor)",
        myiconcolor: "var(--myiconcolor)",
        mylabelcolor: "var(--mylabelcolor)",
        mytextcolor: "var(--mytextcolor)",
        mylogocolor: "var(--mylogocolor)",
        mynavactivebg: "var(--mynavactive)",
        mynavactiveborder: "var(--mynavactiveborder)",
        mysecondarytext: "var(--mysecondarytext)",
        mycalendarbg: "var(--mycalendarbg)",
        myinputborder: "var(--myinputborder)",
        mytablehead: "var(--mytablehead)",
        mytableheadborder: "var(--mytableheadborder)",
      },

      // Butun shkala bitta `--radius` o'zgaruvchisiga bog'langan.
      // `max(0px, ...)` shart: `--radius: 0` bo'lganda `calc(0 - 3px)` manfiy
      // chiqadi, manfiy `border-radius` esa yaroqsiz e'lon — brauzer uni
      // butunlay tashlab yuboradi. `max()` bilan toza 0 bo'ladi.
      borderRadius: {
        sm: "max(0px, calc(var(--radius) - 3px))",
        DEFAULT: "max(0px, calc(var(--radius) - 2px))",
        md: "max(0px, calc(var(--radius) - 1px))",
        lg: "var(--radius)",
        xl: "calc(var(--radius) * 1.5)",
        "2xl": "calc(var(--radius) * 2)",
      },

      // Bir xil ko'tarilish shkalasi — soyalar rejimga qarab o'zgaradi
      boxShadow: {
        xs: "0 1px 2px 0 hsl(var(--shadow-color) / 0.05)",
        sm: "0 1px 3px 0 hsl(var(--shadow-color) / 0.08), 0 1px 2px -1px hsl(var(--shadow-color) / 0.08)",
        DEFAULT:
          "0 2px 6px -1px hsl(var(--shadow-color) / 0.09), 0 1px 3px -1px hsl(var(--shadow-color) / 0.07)",
        md: "0 4px 12px -2px hsl(var(--shadow-color) / 0.10), 0 2px 4px -2px hsl(var(--shadow-color) / 0.06)",
        lg: "0 10px 24px -4px hsl(var(--shadow-color) / 0.12), 0 4px 8px -4px hsl(var(--shadow-color) / 0.07)",
        xl: "0 20px 40px -8px hsl(var(--shadow-color) / 0.16)",
        focus: "0 0 0 3px hsl(var(--ring) / 0.35)",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "zoom-in": {
          from: { opacity: "0", transform: "scale(0.97) translateY(4px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
        "zoom-in": "zoom-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
