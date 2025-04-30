import { configureStore } from "@reduxjs/toolkit";
import accountSlice from "./accountSlice";
import apiSlice from "./apiSlice";
import darklightmode from "./colorSwitcher";
import DateReducer from "./dateSlice";
import LanguageSlice from "./LanguageSlice";
import adminMonitoringReducer from "./monitoringSlice";
import monthReducer from "./monthSlice";

const store = configureStore({
  reducer: {
    auth: apiSlice,
    lan: LanguageSlice,
    account: accountSlice,
    theme: darklightmode,
    adminMonitoring: adminMonitoringReducer,
    defaultDate: DateReducer,
    month: monthReducer
    },
});


export { store };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

