import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/lib/errorMessage";
import { authFetch, clearTokens, getAccessToken, getRefreshToken } from "./tokenManager";

export const baseUri = import.meta.env.VITE_API_URL;

const useApi = () => {
  const navigate = useNavigate();
  const handleUnauthorized = () => {
    clearTokens();
    localStorage.removeItem("user");
    navigate("/login");
  };

  type ReturnType<Q> = {
    success: boolean | number;
    message: string;
    data: Q;
    /** Xatoda `message` bilan bir xil (ko'p sahifa `res.error` ni o'qiydi) */
    error?: string;
  };

  type RequestOptions<T> = {
    endpoint: string;
    method?: string;
    data?: T | FormData;
    formData?: boolean;
  };

  const request = async <T>({ endpoint, method = "GET", data, formData = false }: RequestOptions<T>): Promise<ReturnType<T> | null> => {
    const headers: Record<string, string> = {};

    if (!formData) headers["Content-Type"] = "application/json";

    if (!getAccessToken() && !getRefreshToken()) {
      navigate("/login");
    }

    const options: RequestInit = { method, headers };

    if (data) {
      options.body = formData ? (data as FormData) : JSON.stringify(data);
    }

    try {
      const response = await authFetch(baseUri + `/${endpoint}`, options);

      if (response.status === 401) {
        handleUnauthorized();
        return null;
      }

      if (!response.ok || (response.status !== 200 && response.status !== 201)) {
        // JSON bo'lmagan javob (nginx 502/413 sahifasi) ham aniq matn olsin
        const body = await response.json().catch(() => null);
        const message = getErrorMessage({ response: { status: response.status, data: body } });
        return {
          ...(body ?? {}),
          success: false,
          message,
          // Backend `error` maydonini yubormaydi, lekin ko'p sahifa
          // `res.error` ni o'qiydi — o'sha ham server matnini ko'rsatsin
          error: message,
        };
      }

      return await response.json();
    } catch (error) {
      // Tarmoq uzilgan / server o'chiq: "TypeError: Failed to fetch" emas
      const message = getErrorMessage(error);
      return {
        success: false,
        message,
        error: message,
        data: null as T,
      };
    }
  };

  // GET so'rovi
  const get = async <T>(endpoint: string): Promise<ReturnType<T> | null> => {
    return await request<T>({ endpoint, method: "GET" });
  };

  // POST so'rovi
  const post = async <T>(endpoint: string, data: any, formData?: boolean): Promise<ReturnType<T> | null> => {
    return await request<T>({ endpoint, method: "POST", data, formData });
  };

  // DELETE so'rovi
  const remove = async <T>(endpoint: string): Promise<ReturnType<T> | null> => {
    return await request<T>({ endpoint, method: "DELETE" });
  };

  // UPDATE (PUT) so'rovi
  const update = async <T>(endpoint: string, data: any, formData?: boolean): Promise<ReturnType<T> | null> => {
    return await request<T>({ endpoint, method: "PUT", data, formData });
  };

  return { get, post, remove, update };
};

export default useApi;
