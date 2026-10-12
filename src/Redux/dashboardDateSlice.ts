import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Dashboard davri — umumiy `defaultDate` dan alohida. Dashboard odatda yil
 * boshidan (1-yanvar) joriy oy oxirigacha ko'rsatadi; bu yerdagi o'zgarish
 * shartnomalar, kirim/chiqim kabi sahifalarning sanasiga ta'sir qilmaydi.
 *
 * Tanlangan oraliq shu brauzer tabi sessiyasida saqlanadi (`Utilsprovider`):
 * til almashganda sahifa qayta yuklanadi — davr yo'qolmasin. Qayta kirishda
 * (yangi tab, chiqib-kirish) yana yil boshidan.
 */
export interface DashboardDateState {
  startDate: string;
  endDate: string;
}

export const DASHBOARD_DATE_KEY = "dashboardDate";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Mahalliy sana bo'yicha: `toISOString()` UTC ga o'tkazadi va Toshkentda
// (UTC+5) oy oxiri bir kun oldinga surilib qolardi (31.10 o'rniga 30.10)
const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const initialState = (): DashboardDateState => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DASHBOARD_DATE_KEY) ?? "null");
    if (ISO_DATE.test(saved?.startDate) && ISO_DATE.test(saved?.endDate)) {
      return { startDate: saved.startDate, endDate: saved.endDate };
    }
  } catch {
    // Buzilgan qiymat — standart davr
  }

  const today = new Date();
  return {
    startDate: toIso(new Date(today.getFullYear(), 0, 1)),
    endDate: toIso(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
  };
};

const dashboardDateSlice = createSlice({
  name: "dashboard_dates",
  initialState,
  reducers: {
    changeDashboardDate(state, action: PayloadAction<Partial<DashboardDateState>>) {
      if (action.payload.startDate) state.startDate = action.payload.startDate;
      if (action.payload.endDate) state.endDate = action.payload.endDate;
    },
  },
});

export const { changeDashboardDate } = dashboardDateSlice.actions;
export default dashboardDateSlice.reducer;
