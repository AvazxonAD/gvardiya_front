import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DateState {
  startDate: string;
  endDate: string;
}

// Calculate the initial default dates
const today = new Date();
const initialStartDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
const initialEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  .toISOString()
  .slice(0, 10);

  const def = JSON.parse(localStorage.getItem("standartDate") ?? "{}");
   
// Initial state
const initialState: DateState = 
(def?.startDate ? def : undefined )
|| {
  startDate: initialStartDate,
  endDate: initialEndDate,
};

// Create the slice
const dateSlice = createSlice({
  name: 'default_dates',
  initialState,
  reducers: {
    changeDefaultDate(
      state,
      action: PayloadAction<Partial<DateState>> // Accept partial updates
    ) {
      if (action.payload.startDate) {
        state.startDate = action.payload.startDate;
      }
      if (action.payload.endDate) {
        state.endDate = action.payload.endDate;
      }
    },
  },
});

// Export the action and reducer
export const { changeDefaultDate } = dateSlice.actions;
export default dateSlice.reducer;
