// E-IMZO bilan ishlash endi to'liq usb_manager (lokal Electron app) orqali amalga oshadi.
// Client E-IMZO'ga TO'G'RIDAN-TO'G'RI ulanmaydi — barcha ishni usb_manager bajaradi.
//
// Oqim:
//   1. Backenddan qisqa muddatli "bridge token" olinadi (foydalanuvchi JWT bilan).
//   2. Shu token bilan usb_manager HTTP API chaqiriladi (http://127.0.0.1:9090).
//   3. usb_manager E-IMZO bilan ishlab natijani qaytaradi.

import { URL as API_URL } from "@/api";
import { getValidAccessToken } from "@/services/tokenManager";

const USB_MANAGER_URL =
  (import.meta as any).env?.VITE_USB_MANAGER_URL || "http://127.0.0.1:9090";

export interface EimzoCertificate {
  fio: string;
  tin: string;
  pinfl: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  expired: boolean;
  valid: boolean;
  disk: string;
  path: string;
  name: string;
  alias: string;
}

export interface EimzoStatus {
  installed: boolean;
  running: boolean;
  hasKey: boolean;
  hasValidKey: boolean;
  count: number;
  fio: string | null;
  certificates: EimzoCertificate[];
  reason: string;
}

// --- Bridge token (backenddan), kechiktirilgan keshlash bilan ---
let cachedBridge: { token: string; expMs: number } | null = null;

async function getBridgeToken(): Promise<string> {
  if (cachedBridge && cachedBridge.expMs > Date.now()) {
    return cachedBridge.token;
  }
  const access = await getValidAccessToken();
  if (!access) throw new Error("Tizimga qayta kiring");

  let res: Response;
  try {
    res = await fetch(`${API_URL}/eimzo/bridge-token`, {
      headers: { Authorization: "Bearer " + access },
    });
  } catch {
    throw new Error("Serverga ulanib bo'lmadi");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.success || !data?.data?.token) {
    throw new Error(data?.message || "Bridge token olishda xatolik");
  }
  // expiresIn (sekund) — 30s zaxira bilan keshlaymiz
  const ttl = Math.max(0, (Number(data.data.expiresIn) || 60) - 30);
  cachedBridge = { token: data.data.token, expMs: Date.now() + ttl * 1000 };
  return cachedBridge.token;
}

// --- usb_manager HTTP chaqiruvi ---
// bridgeToken berilsa o'sha ishlatiladi (login bosqichi — access token hali yo'q),
// aks holda backenddan foydalanuvchi JWT bilan olinadi.
async function call(
  path: string,
  init?: RequestInit,
  bridgeToken?: string,
): Promise<any> {
  const bridge = bridgeToken || (await getBridgeToken());

  let res: Response;
  try {
    res = await fetch(`${USB_MANAGER_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + bridge,
        ...(init?.headers || {}),
      },
    });
  } catch {
    // usb_manager ishlamayotgan bo'lsa fetch xato tashlaydi
    throw new Error(
      "E-IMZO xizmati (USB Manager) ishga tushmagan. Dasturni oching va qaytadan urinib ko'ring.",
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || data?.reason || `Xatolik (${res.status})`);
  }
  return data;
}

// E-IMZO holati (o'rnatilgan/ishlayapti/kalit bor)
export async function getStatus(): Promise<EimzoStatus> {
  return (await call("/eimzo/status")).data;
}

// Kalitlar (sertifikatlar) ro'yxati
export async function listCertificates(): Promise<EimzoCertificate[]> {
  return (await call("/eimzo/certificates")).data;
}

// Ma'lumotni imzolash. content64 — base64; cert — listCertificates() obyekti.
// Natija: { pkcs7_64, signer_name }
export async function sign(
  content64: string,
  cert: EimzoCertificate | any,
  opts?: { detached?: boolean; timestamp?: boolean },
): Promise<{ pkcs7_64: string; signer_name: string }> {
  const res = await call("/eimzo/sign", {
    method: "POST",
    body: JSON.stringify({
      content64,
      cert,
      detached: opts?.detached,
      timestamp: opts?.timestamp,
    }),
  });
  return res.data;
}

// --- Login bosqichi uchun: bridge token backenddan login (1-bosqich) javobida
// keladi, chunki access token hali mavjud emas ---

export async function listCertificatesWithBridge(
  bridgeToken: string,
): Promise<EimzoCertificate[]> {
  return (await call("/eimzo/certificates", undefined, bridgeToken)).data;
}

export async function signWithBridge(
  bridgeToken: string,
  content64: string,
  cert: EimzoCertificate | any,
): Promise<{ pkcs7_64: string; signer_name: string }> {
  const res = await call(
    "/eimzo/sign",
    { method: "POST", body: JSON.stringify({ content64, cert }) },
    bridgeToken,
  );
  return res.data;
}

export const EImzo = {
  getStatus,
  listCertificates,
  sign,
  listCertificatesWithBridge,
  signWithBridge,
  // Eski nom bilan moslik (ba'zi joylar listAllCertificates ishlatadi)
  listAllCertificates: listCertificates,
};
