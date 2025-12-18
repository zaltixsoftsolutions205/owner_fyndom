import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import HostelOperationsApi from "../../api/hostelOperationsApi";

interface HostelSummaryState {
  summary: string;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: HostelSummaryState = {
  summary: "",
  loading: false,
  error: null,
  success: false,
};

// Async thunk to set hostel summary
export const setHostelSummary = createAsyncThunk(
  "hostelSummary/setSummary",
  async (summary: string, { rejectWithValue }) => {
    try {
      const response = await HostelOperationsApi.setSummary({ summary });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to save summary");
    }
  }
);

// Async thunk to get hostel summary
export const getHostelSummary = createAsyncThunk(
  "hostelSummary/getSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await HostelOperationsApi.getSummary();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch summary");
    }
  }
);

const hostelSummarySlice = createSlice({
  name: "hostelSummary",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setSummaryLocal: (state, action) => {
      state.summary = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Set Summary
      .addCase(setHostelSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(setHostelSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.summary = action.payload.data?.summary || state.summary;
        state.error = null;
      })
      .addCase(setHostelSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Get Summary
      .addCase(getHostelSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHostelSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.data?.summary || "";
        state.error = null;
      })
      .addCase(getHostelSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess, setSummaryLocal } = hostelSummarySlice.actions;
export default hostelSummarySlice.reducer;