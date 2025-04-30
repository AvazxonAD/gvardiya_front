import { createSlice } from "@reduxjs/toolkit";

const theme =
  typeof window !== "undefined" && localStorage?.getItem("theme")
    ? localStorage.getItem("theme")
    : null;
const state = theme ? theme : "light";

const themeSlice = createSlice({
  name: "theme",
  initialState: state,
  reducers: {
    colorSwitcher: (state) => {
      const newTheme = state === "light" ? "dark" : "light";
      return newTheme;
    },
  },
});

export const { colorSwitcher } = themeSlice.actions;

export default themeSlice.reducer;
