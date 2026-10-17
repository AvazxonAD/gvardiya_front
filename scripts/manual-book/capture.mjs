/**
 * Kitobning 1-sahifasi uchun skrinshot: qo'llanma dasturda qayerda.
 * "Video darslar" sahifasi suratga olinadi, fon xiralashtiriladi, uch joy
 * qizil ramka va raqam bilan belgilanadi (qolgan skrinshotlar uslubida):
 *   1 — chap menyudagi «Video darslar», 2 — «Qo'llanma», 3 — «PDF kitob».
 * Ikki kitob — ikki rasm (2160×1350): viloyat foydalanuvchisi uchun
 * public/manual/book/qayerda.webp, super-admin uchun qayerda-admin.webp.
 * Ekran boshqa skrinshotlarnikidan kichikroq (1080×675, 2×) — belgilangan
 * tugmalar birinchi sahifada yirik ko'rinsin.
 *
 * Kerak: ishlab turgan frontend (APP_URL, odatda http://localhost:5175) va
 * backend, backend/.env (JWT_SECRET va foydalanuvchi). Yuqori paneldagi
 * hisob raqam namuna bilan almashtiriladi (mock-api.mjs).
 *
 *   npm run manual:capture                    # ikkalasi: viloyat (id 1), super-admin (id 8)
 *   AUDIENCE=admin npm run manual:capture     # faqat bittasi
 *   USER_ID=5 ADMIN_USER_ID=9 npm run manual:capture
 *
 * Tugma yoki menyu nomi o'zgarsa — qayta ishga tushiring, keyin
 * `npm run manual:pdf`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { launchChrome, sleep } from "./cdp.mjs";
import { ACCOUNTS } from "./fixtures.mjs";
import { interceptApi, ok } from "./mock-api.mjs";
import { APP_URL, CLIENT, mintSession, openApp } from "./session.mjs";

// Har kitob — o'z foydalanuvchisi: viloyat admini va super-admin (dev bazada)
const TARGETS = [
  { audience: "region", userId: Number(process.env.USER_ID || 1), out: "public/manual/book/qayerda.webp" },
  { audience: "admin", userId: Number(process.env.ADMIN_USER_ID || 8), out: "public/manual/book/qayerda-admin.webp" },
].filter((t) => !process.env.AUDIENCE || process.env.AUDIENCE.split(",").includes(t.audience));

// 1-sahifa: yirikroq ko'rinish (rasm baribir 2160×1350)
const VIEW = { width: 1080, height: 675, scale: 2 };

/** Rasmni brauzerning o'zida qayta chizish: xira fon + tiniq belgilangan joylar */
function composeScript(png, targets, scale) {
  return `(async () => {
    const img = new Image();
    img.src = "data:image/png;base64,${png}";
    await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight, S = ${scale};
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");

    // Fon: xira va biroz qoraytirilgan
    g.filter = "blur(" + (3 * S) + "px) saturate(0.7)";
    g.drawImage(img, 0, 0);
    g.filter = "none";
    g.fillStyle = "rgba(71, 85, 105, 0.38)";
    g.fillRect(0, 0, W, H);

    const round = (x, y, w, h, r) => {
      g.beginPath();
      g.moveTo(x + r, y);
      g.arcTo(x + w, y, x + w, y + h, r);
      g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r);
      g.arcTo(x, y, x + w, y, r);
      g.closePath();
    };

    const targets = ${JSON.stringify(targets)};
    for (const t of targets) {
      const pad = 4 * S;
      const x = t.x * S - pad, y = t.y * S - pad, w = t.w * S + pad * 2, h = t.h * S + pad * 2;
      // Belgilangan joy — tiniq (asl rasmdan)
      g.save();
      round(x, y, w, h, 6 * S);
      g.clip();
      g.drawImage(img, x, y, w, h, x, y, w, h);
      g.restore();
      // Oq ichki halqa + qizil ramka
      g.lineWidth = 2 * S;
      g.strokeStyle = "#ffffff";
      round(x - 1 * S, y - 1 * S, w + 2 * S, h + 2 * S, 7 * S);
      g.stroke();
      g.lineWidth = 3 * S;
      g.strokeStyle = "#e11d48";
      round(x - 3.5 * S, y - 3.5 * S, w + 7 * S, h + 7 * S, 9 * S);
      g.stroke();

      // Raqam: qizil doira
      const r = 13 * S;
      let cx, cy;
      if (t.badge === "right") { cx = x + w + 7 * S + r; cy = y + h / 2; }
      else { cx = x + w / 2; cy = y + h + 7 * S + r; }
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fillStyle = "#e11d48";
      g.fill();
      g.lineWidth = 2 * S;
      g.strokeStyle = "#ffffff";
      g.stroke();
      g.fillStyle = "#ffffff";
      g.font = "700 " + (15 * S) + "px Segoe UI, Arial, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(String(t.n), cx, cy + 0.5 * S);
    }
    return c.toDataURL("image/webp", 0.92).split(",")[1];
  })()`;
}

/** Bitta foydalanuvchi nomidan "Video darslar" sahifasini suratga olish */
async function capture({ audience, userId, out }) {
  const session = await mintSession(userId);
  const chrome = await launchChrome();
  const net = interceptApi(chrome, [["GET", /^\/account\/?$/, () => ok(ACCOUNTS)]]);
  try {
    await net.enable();
    await openApp(chrome, session, { view: VIEW });
    await chrome.navigate(`${APP_URL}/video-lessons`, 3000);

    const targets = await chrome.evaluate(`(() => {
      const find = (sel, text) => [...document.querySelectorAll(sel)].find((e) => e.textContent.trim() === text);
      const box = (el, n, badge) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { n, badge, x: r.x, y: r.y, w: r.width, h: r.height };
      };
      return [
        box(find("aside a, nav a", "Video darslar"), 1, "right"),
        box(find("header button, header a, button", "Qo'llanma"), 2, "below"),
        box(find("header a, a", "PDF kitob"), 3, "below"),
      ];
    })()`);
    if (targets.some((t) => !t)) {
      throw new Error(`${audience}: belgilanadigan joy topilmadi: ${JSON.stringify(targets)}`);
    }

    const shot = await chrome.send("Page.captureScreenshot", { format: "png" });
    await chrome.navigate("about:blank");
    const webp = await chrome.evaluate(composeScript(shot.data, targets, VIEW.scale));

    const file = path.join(CLIENT, out);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, Buffer.from(webp, "base64"));
    console.log(
      `saqlandi (${audience}):`,
      path.relative(CLIENT, file),
      targets.map((t) => `${t.n}@${Math.round(t.x)},${Math.round(t.y)}`).join(" ")
    );
  } finally {
    await chrome.close();
    await sleep(100);
  }
  net.report();
}

const main = async () => {
  for (const target of TARGETS) await capture(target);
  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
