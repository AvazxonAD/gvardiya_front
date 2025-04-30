/** @format */

import { createSlice } from "@reduxjs/toolkit";
//@ts-ignore
const userData = JSON.parse(localStorage.getItem("user"));
const initialState = {
  jwt:
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("token")
      : "out",
  //@ts-ignore
  user: userData?.user || {
    id: 1,
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
  },
};
const apiSlice = createSlice({
  name: "api",
  initialState: initialState,
  reducers: {
    putJwt: (state, { payload }) => {
      state.jwt = payload;
    },
    setUserData: (state, { payload }) => {
      state.user = payload.user;
    },
    giveUserData: (state, { payload }) => {
      state.user = payload.user;
    },
  },
});
export const { putJwt, giveUserData, setUserData } = apiSlice.actions;
export default apiSlice.reducer;
