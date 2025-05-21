import { useNavigate } from "react-router-dom";

// const isProd = import.meta.env.PROD;
// const port: any = window.location.port;

export const baseUri = 'https://gvardiya.smartbase.uz/api';
// isProd
// ? port == 5173
//   ? `https://gvardiya.smartbase.uz/api`
//   : `https://${window.location.hostname}/api`
// : `https://gvardiya.smartbase.uz/api`;

const useApi = () => {
  const navigate = useNavigate();
  const handleUnauthorized = () => {
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
    data?: T | FormData; // Data turi JSON yoki FormData bo'lishi mumkin.
    formData?: boolean;
  };

  const request = async <T>({
    endpoint,
    method = "GET",
    data,
    formData = false,
  }: RequestOptions<T>): Promise<ReturnType<T> | null> => {
    const headers: HeadersInit = {};

    // FormData bo'lmasa Content-Type JSON formatida bo'ladi
    if (!formData) {
      headers["Content-Type"] = "application/json";
    }

    const loggedUser = sessionStorage.getItem("token");
    if (!loggedUser) {
      navigate("/login");
    }

    const token = loggedUser;

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    // FormData yoki JSON sifatida data qo'shiladi
    if (data) {
      options.body = formData ? (data as FormData) : JSON.stringify(data);
    }

    try {
      const response = await fetch(baseUri + `/${endpoint}`, options);

      if (response.status === 401) {
        handleUnauthorized();
        return null;
      }

      if (
        !response.ok ||
        (response.status !== 200 && response.status !== 201)
      ) {
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
  const post = async <T>(
    endpoint: string,
    data: any,
    formData?: boolean
  ): Promise<ReturnType<T> | null> => {
    return await request<T>({ endpoint, method: "POST", data, formData });
  };

  // DELETE so'rovi
  const remove = async <T>(endpoint: string): Promise<ReturnType<T> | null> => {
    return await request<T>({ endpoint, method: "DELETE" });
  };

  // UPDATE (PUT) so'rovi
  const update = async <T>(
    endpoint: string,
    data: any,
    formData?: boolean
  ): Promise<ReturnType<T> | null> => {
    return await request<T>({ endpoint, method: "PUT", data, formData });
  };

  return { get, post, remove, update };
};

export default useApi;
