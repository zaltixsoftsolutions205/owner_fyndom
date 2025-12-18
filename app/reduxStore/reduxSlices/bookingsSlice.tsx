import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import BookingsApi, { Booking, BookingsResponse, BookingsParams } from "../../api/bookingsApi";

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  } | null;
  summary: {
    totalBookings: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  } | null;
  filters: {
    status: "all" | "confirmed" | "pending" | "cancelled";
  };
}

const initialState: BookingsState = {
  bookings: [],
  loading: false,
  error: null,
  pagination: null,
  summary: null,
  filters: {
    status: "all",
  },
};

// Thunk to fetch all bookings
export const fetchAllBookings = createAsyncThunk<
  BookingsResponse,
  BookingsParams | undefined,
  { rejectValue: string }
>(
  "bookings/fetchAllBookings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await BookingsApi.getAllBookings(params);
      return response;
    } catch (error: any) {
      let errorMessage = "Failed to fetch bookings";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message?.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk to update booking status
export const updateBookingStatus = createAsyncThunk<
  { bookingId: string; status: "confirmed" | "cancelled" },
  { bookingId: string; status: "confirmed" | "cancelled" },
  { rejectValue: string }
>(
  "bookings/updateBookingStatus",
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      await BookingsApi.updateBookingStatus(bookingId, status);
      return { bookingId, status };
    } catch (error: any) {
      let errorMessage = "Failed to update booking status";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<BookingsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearBookings: (state) => {
      state.bookings = [];
      state.pagination = null;
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bookings
      .addCase(fetchAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action: PayloadAction<BookingsResponse>) => {
        state.loading = false;
        state.bookings = action.payload.data;
        state.pagination = action.payload.pagination;
        state.summary = action.payload.summary;
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update booking status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { bookingId, status } = action.payload;
        const bookingIndex = state.bookings.findIndex(booking => booking._id === bookingId);
        
        if (bookingIndex !== -1) {
          state.bookings[bookingIndex].status.bookingStatus = status;
          
          // Update summary counts if needed
          if (state.summary) {
            // This is a simplified update - you might want to refetch the data for accuracy
            if (status === "confirmed") {
              state.summary.confirmed += 1;
              state.summary.pending -= 1;
            } else if (status === "cancelled") {
              state.summary.cancelled += 1;
              state.summary.pending -= 1;
            }
          }
        }
      });
  },
});

export const { clearError, setFilters, clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;