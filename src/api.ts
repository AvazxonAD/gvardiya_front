/** @format */

import { handleStatus } from "./utils";

// const isProd = import.meta.env.PROD;
// const port: any = window.location.port;

export const URL = 'https://gvardiya.smartbase.uz/api'
// isProd
// ? port == 5173
//   ? `https://gvardiya.smartbase.uz/api`
//   : `https://${window.location.hostname}/api`
// : `https://gvardiya.smartbase.uz/api`;

export const jwt = localStorage.getItem("token");

export const loginAuth = async (login: any, password: any) => {
  const res = await fetch(URL + "/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }),
  });

  const data = await res.json();
  if (data.success) {
    sessionStorage.setItem("token", data.data.token);
  }

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const updateAuth = async (value: any, JWT: any) => {
  const res = await fetch(URL + "/auth", {
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

export const getWorkers = async (
  JWT: any,
  page: any,
  limet: any,
  id: any,
  search: any
) => {
  const res = await fetch(
    URL +
    `/worker?page=${page}&limit=${limet}${id > 0 ? "&batalon_id=" + id : ""}${search.length > 0 ? "&search=" + search : ""
    }`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getBatalonWorkers = async (
  JWT: any,
  page: any,
  limet: any,
  search: any
) => {
  const res = await fetch(
    URL +
    `/batalon/worker?page=${page}&limit=${limet}${search.length > 0 ? "&search=" + search : ""
    }`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getTasks = async (
  JWT: any,
  page: any,
  limet: any,
  from: any,
  to: any,
  search: any,
  status: any
) => {
  const res = await fetch(
    URL +
    `/batalon/tasks?page=${page}&limit=${limet}&from=${from}&to=${to}${search.length > 0 ? "&search=" + search : ""}${status.length > 0 ? "&status=" + status : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getExcel = async (JWT: any, url: any) => {
  const res = await fetch(URL + url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + JWT,
      "Content-Type": "application/json",
    },
  });

  const data = await res.blob();
  return data;
};

export const getWorkersSearch = async (JWT: any, page: any, name: any) => {
  const res = await fetch(
    URL + `/worker?page=${page}&limit=10&search=${name}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const deleteWorker = async (JWT: any, id: any) => {
  const res = await fetch(URL + `/worker/${id}`, {
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
  const res = await fetch(URL + `/batalon/worker/${id}`, {
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
  const res = await fetch(
    URL + `/contract/${id}?account_number_id=${account_id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getSpr = async (
  JWT: any,
  path: any,
  isWorkerTabBatalon?: boolean | null
) => {
  let url =
    URL +
    `/${path}${path === "batalon" && isWorkerTabBatalon ? "?birgada=false" : ""
    }`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};
export const getOrgan = async (JWT: any, page: any, limit?: number) => {
  const res = await fetch(
    URL + `/organization?page=${page}&limit=${limit || 10}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getAllOrgans = async (JWT: any, page?: any, limet?: any) => {
  const res = await fetch(
    URL +
    `/organization?page=${page ? page : 1}&limit=${limet ? limet : 10000}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getSearch = async (
  JWT: any,
  page: any,
  search: any,
  limet?: any
) => {
  const res = await fetch(
    URL + `/organization?page=${page}&limit=${limet || 20}&search=${search}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

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
  batalon_id: number
) => {
  const batalonParam = batalon_id > 0 ? `&batalon_id=${batalon_id}` : "";
  const res = await fetch(
    URL +
    `/contract/?from=${date.date1}&to=${date.date2
    }&page=${page}&limit=${limet}${search.length > 0 ? "&search=" + search : ""
    }&account_number_id=${account_number}${batalonParam}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getSingleCont = async (
  JWT: string,
  id: string,
  account_number_id: string
) => {
  const res = await fetch(
    URL + `/contract/` + id + "?account_number_id=" + account_number_id,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};
export const postCont = async (
  JWT: any,
  datas?: any,
  account_number_id?: any
) => {
  const res = await fetch(
    URL + `/contract?account_number_id=${account_number_id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
      body: JSON.stringify(datas),
    }
  );
  const data = await res.json();
  return { ...data, message: data?.message || handleStatus(res.status) };
};
export const putCont = async (
  JWT: any,
  id: string,
  account_number_id: number,
  datas?: any
) => {
  const res = await fetch(
    URL + "/contract/" + id + "?account_number_id=" + account_number_id,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
      body: JSON.stringify(datas),
    }
  );
  const data = await res.json();
  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getBat = async (JWT: any) => {
  const res = await fetch(URL + `/batalon`, {
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
  const res = await fetch(URL + `/batalon/` + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getByDate = async (
  JWT: any,
  page: any,
  date: any,
  account_number_id: any
) => {
  const res = await fetch(
    URL +
    `/contract/?from=${date.date1}&to=${date.date2}&page=${page}&limit=10&account_number_id=${account_number_id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};
export const getOrganId = async (JWT: any, id: any) => {
  const res = await fetch(URL + `/organization/${id}`, {
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
  const res = await fetch(URL + `/batalon/${id}`, {
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
  const res = await fetch(URL + `/worker/${id}`, {
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
  const res = await fetch(URL + `/batalon/worker/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + JWT,
    },
  });

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getContractId = async (
  JWT: any,
  id: any,
  account_number: string
) => {
  const res = await fetch(
    URL + `/contract/${id}?account_number_id=${account_number}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const getWorkerBat = async (JWT: any, page: any, id: any) => {
  const res = await fetch(
    URL + `/worker?page=${page}&limit=10&batalon_id=${id} `,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + JWT,
      },
    }
  );

  const data = await res.json();

  return { ...data, message: data?.message || handleStatus(res.status) };
};

export const updateSpr = async (value: any, JWT: any, path: any, text: any) => {
  const res = await fetch(URL + "/" + path, {
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

export const updateSpr2 = async (value: any, JWT: any) => {
  const res = await fetch(URL + "/bank", {
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
  const res = await fetch(URL + "/organization/" + id, {
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
  const res = await fetch(URL + "/batalon/" + id, {
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
  const res = await fetch(URL + "/worker/" + id, {
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
  const res = await fetch(URL + "/batalon/worker/" + id, {
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
  const res = await fetch(URL + `/account/${id}`, {
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
  const res = await fetch(URL + `/organization/${id}`, {
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
  const res = await fetch(URL + "/account", {
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
  const res = await fetch(URL + "/contract/pay/" + id, {
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
  const res = await fetch(URL + "/worker", {
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
  const res = await fetch(URL + "/batalon/worker", {
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
  const res = await fetch(URL + "/batalon", {
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

export const CreateOrgn = async (value: any, JWT: any) => {
  const res = await fetch(URL + "/organization", {
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
