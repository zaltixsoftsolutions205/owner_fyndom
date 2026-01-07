// app/reduxStore/reduxSlices/hostelSlice.tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ApiClient from "../../api/ApiClient";
import { RootState } from "../store/store";

interface Hostel {
  hostelId: string;
  _id: string;
  hostelName: string;
  hostelType: string;
  govtRegistrationId: string;
  fullAddress: string;
  status: string;
  isActive: boolean;
  // Add other fields as needed
}

export const fetchHostels = createAsyncThunk(
  "hostel/fetchHostels",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.userId;
      
      const response = await ApiClient.get(`/hostels/owner/${userId}`);
      return response.data.hostels || [];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch hostels");
    }
  }
);

const hostelSlice = createSlice({
  name: "hostel",
  initialState: {
    hostels: [] as Hostel[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHostels.fulfilled, (state, action) => {
        state.loading = false;
        state.hostels = action.payload;
      })
      .addCase(fetchHostels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default hostelSlice.reducer;