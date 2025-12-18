import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reduxSlices/authSlice";
import bankReducer from "../reduxSlices/bankSlice"; // Make sure this import exists
import roomReducer from "../reduxSlices/roomSlice";  
import facilitiesReducer from "../reduxSlices/facilitiesSlice";
import hostelSummaryReducer from "../reduxSlices/hostelSummarySlice";
import forgotPasswordReducer from "../reduxSlices/forgotPasswordSlice";
import studentHostelReducer from "../reduxSlices/studentHostelSlice";
import bookingsReducer from "../reduxSlices/bookingsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bank: bankReducer, // This line must exist
    rooms: roomReducer,
    facilities: facilitiesReducer,
    hostelSummary: hostelSummaryReducer,
    forgotPassword: forgotPasswordReducer,
    studentHostel: studentHostelReducer,
    bookings: bookingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;