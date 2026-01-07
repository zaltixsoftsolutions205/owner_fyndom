import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { bankService } from "../../api/bankService";
import Toast from "react-native-toast-message";

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiId?: string;
  isVerified: boolean;
}

interface BankState {
  bankDetails: BankDetails | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  currentHostelId: string | null;
}

const initialState: BankState = {
  bankDetails: null,
  loading: false,
  error: null,
  saving: false,
  currentHostelId: null,
};

// Thunk to set bank details for a specific approved hostel
export const setBankDetailsForHostel = createAsyncThunk(
  'bank/setForHostel',
  async ({ hostelId, bankData }: { hostelId: string; bankData: Omit<BankDetails, 'isVerified'> }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const user = state.auth.user;
      
      // Check if hostel is approved
      if (!bankService.isHostelApproved(user, hostelId)) {
        throw new Error('Cannot set bank details. Hostel is not approved');
      }

      // Validate bank details before sending
      const validation = bankService.validateBankDetails(bankData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await bankService.setBankDetails(hostelId, bankData);
      return {
        ...response.data.bankDetails,
        hostelId: response.data.hostelId,
        hostelName: response.data.hostelName
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to set bank details');
    }
  }
);

// Thunk to fetch bank details for a specific approved hostel
export const fetchBankDetailsForHostel = createAsyncThunk(
  'bank/fetchForHostel',
  async (hostelId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const user = state.auth.user;
      
      // Check if hostel is approved
      if (!bankService.isHostelApproved(user, hostelId)) {
        throw new Error('Cannot view bank details. Hostel is not approved');
      }

      const response = await bankService.getBankDetails(hostelId);
      return {
        ...response.data.bankDetails,
        hostelId: response.data.hostelId,
        hostelName: response.data.hostelName
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bank details');
    }
  }
);

// Thunk to get approved hostels
export const getApprovedHostels = createAsyncThunk(
  'bank/getApprovedHostels',
  async (_, { getState }) => {
    const state = getState() as any;
    const user = state.auth.user;
    return bankService.getApprovedHostels(user);
  }
);

const bankSlice = createSlice({
  name: 'bank',
  initialState,
  reducers: {
    setBankDetails: (state, action: PayloadAction<BankDetails>) => {
      state.bankDetails = action.payload;
    },
    clearBankDetails: (state) => {
      state.bankDetails = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentHostel: (state, action: PayloadAction<string>) => {
      state.currentHostelId = action.payload;
    },
    resetBankState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Set bank details for hostel
      .addCase(setBankDetailsForHostel.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(setBankDetailsForHostel.fulfilled, (state, action) => {
        state.saving = false;
        state.bankDetails = action.payload;
        state.currentHostelId = action.payload.hostelId;
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Bank details set successfully!',
        });
      })
      .addCase(setBankDetailsForHostel.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: action.payload as string || 'Failed to set bank details',
        });
      })
      // Fetch bank details for hostel
      .addCase(fetchBankDetailsForHostel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankDetailsForHostel.fulfilled, (state, action) => {
        state.loading = false;
        state.bankDetails = action.payload;
        state.currentHostelId = action.payload.hostelId;
      })
      .addCase(fetchBankDetailsForHostel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setBankDetails, 
  clearBankDetails, 
  clearError, 
  setCurrentHostel,
  resetBankState 
} = bankSlice.actions;
export default bankSlice.reducer;