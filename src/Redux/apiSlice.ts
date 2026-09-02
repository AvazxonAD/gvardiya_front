/** @format */

import { createSlice } from "@reduxjs/toolkit";

/** Foydalanuvchi ma'lumoti bo'lmaganda ishlatiladigan bo'sh andoza */
const EMPTY_USER = {
  id: 0,
  login: "",
  fio: "",
  account_number: "",
  doer_name: "",
  boss_name: "",
  adress: "",
  bank_name: "",
  mfo: "",
  str: "",
  region_id: "",
  region_name: "",
};

/**
 * localStorage'dagi userni xavfsiz o'qiydi.
 *
 * Ilgari bu yer `JSON.parse(localStorage.getItem("user"))` edi — qiymat
 * buzilgan bo'lsa modul yuklanishida istisno tashlanib, ilova umuman
 * ochilmasdi.
 */
function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw)?.user ?? null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

/** Haqiqiy foydalanuvchimi yoki bo'sh andozami */
export function isRealUser(user: any): boolean {
  return Boolean(user && (user.login || user.id));
}

const initialState = {
  jwt:
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("token")
      : "out",
  user: readStoredUser() || EMPTY_USER,
};

const apiSlice = createSlice({
  name: "api",
  initialState,
  reducers: {
    putJwt: (state, { payload }) => {
      state.jwt = payload;
    },
    setUserData: (state, { payload }) => {
      // Bo'sh javob kelib qolsa mavjud foydalanuvchi o'chib ketmasin
      if (isRealUser(payload?.user)) state.user = payload.user;
    },
    giveUserData: (state, { payload }) => {
      if (isRealUser(payload?.user)) state.user = payload.user;
    },
    clearUserData: (state) => {
      state.user = EMPTY_USER;
    },
  },
});

export const { putJwt, giveUserData, setUserData, clearUserData } =
  apiSlice.actions;
export default apiSlice.reducer;
