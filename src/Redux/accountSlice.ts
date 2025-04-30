/** @format */

import { createSlice } from "@reduxjs/toolkit";

interface accountType {
  account_number_id: number | null;
  account_number: string | null;
}
const initialState: accountType = JSON.parse(
  //@ts-ignore
  localStorage.getItem("account")
) || {
  account_number_id: null,
  account_number: null,
};
const accountSlice = createSlice({
  name: "account",
  initialState: initialState,
  reducers: {
    changeAccountNumber: (state, { payload }) => {
      state.account_number_id = payload.id;
      state.account_number = payload.number;
    },
    // changeAccountData: (state, { payload }) => {
    //   state.account_number: payload
    // }
    removeAccountNumber: (state) => {
      state.account_number_id = null;
      state.account_number = null;
    },
  },
});
export const { changeAccountNumber, removeAccountNumber } =
  accountSlice.actions;
export default accountSlice.reducer;
