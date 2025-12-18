// app/reduxStore/reduxSlices/authSlice.tsx
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import ApiClient from "../../api/ApiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setBankStatusCompleted, setBankStatusPending } from "@/app/utils/storage";

interface LoginData {
  email: string;
  password: string;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiId?: string;
  isVerified: boolean;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  hostelName: string;
  role?: string;
  bankDetails?: BankDetails;
  // Add other user properties as needed
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  tokens: Tokens;
  user: User;
  role: string;
}

interface RefreshTokenResponse {
  success: boolean;
  message: string;
  tokens: Tokens;
  user: User;
  role: string;
}

interface InitializeAuthPayload {
  token: string;
  refreshToken: string;
  user: User;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  fullName: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  userId: null,
  role: null,
  isAuthenticated: false,
  isInitialized: false,
  fullName: null
};

// Login thunk
// inside authSlice.tsx — replace existing login thunk
export const login = createAsyncThunk<
  LoginResponse,
  LoginData,
  { rejectValue: string }
>(
  "auth/login",
  async (data: LoginData, { rejectWithValue }) => {
    try {
      console.log("🔐 Attempting login with:", data.email);
      const response = await ApiClient.post<LoginResponse>("/auth/login", data);

      // IMPORTANT: server should return { success: boolean, ... }
      if (!response || response.success === false) {
        const message = (response && (response as any).message) || "Invalid credentials";
        console.log("❌ Login api returned success:false ->", message);
        return rejectWithValue(message);
      }

      console.log("✅ Login response received (success)");
      return response;
    } catch (error: any) {
      console.log("❌ Login error details:", error);
      let errorMessage = "Login failed, try again";

      if (error.message?.includes("Network Error") || error.code === "NETWORK_ERROR") {
        errorMessage = "Cannot connect to server. Please check your internet connection and server URL.";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Request timeout. Please try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);


// Refresh token thunk
export const refreshToken = createAsyncThunk<
  RefreshTokenResponse, // Return type
  void, // No argument type
  { rejectValue: string } // Reject value type
>(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      console.log('🔄 Attempting token refresh');
      const response = await ApiClient.post<RefreshTokenResponse>("/auth/refresh-token", {
        refreshToken,
      });
      console.log('✅ Token refresh successful');
      return response;
    } catch (error: any) {
      console.log('❌ Refresh token error:', error);

      let errorMessage = "Token refresh failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Initialize auth from storage
export const initializeAuth = createAsyncThunk<
  InitializeAuthPayload | null, // Return type
  void, // No argument type
  { rejectValue: string } // Reject value type
>(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Initializing auth from storage...');

      const [token, refreshToken, user] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("refreshToken"),
        AsyncStorage.getItem("user"),
      ]);

      console.log('📦 Retrieved from storage:', {
        token: token ? 'Present' : 'Missing',
        refreshToken: refreshToken ? 'Present' : 'Missing',
        user: user ? 'Present' : 'Missing'
      });

      if (token && refreshToken && user) {
        const userData: User = JSON.parse(user);
        console.log('✅ Restoring authenticated state');
        return {
          token,
          refreshToken,
          user: userData,
          role: userData?.role || 'hostelOwner',
        };
      }

      console.log('ℹ️ No stored auth data found');
      return null;
    } catch (error) {
      console.log('❌ Error initializing auth:', error);
      return rejectWithValue("Failed to initialize auth");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      state.userId = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isInitialized = true;

      // Clear AsyncStorage
      AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      console.log('🚪 User logged out - storage cleared');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        const { user, tokens, role } = action.payload;

        console.log("✅ Login successful, storing tokens and user data");

        state.user = user;
        state.token = tokens.accessToken;
        state.refreshToken = tokens.refreshToken;
        state.role = role;
        state.userId = user?._id || null;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.fullName = user?.fullName || "owner";

        // Store tokens + user
        if (tokens.accessToken && tokens.refreshToken) {
          AsyncStorage.multiSet([
            ["token", tokens.accessToken],
            ["refreshToken", tokens.refreshToken],
            ["user", JSON.stringify(user)],
          ])
            .then(() => {
              console.log("💾 All auth data stored in AsyncStorage");
            })
            .catch((error) => {
              console.error("❌ Error storing auth data:", error);
            });
        }

        // Important: set bank status based on user.bankDetails
        try {
          const bd = (user as any)?.bankDetails;
          const hasBank =
            bd &&
            (bd.accountNumber || bd.ifscCode || bd.accountHolderName) &&
            (bd.isVerified === true || bd.isVerified === "true");
          if (hasBank) {
            setBankStatusCompleted();
            console.log("🏦 Bank status set to completed (login)");
          } else {
            setBankStatusPending();
            console.log("🏦 Bank status set to pending (login)");
          }
        } catch (e) {
          console.warn("Error determining bank status after login", e);
          setBankStatusPending();
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isInitialized = true;
        console.log('❌ Login rejected:', action.payload);
      })

      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<RefreshTokenResponse>) => {
        const { tokens } = action.payload;
        state.token = tokens.accessToken;
        state.refreshToken = tokens.refreshToken;

        console.log('🔄 Token refreshed successfully');

        // Update tokens in AsyncStorage
        AsyncStorage.multiSet([
          ['token', tokens.accessToken],
          ['refreshToken', tokens.refreshToken],
        ]).then(() => {
          console.log('💾 Updated tokens stored in AsyncStorage');
        });
      })
      .addCase(refreshToken.rejected, (state, action) => {
        // If refresh fails, logout user
        console.log('❌ Token refresh failed, logging out:', action.payload);
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.role = null;
        state.userId = null;
        state.isInitialized = true;

        AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      })

      // Initialize auth cases
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action: PayloadAction<InitializeAuthPayload | null>) => {
        state.loading = false;
        state.isInitialized = true;

        if (action.payload) {
          const { token, refreshToken, user, role } = action.payload;
          state.token = token;
          state.refreshToken = refreshToken;
          state.user = user;
          state.userId = user?._id || null;
          state.role = role;
          state.isAuthenticated = true;
          console.log("✅ Auth initialized from storage - User is authenticated");

          // Determine bank status from stored user
          try {
            const bd = (user as any)?.bankDetails;
            const hasBank =
              bd &&
              (bd.accountNumber || bd.ifscCode || bd.accountHolderName) &&
              (bd.isVerified === true || bd.isVerified === "true");
            if (hasBank) {
              setBankStatusCompleted();
              console.log("🏦 Bank status set to completed (init)");
            } else {
              setBankStatusPending();
              console.log("🏦 Bank status set to pending (init)");
            }
          } catch (e) {
            console.warn("Error checking bank status on init", e);
            setBankStatusPending();
          }
        } else {
          state.isAuthenticated = false;
          console.log("✅ Auth initialized - No user data found");
          // ensure bank status pending/cleared for non-authenticated users
          setBankStatusPending();
        }
      })

      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        console.log('❌ Auth initialization failed:', action.payload);
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;