import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const AdminMonitoring = createSlice({
  name: "admin_monitoring",
  initialState: {
    item: undefined as number | undefined,
  },
  reducers: {
    setItem: (state, action: PayloadAction<number | undefined>) => {
      state.item = action.payload;
    },
  },
});

export const { setItem } = AdminMonitoring.actions;
export default AdminMonitoring.reducer;
