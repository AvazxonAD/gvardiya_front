import { useNavigate } from "react-router-dom";
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
        return {
          ...(await response.json()),
          success: false,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: String(error),
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
