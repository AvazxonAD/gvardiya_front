/** @format */

// Frontni (dist) tarqatuvchi kichik Express server.
// pm2 orqali ishga tushadi: pm2 start server.js --name tadbir-front
// Nginx shu portga proksi qiladi.

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.FRONT_PORT || 3008;
const HOST = process.env.FRONT_HOST || "127.0.0.1";
const distDir = path.join(__dirname, "dist");

app.disable("x-powered-by");

// Hashli fayllar (assets/index-XXXX.js) uzoq keshlanadi, index.html esa yo'q
app.use(
  express.static(distDir, {
    index: false,
    maxAge: "1y",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
    },
  })
);

// SPA fallback — react-router yo'llari uchun
app.use((req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`front server: http://${HOST}:${PORT}`);
});
