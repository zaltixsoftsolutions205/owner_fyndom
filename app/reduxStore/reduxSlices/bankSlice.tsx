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
}

const initialState: BankState = {
  bankDetails: null,
  loading: false,
  error: null,
  saving: false,
};

// Thunk to update bank details
export const updateBankDetails = createAsyncThunk(
  'bank/update',
  async (bankData: Omit<BankDetails, 'isVerified'>, { rejectWithValue }) => {
    try {
      // Validate bank details before sending
      const validation = bankService.validateBankDetails(bankData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await bankService.createUpdateBankDetails(bankData);
      return response.data.bankDetails;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update bank details');
    }
  }
);

// Thunk to fetch bank details (from user data)
export const fetchBankDetails = createAsyncThunk(
  'bank/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const user = state.auth.user;
      
      if (user?.bankDetails) {
        return user.bankDetails;
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bank details');
    }
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
  },
  extraReducers: (builder) => {
    builder
      // Update bank details
      .addCase(updateBankDetails.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateBankDetails.fulfilled, (state, action) => {
        state.saving = false;
        state.bankDetails = action.payload;
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Bank details updated successfully!',
        });
      })
      .addCase(updateBankDetails.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: action.payload as string || 'Failed to update bank details',
        });
      })
      // Fetch bank details
      .addCase(fetchBankDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.bankDetails = action.payload;
      })
      .addCase(fetchBankDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setBankDetails, clearBankDetails, clearError } = bankSlice.actions;
export default bankSlice.reducer;