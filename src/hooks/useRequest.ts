import { URL } from "@/api";
import axios, { AxiosInstance } from "axios";
import { useSelector } from "react-redux";
import { getValidAccessToken, refreshAccessToken } from "@/services/tokenManager";

const getAxios = (jwt: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: URL,
    headers: { Authorization: "Bearer " + jwt },
  });

  // Proactive: swap in a fresh token on each outgoing request if the stored one
  // is about to expire.
  instance.interceptors.request.use(async (config) => {
    const token = await getValidAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = "Bearer " + token;
    }
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
      return Promise.reject(error);
    },
  );

  return instance;
};
export const useRequest = (): AxiosInstance => {
  const jwt = useSelector((state: any) => state.auth.jwt);
  return getAxios(jwt);
};
