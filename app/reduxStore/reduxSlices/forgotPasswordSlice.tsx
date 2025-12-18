// app/reduxStore/reduxSlices/forgotPasswordSlice.tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ApiClient from "../../api/ApiClient";

interface ForgotPasswordState {
  loading: boolean;
  error: string | null;
  success: boolean;
  step: 'email' | 'otp' | 'reset' | 'success';
  email: string;
}

const initialState: ForgotPasswordState = {
  loading: false,
  error: null,
  success: false,
  step: 'email',
  email: '',
};

// Send OTP for password reset
export const sendResetOTP = createAsyncThunk(
  "forgotPassword/sendResetOTP",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await ApiClient.post("/auth/forgot-password", { email });
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  "forgotPassword/verifyOTP",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await ApiClient.post("/auth/verify-otp", { email, otp });
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid OTP"
      );
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "forgotPassword/resetPassword",
  async ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await ApiClient.post("/auth/reset-password", {
        email,
        otp,
        newPassword
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.step = 'email';
      state.email = '';
    }
  },
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendResetOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendResetOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.step = 'otp';
        state.email = action.meta.arg;
      })
      .addCase(sendResetOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Verify OTP
    .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.step = 'reset';
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Reset Password
    .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.step = 'success';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setStep, setEmail, resetState } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;