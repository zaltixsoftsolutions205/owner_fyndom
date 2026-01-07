// app/reduxStore/reduxSlices/facilitiesSlice.tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import HostelOperationsApi, {
  SetFacilitiesByHostelRequest,
  GetFacilitiesResponse
} from "../../../app/api/hostelOperationsApi";
import { RootState } from "../store/store";

interface FacilitiesData {
  hostelId: string;
  hostelName: string;
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
  allHostelsFacilities: Record<string, FacilitiesData>; // hostelId -> facilities
}

const initialState: FacilitiesState = {
  loading: false,
  error: null,
  success: false,
  facilities: null,
  allHostelsFacilities: {},
};


// In facilitiesSlice.tsx, update the setFacilities thunk:
export const setFacilities = createAsyncThunk(
  "facilities/setFacilities",
  async (data: SetFacilitiesByHostelRequest, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux: Setting facilities for hostel:", data.hostelId);

      const response = await HostelOperationsApi.setFacilities(data);

      console.log("✅ Redux: Facilities set successfully:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Redux: Set facilities error:", {
        message: error.message,
        data: error.response?.data
      });

      // Return specific error message
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to set facilities"
      );
    }
  }
);

// Async thunk for getting facilities for a specific hostel
export const getFacilities = createAsyncThunk(
  "facilities/getFacilities",
  async (hostelId: string, { rejectWithValue }) => {
    try {
      if (!hostelId) {
        return rejectWithValue("Hostel ID is required");
      }

      const response = await HostelOperationsApi.getFacilities(hostelId);
      return { hostelId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get facilities");
    }
  }
);

// Async thunk for getting all hostels facilities
export const getAllHostelsFacilities = createAsyncThunk(
  "facilities/getAllHostelsFacilities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await HostelOperationsApi.getAllHostelsFacilities();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get all hostels facilities");
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
    // Update facilities for a specific hostel locally
    updateLocalFacilities: (state, action) => {
      const { hostelId, ...facilitiesData } = action.payload;
      state.facilities = { hostelId, ...facilitiesData };

      // Also update in allHostelsFacilities
      if (hostelId) {
        state.allHostelsFacilities[hostelId] = { hostelId, ...facilitiesData };
      }
    },
    // Set active hostel facilities
    setActiveHostelFacilities: (state, action) => {
      const hostelId = action.payload;
      if (state.allHostelsFacilities[hostelId]) {
        state.facilities = state.allHostelsFacilities[hostelId];
      } else {
        state.facilities = null;
      }
    },
    // Clear all hostels facilities
    clearAllHostelsFacilities: (state) => {
      state.allHostelsFacilities = {};
      state.facilities = null;
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

        if (action.payload.data) {
          state.facilities = action.payload.data;
          // Also store in allHostelsFacilities
          if (action.payload.data.hostelId) {
            state.allHostelsFacilities[action.payload.data.hostelId] = action.payload.data;
          }
        }
        state.error = null;
      })
      .addCase(setFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Get Facilities for specific hostel
      .addCase(getFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFacilities.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.data) {
          const facilitiesData = {
            hostelId: action.payload.hostelId,
            ...action.payload.data
          };

          state.facilities = facilitiesData;

          // Store in allHostelsFacilities
          state.allHostelsFacilities[action.payload.hostelId] = facilitiesData;
        }

        state.error = null;
      })
      .addCase(getFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get All Hostels Facilities
      .addCase(getAllHostelsFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllHostelsFacilities.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.data?.hostels) {
          // Store all hostels facilities in the map
          action.payload.data.hostels.forEach((hostel: any) => {
            if (hostel.hostelId && hostel.facilities) {
              state.allHostelsFacilities[hostel.hostelId] = {
                hostelId: hostel.hostelId,
                hostelName: hostel.hostelName,
                ...hostel.facilities
              };
            }
          });
        }

        state.error = null;
      })
      .addCase(getAllHostelsFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  resetFacilitiesState,
  updateLocalFacilities,
  setActiveHostelFacilities,
  clearAllHostelsFacilities
} = facilitiesSlice.actions;

// Selectors
export const selectFacilitiesForHostel = (state: RootState, hostelId: string) =>
  state.facilities.allHostelsFacilities[hostelId];

export const selectActiveFacilities = (state: RootState) =>
  state.facilities.facilities;

export const selectAllHostelsFacilities = (state: RootState) =>
  state.facilities.allHostelsFacilities;

export default facilitiesSlice.reducer;