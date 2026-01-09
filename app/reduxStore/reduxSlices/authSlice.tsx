// // app/reduxStore/reduxSlices/authSlice.tsx
// import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import ApiClient from "../../api/ApiClient";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { setBankStatusCompleted, setBankStatusPending } from "@/app/utils/storage";

// interface LoginData {
//   email: string;
//   password: string;
// }

// interface BankDetails {
//   accountHolderName: string;
//   accountNumber: string;
//   ifscCode: string;
//   bankName: string;
//   branchName: string;
//   upiId?: string;
//   isVerified: boolean;
// }

// interface HostelDocument {
//   _id: string;
//   filename: string;
//   originalName: string;
//   url: string;
//   uploadDate: string;
// }

// interface Hostel {
//   hostelId: string;
//   _id: string;
//   hostelName: string;
//   hostelType: string;
//   govtRegistrationId: string;
//   fullAddress: string;
//   status: string;
//   isActive: boolean;
//   rejectionReason?: string;
//   createdAt: string;
//   approvedAt?: string;
//   approvedBy?: string;
//   documents: HostelDocument[];
// }

// interface ActiveHostel {
//   hostelId: string;
//   hostelName: string;
//   hostelType: string;
// }

// interface User {
//   _id: string;
//   fullName: string;
//   email: string;
//   mobileNumber: string;
//   hostelName?: string;
//   role?: string;
//   bankDetails?: BankDetails;
//   hostels?: Hostel[];
//   activeHostel?: ActiveHostel;
//   isActive?: boolean;
//   status?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   ownerId?: string;
//   mobile?: string;
//   hostelsSummary?: {
//     total: number;
//     approved: number;
//     pending: number;
//     rejected: number;
//   };
//   profile?: {
//     totalHostels: number;
//     maxHostels: number;
//     profileComplete: boolean;
//   };
//   activeSince?: string;
// }

// interface Tokens {
//   accessToken: string;
//   refreshToken: string;
//   expiresIn: string;
//   tokenType?: string;
// }

// interface LoginResponseData {
//   tokens: Tokens;
//   user: User;
//   role: string;
//   permissions?: string[];
// }

// interface LoginResponse {
//   success: boolean;
//   message: string;
//   data?: LoginResponseData;
//   tokens?: Tokens;
//   user?: User;
//   role?: string;
// }

// interface RefreshTokenResponse {
//   success: boolean;
//   message: string;
//   tokens: Tokens;
//   user: User;
//   role: string;
// }

// interface InitializeAuthPayload {
//   token: string;
//   refreshToken: string;
//   user: User;
//   role: string;
// }

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   refreshToken: string | null;
//   loading: boolean;
//   error: string | null;
//   userId: string | null;
//   role: string | null;
//   isAuthenticated: boolean;
//   isInitialized: boolean;
//   fullName: string | null;
//   hostels: Hostel[];
//   selectedHostelId: string | null;
// }

// const initialState: AuthState = {
//   user: null,
//   token: null,
//   refreshToken: null,
//   loading: false,
//   error: null,
//   userId: null,
//   role: null,
//   isAuthenticated: false,
//   isInitialized: false,
//   fullName: null,
//   hostels: [],
//   selectedHostelId: null
// };

// // Helper function to get selected hostel ID from storage
// const getSelectedHostelIdFromStorage = async (): Promise<string | null> => {
//   try {
//     return await AsyncStorage.getItem('selectedHostelId');
//   } catch (error) {
//     console.error('Error getting selected hostel from storage:', error);
//     return null;
//   }
// };

// // Helper function to set selected hostel ID in storage
// const setSelectedHostelIdInStorage = async (hostelId: string): Promise<void> => {
//   try {
//     await AsyncStorage.setItem('selectedHostelId', hostelId);
//   } catch (error) {
//     console.error('Error setting selected hostel in storage:', error);
//   }
// };

// // Helper function to save auth data to storage
// const saveAuthDataToStorage = async (
//   token: string, 
//   refreshToken: string, 
//   user: User,
//   selectedHostelId?: string
// ): Promise<void> => {
//   try {
//     const items: [string, string][] = [
//       ['token', token],
//       ['refreshToken', refreshToken],
//       ['user', JSON.stringify(user)],
//     ];
    
//     if (selectedHostelId) {
//       items.push(['selectedHostelId', selectedHostelId]);
//     }
    
//     await AsyncStorage.multiSet(items);
//     console.log('💾 Auth data saved to storage');
//   } catch (error) {
//     console.error('Error saving auth data to storage:', error);
//   }
// };

// // Helper function to clear auth data from storage
// const clearAuthDataFromStorage = async (): Promise<void> => {
//   try {
//     await AsyncStorage.multiRemove(['token', 'refreshToken', 'user', 'selectedHostelId']);
//     console.log('🗑️ Auth data cleared from storage');
//   } catch (error) {
//     console.error('Error clearing auth data from storage:', error);
//   }
// };

// // Login thunk
// export const login = createAsyncThunk<
//   LoginResponse,
//   LoginData,
//   { rejectValue: string }
// >(
//   "auth/login",
//   async (data: LoginData, { rejectWithValue }) => {
//     try {
//       console.log("🔐 Attempting login with:", data.email);
//       const response = await ApiClient.post<LoginResponse>("/auth/login", data);

//       if (!response || response.success === false) {
//         const message = (response && (response as any).message) || "Invalid credentials";
//         console.log("❌ Login api returned success:false ->", message);
//         return rejectWithValue(message);
//       }

//       console.log("✅ Login response received (success)");
//       return response;
//     } catch (error: any) {
//       // console.log("❌ Login error details:", error);
//       let errorMessage = "Login failed, try again";

//       if (error.message?.includes("Network Error") || error.code === "NETWORK_ERROR") {
//         errorMessage = "Cannot connect to server. Please check your internet connection and server URL.";
//       } else if (error.message?.includes("timeout")) {
//         errorMessage = "Request timeout. Please try again.";
//       } else if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       }

//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// // Refresh token thunk
// export const refreshToken = createAsyncThunk<
//   RefreshTokenResponse,
//   void,
//   { rejectValue: string }
// >(
//   "auth/refreshToken",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("🔄 Attempting token refresh");
      
//       const refreshToken = await AsyncStorage.getItem("refreshToken");
//       if (!refreshToken) {
//         throw new Error("No refresh token available");
//       }

//       const response = await ApiClient.post<RefreshTokenResponse>("/auth/refresh-token", {
//         refreshToken,
//       });
//       console.log('✅ Token refresh successful');
      
//       return response;
//     } catch (error: any) {
//       console.log('❌ Refresh token error:', error);

//       let errorMessage = "Token refresh failed";
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       }

//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// // Initialize auth from storage
// export const initializeAuth = createAsyncThunk<
//   InitializeAuthPayload & { selectedHostelId?: string },
//   void,
//   { rejectValue: string }
// >(
//   "auth/initialize",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log('🔄 Initializing auth from storage...');

//       const [token, refreshToken, user, selectedHostelId] = await Promise.all([
//         AsyncStorage.getItem("token"),
//         AsyncStorage.getItem("refreshToken"),
//         AsyncStorage.getItem("user"),
//         getSelectedHostelIdFromStorage(),
//       ]);

//       console.log('📦 Retrieved from storage:', {
//         token: token ? 'Present' : 'Missing',
//         refreshToken: refreshToken ? 'Present' : 'Missing',
//         user: user ? 'Present' : 'Missing',
//         selectedHostelId: selectedHostelId ? 'Present' : 'Missing'
//       });

//       if (token && refreshToken && user) {
//         const userData: User = JSON.parse(user);
//         console.log('✅ Restoring authenticated state');
        
//         return {
//           token,
//           refreshToken,
//           user: userData,
//           role: userData?.role || 'hostelOwner',
//           selectedHostelId: selectedHostelId || undefined,
//         };
//       }

//       console.log('ℹ️ No stored auth data found');
//       throw new Error("No stored auth data");
//     } catch (error) {
//       console.log('❌ Error initializing auth:', error);
//       return rejectWithValue("Failed to initialize auth");
//     }
//   }
// );

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout: (state) => {
//       // Clear state
//       Object.assign(state, {
//         ...initialState,
//         isInitialized: true,
//       });
      
//       // Clear storage (fire and forget)
//       clearAuthDataFromStorage();
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     selectHostel: (state, action: PayloadAction<string>) => {
//       state.selectedHostelId = action.payload;
//       // Save to storage (fire and forget)
//       setSelectedHostelIdInStorage(action.payload);
//     },
//     updateHostels: (state, action: PayloadAction<Hostel[]>) => {
//       state.hostels = action.payload;
//       // If no hostel is selected and we have hostels, select the first one
//       if (!state.selectedHostelId && action.payload.length > 0) {
//         state.selectedHostelId = action.payload[0].hostelId;
//         setSelectedHostelIdInStorage(action.payload[0].hostelId);
//       }
//     },
//     updateUser: (state, action: PayloadAction<Partial<User>>) => {
//       if (state.user) {
//         state.user = { ...state.user, ...action.payload };
//         // Update storage (fire and forget)
//         if (state.token && state.refreshToken) {
//           saveAuthDataToStorage(state.token, state.refreshToken, state.user, state.selectedHostelId || undefined);
//         }
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Login cases
//       .addCase(login.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
//         state.loading = false;
        
//         // Handle both response formats
//         let user: User;
//         let tokens: Tokens;
//         let role: string;
//         let hostels: Hostel[] = [];

//         if (action.payload.data) {
//           // New format: response.data contains everything
//           user = action.payload.data.user;
//           tokens = action.payload.data.tokens;
//           role = action.payload.data.role;
//           hostels = action.payload.data.user.hostels || [];
//         } else {
//           // Old format: direct properties
//           user = action.payload.user!;
//           tokens = action.payload.tokens!;
//           role = action.payload.role!;
//           hostels = action.payload.user?.hostels || [];
//         }

//         console.log("✅ Login successful");

//         // Update state
//         state.user = user;
//         state.token = tokens.accessToken;
//         state.refreshToken = tokens.refreshToken;
//         state.role = role;
//         state.userId = user?._id || null;
//         state.isAuthenticated = true;
//         state.isInitialized = true;
//         state.fullName = user?.fullName || "owner";
//         state.hostels = hostels;
        
//         // Determine selected hostel
//         let selectedHostelId: string | null = null;
//         if (hostels.length > 0) {
//           const activeHostelId = user.activeHostel?.hostelId;
//           selectedHostelId = activeHostelId || hostels[0].hostelId;
//           state.selectedHostelId = selectedHostelId;
//         }

//         // Save to storage (fire and forget)
//         saveAuthDataToStorage(
//           tokens.accessToken, 
//           tokens.refreshToken, 
//           user, 
//           selectedHostelId || undefined
//         );

//         // Set bank status
//         try {
//           const bd = user?.bankDetails;
//           const hasBank =
//             bd &&
//             (bd.accountNumber || bd.ifscCode || bd.accountHolderName) &&
//             (bd.isVerified === true || bd.isVerified === "true");
//           if (hasBank) {
//             setBankStatusCompleted();
//             console.log("🏦 Bank status set to completed (login)");
//           } else {
//             setBankStatusPending();
//             console.log("🏦 Bank status set to pending (login)");
//           }
//         } catch (e) {
//           console.warn("Error determining bank status after login", e);
//           setBankStatusPending();
//         }
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//         state.isAuthenticated = false;
//         state.isInitialized = true;
//         // console.log('❌ Login rejected:', action.payload);
//       })

//       // Refresh token cases
//       .addCase(refreshToken.fulfilled, (state, action: PayloadAction<RefreshTokenResponse>) => {
//         const { tokens, user } = action.payload;
        
//         // Update state
//         state.token = tokens.accessToken;
//         state.refreshToken = tokens.refreshToken;
//         state.user = user;
//         state.hostels = user?.hostels || [];

//         console.log('🔄 Token refreshed successfully');

//         // Update storage (fire and forget)
//         saveAuthDataToStorage(
//           tokens.accessToken, 
//           tokens.refreshToken, 
//           user, 
//           state.selectedHostelId || undefined
//         );
//       })
//       .addCase(refreshToken.rejected, (state, action) => {
//         console.log('❌ Token refresh failed, logging out:', action.payload);
        
//         // Clear state
//         Object.assign(state, {
//           ...initialState,
//           isInitialized: true,
//           error: action.payload as string,
//         });

//         // Clear storage (fire and forget)
//         clearAuthDataFromStorage();
//       })

//       // Initialize auth cases
//       .addCase(initializeAuth.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(initializeAuth.fulfilled, (state, action) => {
//         state.loading = false;
//         state.isInitialized = true;

//         const { token, refreshToken, user, role, selectedHostelId } = action.payload;
        
//         // Update state
//         state.token = token;
//         state.refreshToken = refreshToken;
//         state.user = user;
//         state.userId = user?._id || null;
//         state.role = role;
//         state.isAuthenticated = true;
//         state.hostels = user?.hostels || [];
        
//         // Handle selected hostel
//         if (selectedHostelId && state.hostels.some(h => h.hostelId === selectedHostelId)) {
//           state.selectedHostelId = selectedHostelId;
//         } else if (state.hostels.length > 0) {
//           // Select the first hostel by default
//           state.selectedHostelId = state.hostels[0].hostelId;
//           // Save to storage (fire and forget)
//           setSelectedHostelIdInStorage(state.hostels[0].hostelId);
//         }

//         console.log("✅ Auth initialized from storage - User is authenticated");

//         // Set bank status
//         try {
//           const bd = user?.bankDetails;
//           const hasBank =
//             bd &&
//             (bd.accountNumber || bd.ifscCode || bd.accountHolderName) &&
//             (bd.isVerified === true || bd.isVerified === "true");
//           if (hasBank) {
//             setBankStatusCompleted();
//             console.log("🏦 Bank status set to completed (init)");
//           } else {
//             setBankStatusPending();
//             console.log("🏦 Bank status set to pending (init)");
//           }
//         } catch (e) {
//           console.warn("Error checking bank status on init", e);
//           setBankStatusPending();
//         }
//       })
//       .addCase(initializeAuth.rejected, (state, action) => {
//         state.loading = false;
//         state.isInitialized = true;
//         state.isAuthenticated = false;
//         state.hostels = [];
//         state.selectedHostelId = null;
//         state.error = action.payload as string;
//         console.log('❌ Auth initialization failed:', action.payload);
//       });
//   },
// });

// export const { logout, clearError, selectHostel, updateHostels, updateUser } = authSlice.actions;
// export default authSlice.reducer;

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

interface HostelDocument {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  uploadDate: string;
}

interface Hostel {
  hostelId: string;
  _id: string;
  hostelName: string;
  hostelType: string;
  govtRegistrationId: string;
  fullAddress: string;
  status: string;
  isActive: boolean;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  documents: HostelDocument[];
}

interface ActiveHostel {
  hostelId: string;
  hostelName: string;
  hostelType: string;
}

interface Subscription {
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  features: string[];
  price: number;
  duration: string;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  hostelName?: string;
  role?: string;
  bankDetails?: BankDetails;
  hostels?: Hostel[];
  activeHostel?: ActiveHostel;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  mobile?: string;
  hostelsSummary?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  profile?: {
    totalHostels: number;
    maxHostels: number;
    profileComplete: boolean;
  };
  activeSince?: string;
  subscription?: Subscription;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType?: string;
}

interface LoginResponseData {
  tokens: Tokens;
  user: User;
  role: string;
  permissions?: string[];
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: LoginResponseData;
  tokens?: Tokens;
  user?: User;
  role?: string;
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
  selectedHostelId?: string;
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
  hostels: Hostel[];
  selectedHostelId: string | null;
  subscription: Subscription | null;
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
  fullName: null,
  hostels: [],
  selectedHostelId: null,
  subscription: null
};

// Helper function to get selected hostel ID from storage
const getSelectedHostelIdFromStorage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('selectedHostelId');
  } catch (error) {
    console.error('Error getting selected hostel from storage:', error);
    return null;
  }
};

// Helper function to set selected hostel ID in storage
const setSelectedHostelIdInStorage = async (hostelId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('selectedHostelId', hostelId);
  } catch (error) {
    console.error('Error setting selected hostel in storage:', error);
  }
};

// Helper function to save auth data to storage
const saveAuthDataToStorage = async (
  token: string, 
  refreshToken: string, 
  user: User,
  selectedHostelId?: string,
  hasSeenSubscription?: boolean
): Promise<void> => {
  try {
    const items: [string, string][] = [
      ['token', token],
      ['refreshToken', refreshToken],
      ['user', JSON.stringify(user)],
    ];
    
    if (selectedHostelId) {
      items.push(['selectedHostelId', selectedHostelId]);
    }

    if (hasSeenSubscription !== undefined && user?._id) {
      items.push([`hasSeenSubscription_${user._id}`, hasSeenSubscription.toString()]);
    }
    
    await AsyncStorage.multiSet(items);
    console.log('💾 Auth data saved to storage');
  } catch (error) {
    console.error('Error saving auth data to storage:', error);
  }
};

// Helper function to clear auth data from storage
const clearAuthDataFromStorage = async (): Promise<void> => {
  try {
    const userId = await AsyncStorage.getItem('user').then(user => {
      if (user) {
        const userData = JSON.parse(user);
        return userData._id;
      }
      return null;
    });
    
    const keysToRemove = ['token', 'refreshToken', 'user', 'selectedHostelId'];
    if (userId) {
      keysToRemove.push(`hasSeenSubscription_${userId}`);
    }
    
    await AsyncStorage.multiRemove(keysToRemove);
    console.log('🗑️ Auth data cleared from storage');
  } catch (error) {
    console.error('Error clearing auth data from storage:', error);
  }
};

// Check if user has seen subscription modal
const getHasSeenSubscription = async (userId: string): Promise<boolean> => {
  try {
    const hasSeen = await AsyncStorage.getItem(`hasSeenSubscription_${userId}`);
    return hasSeen === 'true';
  } catch (error) {
    console.error('Error checking hasSeenSubscription:', error);
    return false;
  }
};

// Set has seen subscription flag
const setHasSeenSubscriptionFlag = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(`hasSeenSubscription_${userId}`, 'true');
  } catch (error) {
    console.error('Error setting hasSeenSubscription:', error);
  }
};

// Get last skip time
const getLastSkipTime = async (userId: string): Promise<number | null> => {
  try {
    const lastSkipTime = await AsyncStorage.getItem(`lastSkipTime_${userId}`);
    return lastSkipTime ? parseInt(lastSkipTime) : null;
  } catch (error) {
    console.error('Error getting last skip time:', error);
    return null;
  }
};

// Set last skip time
const setLastSkipTime = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(`lastSkipTime_${userId}`, Date.now().toString());
  } catch (error) {
    console.error('Error setting last skip time:', error);
  }
};

// Login thunk
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

      if (!response || response.success === false) {
        const message = (response && (response as any).message) || "Invalid credentials";
        console.log("❌ Login api returned success:false ->", message);
        return rejectWithValue(message);
      }

      console.log("✅ Login response received (success)");
      return response;
    } catch (error: any) {
      // console.log("❌ Login error details:", error);
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
  RefreshTokenResponse,
  void,
  { rejectValue: string }
>(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Attempting token refresh");
      
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

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
  InitializeAuthPayload & { selectedHostelId?: string; hasSeenSubscription?: boolean; lastSkipTime?: number },
  void,
  { rejectValue: string }
>(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Initializing auth from storage...');

      const [token, refreshToken, user, selectedHostelId] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("refreshToken"),
        AsyncStorage.getItem("user"),
        getSelectedHostelIdFromStorage(),
      ]);

      console.log('📦 Retrieved from storage:', {
        token: token ? 'Present' : 'Missing',
        refreshToken: refreshToken ? 'Present' : 'Missing',
        user: user ? 'Present' : 'Missing',
        selectedHostelId: selectedHostelId ? 'Present' : 'Missing'
      });

      if (token && refreshToken && user) {
        const userData: User = JSON.parse(user);
        
        // Check if user has seen subscription modal
        let hasSeenSubscription = false;
        let lastSkipTime = null;
        
        if (userData._id) {
          hasSeenSubscription = await getHasSeenSubscription(userData._id);
          lastSkipTime = await getLastSkipTime(userData._id);
        }

        console.log('✅ Restoring authenticated state');
        
        return {
          token,
          refreshToken,
          user: userData,
          role: userData?.role || 'hostelOwner',
          selectedHostelId: selectedHostelId || undefined,
          hasSeenSubscription,
          lastSkipTime: lastSkipTime || undefined,
        };
      }

      console.log('ℹ️ No stored auth data found');
      throw new Error("No stored auth data");
    } catch (error) {
      console.log('❌ Error initializing auth:', error);
      return rejectWithValue("Failed to initialize auth");
    }
  }
);

// Activate subscription
export const activateSubscription = createAsyncThunk<
  { subscription: Subscription },
  Subscription,
  { rejectValue: string }
>(
  "auth/activateSubscription",
  async (subscriptionData: Subscription, { rejectWithValue, getState }) => {
    try {
      console.log("🎯 Activating subscription:", subscriptionData.planName);
      
      // Here you would typically make an API call to activate the subscription
      // For now, we'll simulate a successful activation
      
      // Update user's subscription in backend (simulated)
      const response = await ApiClient.post("/subscription/activate", subscriptionData);
      
      if (!response || response.success === false) {
        const message = response?.message || "Failed to activate subscription";
        return rejectWithValue(message);
      }

      console.log("✅ Subscription activated successfully");
      return { subscription: subscriptionData };
    } catch (error: any) {
      console.log("❌ Subscription activation error:", error);
      let errorMessage = "Failed to activate subscription";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // Clear state
      Object.assign(state, {
        ...initialState,
        isInitialized: true,
      });
      
      // Clear storage (fire and forget)
      clearAuthDataFromStorage();
    },
    clearError: (state) => {
      state.error = null;
    },
    selectHostel: (state, action: PayloadAction<string>) => {
      state.selectedHostelId = action.payload;
      // Save to storage (fire and forget)
      setSelectedHostelIdInStorage(action.payload);
    },
    updateHostels: (state, action: PayloadAction<Hostel[]>) => {
      state.hostels = action.payload;
      // If no hostel is selected and we have hostels, select the first one
      if (!state.selectedHostelId && action.payload.length > 0) {
        state.selectedHostelId = action.payload[0].hostelId;
        setSelectedHostelIdInStorage(action.payload[0].hostelId);
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update subscription state if subscription is updated
        if (action.payload.subscription) {
          state.subscription = action.payload.subscription;
        }
        // Update storage (fire and forget)
        if (state.token && state.refreshToken) {
          saveAuthDataToStorage(
            state.token, 
            state.refreshToken, 
            state.user, 
            state.selectedHostelId || undefined
          );
        }
      }
    },
    updateSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscription = action.payload;
      if (state.user) {
        state.user.subscription = action.payload;
      }
      // Update storage (fire and forget)
      if (state.token && state.refreshToken && state.user) {
        saveAuthDataToStorage(
          state.token, 
          state.refreshToken, 
          state.user, 
          state.selectedHostelId || undefined
        );
      }
    },
    markSubscriptionSeen: (state) => {
      if (state.user?._id) {
        // This flag is saved per user in AsyncStorage
        setHasSeenSubscriptionFlag(state.user._id);
      }
    },
    setLastSkipTimeForUser: (state) => {
      if (state.user?._id) {
        setLastSkipTime(state.user._id);
      }
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
        
        // Handle both response formats
        let user: User;
        let tokens: Tokens;
        let role: string;
        let hostels: Hostel[] = [];

        if (action.payload.data) {
          // New format: response.data contains everything
          user = action.payload.data.user;
          tokens = action.payload.data.tokens;
          role = action.payload.data.role;
          hostels = action.payload.data.user.hostels || [];
        } else {
          // Old format: direct properties
          user = action.payload.user!;
          tokens = action.payload.tokens!;
          role = action.payload.role!;
          hostels = action.payload.user?.hostels || [];
        }

        console.log("✅ Login successful");

        // Update state
        state.user = user;
        state.token = tokens.accessToken;
        state.refreshToken = tokens.refreshToken;
        state.role = role;
        state.userId = user?._id || null;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.fullName = user?.fullName || "owner";
        state.hostels = hostels;
        state.subscription = user.subscription || null;
        
        // Determine selected hostel
        let selectedHostelId: string | null = null;
        if (hostels.length > 0) {
          const activeHostelId = user.activeHostel?.hostelId;
          selectedHostelId = activeHostelId || hostels[0].hostelId;
          state.selectedHostelId = selectedHostelId;
        }

        // Save to storage (fire and forget)
        saveAuthDataToStorage(
          tokens.accessToken, 
          tokens.refreshToken, 
          user, 
          selectedHostelId || undefined
        );

        // Set bank status
        try {
          const bd = user?.bankDetails;
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
        // console.log('❌ Login rejected:', action.payload);
      })

      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<RefreshTokenResponse>) => {
        const { tokens, user } = action.payload;
        
        // Update state
        state.token = tokens.accessToken;
        state.refreshToken = tokens.refreshToken;
        state.user = user;
        state.hostels = user?.hostels || [];
        state.subscription = user?.subscription || null;

        console.log('🔄 Token refreshed successfully');

        // Update storage (fire and forget)
        saveAuthDataToStorage(
          tokens.accessToken, 
          tokens.refreshToken, 
          user, 
          state.selectedHostelId || undefined
        );
      })
      .addCase(refreshToken.rejected, (state, action) => {
        console.log('❌ Token refresh failed, logging out:', action.payload);
        
        // Clear state
        Object.assign(state, {
          ...initialState,
          isInitialized: true,
          error: action.payload as string,
        });

        // Clear storage (fire and forget)
        clearAuthDataFromStorage();
      })

      // Initialize auth cases
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;

        const { token, refreshToken, user, role, selectedHostelId } = action.payload;
        
        // Update state
        state.token = token;
        state.refreshToken = refreshToken;
        state.user = user;
        state.userId = user?._id || null;
        state.role = role;
        state.isAuthenticated = true;
        state.hostels = user?.hostels || [];
        state.subscription = user?.subscription || null;
        
        // Handle selected hostel
        if (selectedHostelId && state.hostels.some(h => h.hostelId === selectedHostelId)) {
          state.selectedHostelId = selectedHostelId;
        } else if (state.hostels.length > 0) {
          // Select the first hostel by default
          state.selectedHostelId = state.hostels[0].hostelId;
          // Save to storage (fire and forget)
          setSelectedHostelIdInStorage(state.hostels[0].hostelId);
        }

        console.log("✅ Auth initialized from storage - User is authenticated");

        // Set bank status
        try {
          const bd = user?.bankDetails;
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
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.hostels = [];
        state.selectedHostelId = null;
        state.subscription = null;
        state.error = action.payload as string;
        console.log('❌ Auth initialization failed:', action.payload);
      })

      // Activate subscription cases
      .addCase(activateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload.subscription;
        
        if (state.user) {
          state.user.subscription = action.payload.subscription;
        }

        console.log("✅ Subscription activated in state");
      })
      .addCase(activateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log('❌ Subscription activation failed:', action.payload);
      });
  },
});

export const { 
  logout, 
  clearError, 
  selectHostel, 
  updateHostels, 
  updateUser, 
  updateSubscription,
  markSubscriptionSeen,
  setLastSkipTimeForUser
} = authSlice.actions;
export default authSlice.reducer;