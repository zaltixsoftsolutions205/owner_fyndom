// app/reduxStore/reduxSlices/pricingSlice.tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import PricingApi, { GetPricingResponse, OrganizedPricing } from "../../api/pricingApi";
import { SHARING_OPTIONS } from "../../api/pricingApi";
import { RootState } from "../store/store";

interface PricingItem {
  price: number;
  currency: string;
  isSet: boolean;
}

interface PricingState {
  organizedPricing: OrganizedPricing | null;
  rawData: any[];
  summary: Array<{
    sharing: string;
    daily: number;
    monthly: number;
  }>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  currentHostelId: string | null;
}

const initialState: PricingState = {
  organizedPricing: null,
  rawData: [],
  summary: [],
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
  currentHostelId: null,
};

// Thunk to fetch pricing for a hostel
export const fetchPricing = createAsyncThunk(
  "pricing/fetchPricing",
  async (hostelId: string, { rejectWithValue }) => {
    try {
      const response = await PricingApi.getPricing(hostelId);
      return {
        data: response.data,
        hostelId,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pricing"
      );
    }
  }
);

// Thunk to set pricing
export const setPricing = createAsyncThunk(
  "pricing/setPricing",
  async (
    payload: {
      hostelId: string;
      sharingType: string;
      durationType: string;
      price: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await PricingApi.setPricing(payload);
      return {
        response,
        payload,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to set pricing"
      );
    }
  }
);

const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    clearPricingError: (state) => {
      state.error = null;
    },
    clearPricingSuccess: (state) => {
      state.successMessage = null;
    },
    resetPricing: (state) => {
      Object.assign(state, initialState);
    },
    setCurrentHostelId: (state, action) => {
      state.currentHostelId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch pricing cases
    builder
      .addCase(fetchPricing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPricing.fulfilled, (state, action) => {
        state.loading = false;
        state.organizedPricing = action.payload.data.organized;
        state.rawData = action.payload.data.rawData;
        state.summary = action.payload.data.summary;
        state.currentHostelId = action.payload.hostelId;
      })
      .addCase(fetchPricing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Set pricing cases
    builder
      .addCase(setPricing.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(setPricing.fulfilled, (state, action) => {
        state.saving = false;
        state.successMessage = action.payload.response.message;
        
        // Update local state with new price
        const { sharingType, durationType, price } = action.payload.payload;
        const durationKey = durationType.toLowerCase();
        
        if (state.organizedPricing && state.organizedPricing[sharingType]) {
          state.organizedPricing[sharingType][durationKey] = {
            price,
            currency: "INR",
            isSet: true,
          };
        }
      })
      .addCase(setPricing.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearPricingError,
  clearPricingSuccess,
  resetPricing,
  setCurrentHostelId,
} = pricingSlice.actions;

// Selectors
export const selectOrganizedPricing = (state: RootState) =>
  state.pricing.organizedPricing;

export const selectPricingSummary = (state: RootState) =>
  state.pricing.summary;

export const selectPriceForSharing = (
  state: RootState,
  sharingType: string,
  durationType: string
) => {
  const organized = state.pricing.organizedPricing;
  if (!organized || !organized[sharingType]) return 0;
  
  const durationKey = durationType.toLowerCase();
  return organized[sharingType][durationKey]?.price || 0;
};

export const selectIsPriceSet = (
  state: RootState,
  sharingType: string,
  durationType: string
) => {
  const organized = state.pricing.organizedPricing;
  if (!organized || !organized[sharingType]) return false;
  
  const durationKey = durationType.toLowerCase();
  return organized[sharingType][durationKey]?.isSet || false;
};

export const selectPricingLoading = (state: RootState) =>
  state.pricing.loading;

export const selectPricingSaving = (state: RootState) =>
  state.pricing.saving;

export const selectPricingError = (state: RootState) =>
  state.pricing.error;

export const selectPricingSuccessMessage = (state: RootState) =>
  state.pricing.successMessage;

export default pricingSlice.reducer;