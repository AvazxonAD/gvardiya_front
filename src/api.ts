/** @format */

import { handleStatus } from "./utils";
import { authFetch as fetchWithAuth, setTokens } from "./services/tokenManager";
import { getErrorMessage } from "./lib/errorMessage";

export const URL = import.meta.env.VITE_API_URL;

/**
 * Shu fayldagi barcha so'rovlar shu orqali. Tarmoq xatosi (server o'chiq,
 * internet yo'q) va JSON bo'lmagan xato javobi (nginx 502/413 sahifasi)
 * istisno emas — aniq `message` li JSON javobga aylanadi. Aks holda
 * `res.json()` yiqilib, foydalanuvchi hech qanday xabar ko'rmasdi.
 */
const authFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const failure = (status: number, message: string) =>
    new Response(JSON.stringify({ success: false, message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  let res: Response;
  try {
    res = await fetchWithAuth(input, init);
  } catch (error) {
    return failure(503, getErrorMessage(error));
  }

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  if (res.ok || isJson) return res;
  return failure(res.status, getErrorMessage({ response: { status: res.status } }));
};

/**
 * Ro'yxat so'rovlariga qo'shimcha parametrlar (saralash, yangi filtrlar):
 * `extra` — "&sort_by=...&sort_dir=..." ko'rinishida. URL da `?` bo'lmasa
 * o'zi qo'yiladi.
 */
const appendQuery = (url: string, extra = "") => {
  const q = extra.replace(/^[?&]+/, "");
  return q ? url + (url.includes("?") ? "&" : "?") + q : url;
};

export const jwt = localStorage.getItem("token");

export const loginAuth = async (login: any, password: any) => {
  const res = await authFetch(URL + "/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }),
  });

  const data = await res.json();
  if (data.success) {
    const access = data.data.accessToken || data.data.token;
    // requires_eimzo javobida token bo'lmaydi — 2-bosqichda beriladi
    if (access) {
      setTokens(access, data.data.refreshToken, data.data.refreshExpiresAt);
    }
  }

  return { ...data, message: data?.message || handleStatus(res.status) };
};

// Login 2-bosqich: E-IMZO imzosini yuborib token olish
export const loginEimzoAuth = async (login_token: string, pkcs7_64: string) => {
  const res = await authFetch(URL + "/auth/eimzo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login_token, pkcs7_64 }),
  });

  const data = await res.json();
  if (data.success) {
    const access = data.data.accessToken || data.data.token;
    if (access) {
      setTokens(access, data.data.refreshToken, data.data.refreshExpiresAt);
    }
  }

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const updateAuth = async (value: any, JWT: any) => {
  const res = await authFetch(URL + "/auth", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getWorkers = async (JWT: any, page: any, limet: any, id: any, search: any, extra: string = "") => {
  const res = await authFetch(appendQuery(URL + `/worker?page=${page}&limit=${limet}${id > 0 ? "&batalon_id=" + id : ""}${search.length > 0 ? "&search=" + encodeURIComponent(search) : ""}`, extra),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    },
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getBatalonWorkers = async (JWT: any, page: any, limet: any, search: any, extra: string = "") => {
  const res = await authFetch(appendQuery(URL + `/batalon/worker?page=${page}&limit=${limet}${search.length > 0 ? "&search=" + encodeURIComponent(search) : ""}`, extra), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getTasks = async (JWT: any, page: any, limet: any, from: any, to: any, search: any, status: any, extra: string = "") => {
  const res = await authFetch(appendQuery(URL +
      `/batalon/tasks?page=${page}&limit=${limet}&from=${from}&to=${to}${search.length > 0 ? "&search=" + encodeURIComponent(search) : ""}${status.length > 0 ? "&status=" + status : ""}`, extra),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    },
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getExcel = async (JWT: any, url: any) => {
  const res = await authFetch(URL + url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + JWT,
      "Content-Type": "application/json",
    },
  });

  // Xato javobi fayl bo'lib yuklanib ketmasin — server matni bilan to'xtaydi
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage({ response: { status: res.status, data: body } }));
  }

  const data = await res.blob();
  return data;
};

export const getWorkersSearch = async (JWT: any, page: any, name: any) => {
  const res = await authFetch(URL + `/worker?page=${page}&limit=10&search=${encodeURIComponent(name)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const deleteWorker = async (JWT: any, id: any) => {
  const res = await authFetch(URL + `/worker/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const deleteBatalonWorker = async (JWT: any, id: any) => {
  const res = await authFetch(URL + `/batalon/worker/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const deleteCont = async (JWT: any, id: any, account_id: number) => {
  const res = await authFetch(URL + `/contract/${id}?account_number_id=${account_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getSpr = async (JWT: any, path: any, isWorkerTabBatalon?: boolean | null, extra: string = "") => {
  let url = URL + `/${path}${path === "batalon" && isWorkerTabBatalon ? "?birgada=false" : ""}`;
  const res = await authFetch(appendQuery(url, extra), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};
export const getOrgan = async (JWT: any, page: any, limit?: number, extra: string = "") => {
  const res = await authFetch(appendQuery(URL + `/organization?page=${page}&limit=${limit || 10}`, extra), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getAllOrgans = async (JWT: any, page?: any, limet?: any) => {
  const res = await authFetch(URL + `/organization?page=${page ? page : 1}&limit=${limet ? limet : 10000}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getSearch = async (JWT: any, page: any, search: any, limet?: any, extra: string = "") => {
  const res = await authFetch(appendQuery(URL + `/organization?page=${page}&limit=${limet || 20}&search=${encodeURIComponent(search)}`, extra), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getCont = async (
  JWT: any,
  date: any,
  page: any,
  limet: any,
  search: any,
  account_number: string,
  batalon_id: number,
  status: string = "",
  statusSumma: string = "",
  rasxodStatus: string = "",
  extra: string = "",
) => {
  const batalonParam = batalon_id > 0 ? `&batalon_id=${batalon_id}` : "";
  const statusParam = status ? `&status=${status}` : "";
  const statusSummaParam = statusSumma ? `&status-summa=${statusSumma}` : "";
  const rasxodStatusParam = rasxodStatus ? `&rasxod-status=${rasxodStatus}` : "";
  const res = await authFetch(appendQuery(URL +
      `/contract/?from=${date.date1}&to=${date.date2}&page=${page}&limit=${limet}${search.length > 0 ? "&search=" + encodeURIComponent(search) : ""}&account_number_id=${account_number}${batalonParam}${statusParam}${statusSummaParam}${rasxodStatusParam}`, extra),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    },
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getSingleCont = async (JWT: string, id: string, account_number_id: string) => {
  const res = await authFetch(URL + `/contract/` + id + "?account_number_id=" + account_number_id, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};
export const postCont = async (JWT: any, datas?: any, account_number_id?: any) => {
  const res = await authFetch(URL + `/contract?account_number_id=${account_number_id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify(datas),
  });
  const data = await res.json();
  return { ...data, message: data?.message || handleStatus(res.status) };
};
export const putCont = async (JWT: any, id: string, account_number_id: number, datas?: any) => {
  const res = await authFetch(URL + "/contract/" + id + "?account_number_id=" + account_number_id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify(datas),
  });
  const data = await res.json();
  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getBat = async (JWT: any, extra: string = "") => {
  const res = await authFetch(appendQuery(URL + `/batalon`, extra), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getDEl = async (JWT: any, id: any) => {
  const res = await authFetch(URL + `/batalon/` + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getByDate = async (JWT: any, page: any, date: any, account_number_id: any) => {
  const res = await authFetch(URL + `/contract/?from=${date.date1}&to=${date.date2}&page=${page}&limit=10&account_number_id=${account_number_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};
export const getOrganId = async (JWT: any, id: any) => {
  const res = await authFetch(URL + `/organization/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getBatID = async (JWT: any, id: any) => {
  const res = await authFetch(URL + `/batalon/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getWorkerId = async (JWT: any, id: any) => {
  const res = await authFetch(URL + `/worker/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getBatalonWorkerId = async (JWT: any, id: any) => {
  const res = await authFetch(URL + `/batalon/worker/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getContractId = async (JWT: any, id: any, account_number: string) => {
  const res = await authFetch(URL + `/contract/${id}?account_number_id=${account_number}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getWorkerBat = async (JWT: any, page: any, id: any) => {
  const res = await authFetch(URL + `/worker?page=${page}&limit=10&batalon_id=${id} `, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const updateSpr = async (value: any, JWT: any, path: any, text: any) => {
  const res = await authFetch(URL + "/" + path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ [text]: value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

/**
 * Ikkita maydonli ma'lumotnomalar (Bank: bank+mfo, Ijrochi: doer+title).
 * Ikkala maydon ham bitta so'rovda yuboriladi — server tomonda Joi
 * ularni birga talab qiladi.
 *
 * Ilgari bu funksiya faqat `/bank` ga qotirilgan edi (`updateSpr2`), shu
 * sabab Ijrochi uchun ishlatib bo'lmasdi va u yerdan faqat `doer`
 * yuborilardi — natijada server "title is required" deb rad etardi.
 */
export const updateSprPair = async (value: any, JWT: any, path: string) => {
  const res = await authFetch(URL + "/" + path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const updateSpr2 = async (value: any, JWT: any) => {
  const res = await authFetch(URL + "/bank", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};
export const updateOrgn = async (value: any, JWT: any, id: any) => {
  const res = await authFetch(URL + "/organization/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const updateBat = async (value: any, JWT: any, id: any) => {
  const res = await authFetch(URL + "/batalon/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const updateWorker = async (value: any, JWT: any, id: any) => {
  const res = await authFetch(URL + "/worker/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const updateBatalonWorker = async (value: any, JWT: any, id: any) => {
  const res = await authFetch(URL + "/batalon/worker/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const DeleteSpr = async (JWT: any, id: any) => {
  const res = await authFetch(URL + `/account/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const DeleteOrgan = async (JWT: any, id: any) => {
  const res = await authFetch(URL + `/organization/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const CreateAcount = async (value: any, JWT: any) => {
  const res = await authFetch(URL + "/account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ account_number: value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const PayCont = async (value: any, JWT: any, id: any) => {
  const res = await authFetch(URL + "/contract/pay/" + id, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};
export const CreateWorker = async (value: any, JWT: any) => {
  const res = await authFetch(URL + "/worker", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const CreateBatalonWorker = async (value: any, JWT: any) => {
  const res = await authFetch(URL + "/batalon/worker", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const CreateBatalon = async (value: any, JWT: any) => {
  const res = await authFetch(URL + "/batalon", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify({ ...value }),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const sendContractToLawyer = async (JWT: any, id: number) => {
  const res = await authFetch(URL + `/contract/${id}/send-lawyer`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });
  const data = await res.json();
  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const CreateOrgn = async (value: any, JWT: any) => {
  const res = await authFetch(URL + "/organization", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
    body: JSON.stringify(value),
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};
