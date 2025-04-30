import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Initial date calculation (current month in 'YYYY-MM' format)
const currentDate = new Date();
const initialDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

interface MonthState {
  month: string; // Format: 'YYYY-MM'
}

// Initial state for the month
const initialState: MonthState = {
  month: initialDate,
};

// Create the slice
const monthSlice = createSlice({
  name: 'month',
  initialState,
  reducers: {
    // Reducer to change the month
    changeMonth(state, action: PayloadAction<string>) {
      state.month = action.payload; // Update the month with the payload
    },
  },
});

// Export the action and reducer
export const { changeMonth } = monthSlice.actions;
export default monthSlice.reducer;
