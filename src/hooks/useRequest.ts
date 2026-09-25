import { URL } from "@/api";
import axios, { AxiosInstance } from "axios";
import { useSelector } from "react-redux";
import { getValidAccessToken, refreshAccessToken } from "@/services/tokenManager";
import { getAppLang, LANG_HEADER } from "@/lib/lang";
import { getErrorMessage } from "@/lib/errorMessage";

const getAxios = (jwt: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: URL,
    headers: { Authorization: "Bearer " + jwt, [LANG_HEADER]: getAppLang() },
  });

  // Proactive: swap in a fresh token on each outgoing request if the stored one
  // is about to expire.
  instance.interceptors.request.use(async (config) => {
    const token = await getValidAccessToken();
    config.headers = config.headers || {};
    if (token) config.headers.Authorization = "Bearer " + token;
    // Til har so'rovda qayta o'qiladi: foydalanuvchi tilni almashtirsa,
    // sahifani yangilamasdan ham server xabarlari yangi tilda keladi.
    config.headers[LANG_HEADER] = getAppLang();
    return config;
  });

  // Reactive: on 401/403, refresh once and retry the original request.
  instance.interceptors.response.use(
    (r) => r,
    async (error) => {
      const original = error?.config;
      const status = error?.response?.status;
      if ((status === 401 || status === 403) && original && !original._retry) {
        original._retry = true;
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          original.headers = original.headers || {};
          original.headers.Authorization = "Bearer " + refreshed;
          return instance.request(original);
        }
      }

      // Xato matni — serverning o'z xabari ("Hujjat raqami" kiritilishi
      // shart!). Chaqiruvchilar `... || error.message` ni ko'rsatadi, shunda
      // axios'ning "Request failed with status code 400" matni chiqmaydi.
      // Fayl so'rovlarida (responseType: "blob") xato tanasi ham Blob bo'ladi.
      const data = error?.response?.data;
      if (data instanceof Blob) {
        try {
          error.response.data = JSON.parse(await data.text());
        } catch {
          // JSON emas — matn status bo'yicha tanlanadi
        }
      }
      if (error) error.message = getErrorMessage(error);

      return Promise.reject(error);
    },
  );

  return instance;
};
export const useRequest = (): AxiosInstance => {
  const jwt = useSelector((state: any) => state.auth.jwt);
  return getAxios(jwt);
};
