// app/reduxStore/reduxSlices/forgotPasswordSlice.tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ApiClient from "../../api/ApiClient";

interface ForgotPasswordState {
  loading: boolean;
  error: string | null;
  success: boolean;
  step: 'email' | 'otp' | 'reset' | 'success';
  email: string;
  resetToken?: string;
}

const initialState: ForgotPasswordState = {
  loading: false,
  error: null,
  success: false,
  step: 'email',
  email: '',
  resetToken: undefined,
};

// In forgotPasswordSlice.tsx, update the thunks to use helper methods:

// Send OTP for password reset
export const sendResetOTP = createAsyncThunk(
  "forgotPassword/sendResetOTP",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log('📤 Sending reset OTP for email:', email);

      // Use the helper method
      const response = await ApiClient.sendForgotPasswordOTP(email.trim());

      console.log('✅ OTP response:', response);

      if (response.success) {
        return { email: email.trim() };
      } else {
        return rejectWithValue(response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error('❌ OTP send error:', error);

      let errorMessage = "Failed to send OTP. Please try again.";

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = "Request timeout. Please check your internet connection.";
      } else if (error.message?.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please check your connection and server URL.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (!error.response) {
        errorMessage = "No response from server. Please check if server is running.";
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  "forgotPassword/verifyOTP",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      console.log('🔍 Verifying OTP:', { email, otp });

      // Use the helper method
      const response = await ApiClient.verifyForgotPasswordOTP(email.trim(), otp.trim());

      console.log('✅ OTP verification response:', response);

      if (response.success) {
        return {
          email: email.trim(),
          resetToken: response.data?.resetToken,
        };
      } else {
        return rejectWithValue(response.message || "Invalid OTP");
      }
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);

      let errorMessage = "Failed to verify OTP";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "forgotPassword/resetPassword",
  async (
    { email, resetToken, newPassword }: {
      email: string;
      resetToken: string;
      newPassword: string
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('🔄 Resetting password for:', email);

      // Use the helper method
      const response = await ApiClient.resetPasswordWithToken({
        email: email.trim(),
        resetToken: resetToken.trim(),
        newPassword: newPassword.trim()
      });

      console.log('✅ Password reset response:', response);

      if (response.success) {
        return response;
      } else {
        return rejectWithValue(response.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error('❌ Password reset error:', error);

      let errorMessage = "Failed to reset password";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      return rejectWithValue(errorMessage);
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
    resetState: () => {
      return initialState;
    },
    setResetToken: (state, action) => {
      state.resetToken = action.payload;
    },
    // Add a reset step reducer
    goBackStep: (state) => {
      if (state.step === 'otp') {
        state.step = 'email';
        state.error = null;
      } else if (state.step === 'reset') {
        state.step = 'otp';
        state.error = null;
      } else if (state.step === 'success') {
        state.step = 'email';
        state.error = null;
        state.email = '';
        state.resetToken = undefined;
      }
    }
  },
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendResetOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendResetOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.step = 'otp';
        state.email = action.payload.email;
        console.log('✅ OTP sent successfully');
      })
      .addCase(sendResetOTP.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        console.log('❌ OTP send failed:', action.payload);
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.step = 'reset';
        state.resetToken = action.payload.resetToken;
        console.log('✅ OTP verified successfully, token stored:', action.payload.resetToken);
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        console.log('❌ OTP verification failed:', action.payload);
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.step = 'success';
        console.log('✅ Password reset successfully');
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        console.log('❌ Password reset failed:', action.payload);
      });
  },
});

export const {
  clearError,
  setStep,
  setEmail,
  resetState,
  setResetToken,
  goBackStep
} = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;