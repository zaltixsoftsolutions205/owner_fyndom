// app/reduxStore/store/store.tsx
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reduxSlices/authSlice";
import bankReducer from "../reduxSlices/bankSlice";
import roomReducer from "../reduxSlices/roomSlice";
import facilitiesReducer from "../reduxSlices/facilitiesSlice";
import hostelSummaryReducer from "../reduxSlices/hostelSummarySlice";
import forgotPasswordReducer from "../reduxSlices/forgotPasswordSlice";
import studentHostelReducer from "../reduxSlices/studentHostelSlice";
import bookingsReducer from "../reduxSlices/bookingsSlice";
import hostelReducer from "../reduxSlices/hostelSlice";
import pricingReducer from "../reduxSlices/pricingSlice"; // Make sure this is imported

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bank: bankReducer,
    rooms: roomReducer,
    facilities: facilitiesReducer,
    hostelSummary: hostelSummaryReducer,
    forgotPassword: forgotPasswordReducer,
    studentHostel: studentHostelReducer,
    bookings: bookingsReducer,
    hostel: hostelReducer,
    pricing: pricingReducer, // Make sure this line exists
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;