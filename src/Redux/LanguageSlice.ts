import { createSlice } from "@reduxjs/toolkit";

const LanguageSlice = createSlice({
  name: "language",
  initialState: {
    type: "uz",
    alert: { text: "", success: false, open: false },
  },
  reducers: {
    putLan: (state, { payload }) => {
      state.type = payload;
    },
    alertt: (state, { payload }) => {
      state.alert = { text: payload.text, success: payload.success, open: true };
    },
    setClose: (state) => {
      state.alert = { text: "", success: false, open: false };
    },
  },
});
export const { putLan, setClose, alertt } = LanguageSlice.actions;
export default LanguageSlice.reducer;
