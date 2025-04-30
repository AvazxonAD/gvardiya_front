/** @format */

import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Tarmoq orqali kirishga ruxsat beradi
    port: 5175, // Portni qo'lda sozlash (agar 5173 band bo'lsa, boshqa port qo'ying)
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
