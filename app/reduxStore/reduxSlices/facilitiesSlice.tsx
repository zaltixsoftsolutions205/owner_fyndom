// app/reduxStore/reduxSlices/facilitiesSlice.tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import HostelOperationsApi, { SetFacilitiesRequest } from "../../../app/api/hostelOperationsApi";

interface FacilitiesData {
  sharingTypes: string[];
  bathroomTypes: string[];
  essentials: string[];
  foodServices: string[];
  customFoodMenu?: string;
}

interface FacilitiesState {
  loading: boolean;
  error: string | null;
  success: boolean;
  facilities: FacilitiesData | null;
}

const initialState: FacilitiesState = {
  loading: false,
  error: null,
  success: false,
  facilities: null,
};

// Async thunk for setting facilities
export const setFacilities = createAsyncThunk(
  "facilities/setFacilities",
  async (data: SetFacilitiesRequest, { rejectWithValue }) => {
    try {
      const response = await HostelOperationsApi.setFacilities(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to set facilities");
    }
  }
);

// Async thunk for getting facilities
export const getFacilities = createAsyncThunk(
  "facilities/getFacilities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await HostelOperationsApi.getFacilities();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get facilities");
    }
  }
);

const facilitiesSlice = createSlice({
  name: "facilities",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetFacilitiesState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    // Add this to update facilities locally
    updateLocalFacilities: (state, action) => {
      state.facilities = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Set Facilities
      .addCase(setFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(setFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.facilities = action.payload.data || null;
        state.error = null;
      })
      .addCase(setFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Get Facilities
      .addCase(getFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities = action.payload.data || null;
        state.error = null;
      })
      .addCase(getFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess, resetFacilitiesState, updateLocalFacilities } = facilitiesSlice.actions;
export default facilitiesSlice.reducer;