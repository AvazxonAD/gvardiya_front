import { store } from "@/Redux/store";
import { putJwt } from "@/Redux/apiSlice";
import { baseUri } from "./api";

const ACCESS_KEY = "token";
const REFRESH_KEY = "refreshToken";
const REFRESH_EXP_KEY = "refreshExpiresAt";

// Proactive refresh: refresh if access token expires within this many seconds.
const REFRESH_THRESHOLD_SECONDS = 60;

let refreshPromise: Promise<string | null> | null = null;
let proactiveTimer: ReturnType<typeof setTimeout> | null = null;

export function getAccessToken(): string | null {
  const v = sessionStorage.getItem(ACCESS_KEY);
  return v && v !== "out" ? v : null;
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string, refreshExpiresAt?: string) {
  sessionStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken);
  if (refreshExpiresAt) sessionStorage.setItem(REFRESH_EXP_KEY, refreshExpiresAt);
  store.dispatch(putJwt(accessToken));
  scheduleProactiveRefresh(accessToken);
}

export function clearTokens() {
  sessionStorage.setItem(ACCESS_KEY, "out");
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(REFRESH_EXP_KEY);
  store.dispatch(putJwt("out"));
  if (proactiveTimer) { clearTimeout(proactiveTimer); proactiveTimer = null; }
}

// Schedules a refresh 60s before the current access token expires so that
// legacy callers that hold a JWT via Redux never see a stale token.
function scheduleProactiveRefresh(accessToken: string) {
  if (proactiveTimer) { clearTimeout(proactiveTimer); proactiveTimer = null; }
  const payload = decodeJwt(accessToken);
  if (!payload?.exp) return;
  const msUntilRefresh = (payload.exp - REFRESH_THRESHOLD_SECONDS) * 1000 - Date.now();
  if (msUntilRefresh <= 0) {
    refreshAccessToken();
    return;
  }
  proactiveTimer = setTimeout(() => { refreshAccessToken(); }, msUntilRefresh);
}

// Call once at app startup to resume the refresh cycle after a page reload.
export function initTokenManager() {
  const access = getAccessToken();
  if (access) scheduleProactiveRefresh(access);
}

// Decode JWT payload without validating the signature. Returns null on failure.
function decodeJwt(token: string): { exp?: number } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isAccessTokenExpiringSoon(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true; // no exp → treat as expired to force refresh
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp - nowSec < REFRESH_THRESHOLD_SECONDS;
}

// Calls /auth/refresh with the stored refresh token, saves the new pair.
// Guarded by a singleton promise so concurrent callers share the same request.
export function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(null);

  refreshPromise = (async () => {
    try {
      const res = await fetch(baseUri + "/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return null;
      const body = await res.json();
      if (!body?.success || !body?.data?.accessToken) return null;
      setTokens(
        body.data.accessToken,
        body.data.refreshToken,
        body.data.refreshExpiresAt,
      );
      return body.data.accessToken as string;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Returns a valid (non-expiring-soon) access token, refreshing if needed.
export async function getValidAccessToken(): Promise<string | null> {
  const current = getAccessToken();
  if (current && !isAccessTokenExpiringSoon(current)) return current;
  if (!getRefreshToken()) return current;
  const refreshed = await refreshAccessToken();
  return refreshed ?? current;
}

// authFetch: fetch wrapper that injects a fresh access token and retries once
// when the server rejects the token. Backend returns 403 for expired/invalid
// JWTs (see middleware/auth.js), so both 401 and 403 are treated as auth-retry.
export async function authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const token = await getValidAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", "Bearer " + token);

  let res = await fetch(input, { ...init, headers });
  if (res.status !== 401 && res.status !== 403) return res;

  const refreshed = await refreshAccessToken();
  if (!refreshed) return res;

  const retryHeaders = new Headers(init.headers || {});
  retryHeaders.set("Authorization", "Bearer " + refreshed);
  return fetch(input, { ...init, headers: retryHeaders });
}

// Server-side refresh-token revoke on logout.
export async function revokeRefreshToken(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;
  try {
    await fetch(baseUri + "/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // swallow — logout UX should not block on network
  }
}
