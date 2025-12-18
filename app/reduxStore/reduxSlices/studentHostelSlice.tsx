// app/reduxStore/reduxSlices/studentHostelSlice.tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ApiClient from "../../api/ApiClient";

interface Hostel {
  _id: string;
  hostelName: string;
  address: string;
  contact: string;
  email: string;
  hostelType: string;
  hostelTypeDisplay: string;
  photos: any[];
  summary: string;
  startingPrice: number | null;
  pricing: any;
  facilities: any;
  coordinates: any;
  availabilitySummary: any;
  distance?: number;
  isNearby?: boolean;
}

interface StudentHostelState {
  hostels: Hostel[];
  loading: boolean;
  error: string | null;
  filters: {
    hostelType: string;
    search: string;
    useLocation: boolean;
  };
  hostelTypes: Array<{ value: string; label: string; icon: string }>;
}

const initialState: StudentHostelState = {
  hostels: [],
  loading: false,
  error: null,
  filters: {
    hostelType: '',
    search: '',
    useLocation: false
  },
  hostelTypes: []
};

// Get all hostels with filters
export const getHostels = createAsyncThunk(
  "studentHostel/getHostels",
  async (filters: { 
    hostelType?: string; 
    search?: string; 
    useLocation?: boolean;
    latitude?: number;
    longitude?: number;
    page?: number;
    limit?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.hostelType) params.append('hostelType', filters.hostelType);
      if (filters.search) params.append('search', filters.search);
      if (filters.useLocation) params.append('useLocation', 'true');
      if (filters.latitude) params.append('latitude', filters.latitude.toString());
      if (filters.longitude) params.append('longitude', filters.longitude.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const response = await ApiClient.get(`/student/hostels?${params}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch hostels"
      );
    }
  }
);

// Get hostel types
export const getHostelTypes = createAsyncThunk(
  "studentHostel/getHostelTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiClient.get("/student/hostels/types");
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch hostel types"
      );
    }
  }
);

// Get hostel details
export const getHostelDetails = createAsyncThunk(
  "studentHostel/getHostelDetails",
  async (hostelId: string, { rejectWithValue }) => {
    try {
      const response = await ApiClient.get(`/student/hostels/${hostelId}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch hostel details"
      );
    }
  }
);

const studentHostelSlice = createSlice({
  name: "studentHostel",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        hostelType: '',
        search: '',
        useLocation: false
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Hostels
      .addCase(getHostels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHostels.fulfilled, (state, action) => {
        state.loading = false;
        state.hostels = action.payload.data;
      })
      .addCase(getHostels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Hostel Types
      .addCase(getHostelTypes.fulfilled, (state, action) => {
        state.hostelTypes = action.payload.data;
      });
  },
});

export const { setFilters, clearFilters, clearError } = studentHostelSlice.actions;
export default studentHostelSlice.reducer;