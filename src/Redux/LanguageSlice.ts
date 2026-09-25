import { createSlice } from "@reduxjs/toolkit";
import { getErrorMessage, humanizeErrorText } from "@/lib/errorMessage";

// Xato xabari bo'sh, Error obyekti yoki axios'ning xom matni
// ("Request failed with status code 400") bo'lib ekranga chiqmasin
const errorText = (text: unknown) => {
  if (typeof text === "string" && text.trim()) return humanizeErrorText(text);
  if (text == null || typeof text !== "object" || "message" in text || "response" in text) {
    return getErrorMessage(text);
  }
  return text; // JSX
};

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
      // `open: false` — yopish so'rovi (bo'sh xato oynasi ochilmasin)
      if (payload.open === false) {
        state.alert = { text: "", success: false, open: false };
        return;
      }
      state.alert = {
        text: payload.success ? payload.text : errorText(payload.text),
        success: payload.success,
        open: true,
      };
    },
    setClose: (state) => {
      state.alert = { text: "", success: false, open: false };
    },
  },
});
export const { putLan, setClose, alertt } = LanguageSlice.actions;
export default LanguageSlice.reducer;
