// app/reduxStore/reduxSlices/hostelSummarySlice.tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import HostelOperationsApi from "../../api/hostelOperationsApi";
import { RootState } from "../store/store";

interface HostelSummaryState {
  summary: string;
  loading: boolean;
  error: string | null;
  success: boolean;
  currentHostelId: string | null;
}

const initialState: HostelSummaryState = {
  summary: "",
  loading: false,
  error: null,
  success: false,
  currentHostelId: null,
};

// Async thunk to set hostel summary
export const setHostelSummary = createAsyncThunk<
  any,
  { hostelId: string; summary: string },
  { rejectValue: string }
>(
  "hostelSummary/setSummary",
  async ({ hostelId, summary }, { rejectWithValue, getState }) => {
    try {
      // Get current state to check if we need to use selected hostel
      const state = getState() as RootState;
      const finalHostelId = hostelId || state.auth.selectedHostelId;
      
      if (!finalHostelId) {
        return rejectWithValue("No hostel selected");
      }
      
      const response = await HostelOperationsApi.setSummary({ 
        hostelId: finalHostelId, 
        summary 
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to save summary");
    }
  }
);

// Async thunk to get hostel summary
export const getHostelSummary = createAsyncThunk<
  any,
  string | undefined,
  { rejectValue: string; state: RootState }
>(
  "hostelSummary/getSummary",
  async (hostelId, { rejectWithValue, getState }) => {
    try {
      // If hostelId is not provided, use the selected hostel from auth state
      const state = getState();
      const finalHostelId = hostelId || state.auth.selectedHostelId;
      
      if (!finalHostelId) {
        return rejectWithValue("No hostel selected");
      }
      
      const response = await HostelOperationsApi.getSummary(finalHostelId);
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
    clearSummary: (state) => {
      state.summary = "";
      state.success = false;
      state.error = null;
      state.currentHostelId = null;
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
        state.summary = action.payload.data?.summary || "";
        state.currentHostelId = action.payload.data?.hostelId || null;
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
        state.currentHostelId = action.payload.data?.hostelId || null;
        state.error = null;
      })
      .addCase(getHostelSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess, setSummaryLocal, clearSummary } = hostelSummarySlice.actions;
export default hostelSummarySlice.reducer;