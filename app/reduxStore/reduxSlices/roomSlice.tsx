// app/reduxStore/reduxSlices/roomSlice.tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { roomApi, RoomData, RoomResponse, AllRoomsResponse, Room, HostelPhoto, DeleteRoomResponse } from "../../api/roomApi";

interface RoomState {
  rooms: any[];
  loading: boolean;
  error: string | null;
  success: boolean;
  allRooms: Room[];
  allRoomsLoading: boolean;
  allRoomsError: string | null;
  summary: {
    totalBeds: number;
    occupiedBeds: number;
    vacantBeds: number;
    totalRooms: number;
  } | null;
  sharingTypeAvailability: any;
  photos: HostelPhoto[];
  photosLoading: boolean;
  photosError: string | null;
  facilities: any;
  facilitiesLoading: boolean;
  facilitiesError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: RoomState = {
  rooms: [],
  loading: false,
  error: null,
  success: false,
  allRooms: [],
  allRoomsLoading: false,
  allRoomsError: null,
  summary: null,
  sharingTypeAvailability: null,
  photos: [],
  photosLoading: false,
  photosError: null,
  facilities: null,
  facilitiesLoading: false,
  facilitiesError: null,
  deleteLoading: false,
  deleteError: null,
};

export const addRoom = createAsyncThunk(
  "rooms/addRoom",
  async (roomData: RoomData, { rejectWithValue }) => {
    try {
      // Ensure hostelId is present
      if (!roomData.hostelId) {
        throw new Error("Hostel ID is required");
      }
      
      const response = await roomApi.addRoom(roomData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to add room"
      );
    }
  }
);

export const getAllRooms = createAsyncThunk(
  "rooms/getAllRooms",
  async (hostelId: string, { rejectWithValue }) => {
    try {
      if (!hostelId) {
        throw new Error("Hostel ID is required");
      }
      
      const response = await roomApi.getRooms(hostelId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch rooms"
      );
    }
  }
);

export const deleteRoom = createAsyncThunk(
  "rooms/deleteRoom",
  async (roomId: string, { rejectWithValue }) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required");
      }
      
      const response = await roomApi.deleteRoom(roomId);
      return { response, roomId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete room"
      );
    }
  }
);

export const getHostelPhotos = createAsyncThunk(
  "rooms/getHostelPhotos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomApi.getHostelPhotos();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch hostel photos"
      );
    }
  }
);

export const getFacilities = createAsyncThunk(
  "rooms/getFacilities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomApi.getFacilities();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch facilities"
      );
    }
  }
);

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    clearRoomError: (state) => {
      state.error = null;
      state.allRoomsError = null;
      state.deleteError = null;
    },
    clearRoomSuccess: (state) => {
      state.success = false;
    },
    resetRoomState: (state) => {
      state.allRooms = [];
      state.summary = null;
      state.sharingTypeAvailability = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add room cases
      .addCase(addRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload.data?.room) {
          const roomData = action.payload.data.room;
          const room: Room = {
            _id: roomData._id,
            floor: roomData.floor,
            roomNumber: roomData.roomNumber,
            sharingType: roomData.sharingType,
            capacity: roomData.capacity,
            occupied: roomData.occupied,
            remaining: roomData.remaining,
            isAvailable: roomData.isAvailable,
            status: `${roomData.occupied}/${roomData.capacity} filled`,
            hostelId: roomData.hostelId,
          };
          state.rooms.push(room);
        }
      })
      .addCase(addRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      
      // Get all rooms cases
      .addCase(getAllRooms.pending, (state) => {
        state.allRoomsLoading = true;
        state.allRoomsError = null;
      })
      .addCase(getAllRooms.fulfilled, (state, action) => {
        state.allRoomsLoading = false;
        state.allRooms = action.payload.data.rooms || [];
        state.summary = action.payload.data.summary;
        state.sharingTypeAvailability = action.payload.data.sharingTypeAvailability;
      })
      .addCase(getAllRooms.rejected, (state, action) => {
        state.allRoomsLoading = false;
        state.allRoomsError = action.payload as string;
      })
      
      // Delete room cases
      .addCase(deleteRoom.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.deleteLoading = false;
        // Remove deleted room from state
        state.allRooms = state.allRooms.filter(room => room._id !== action.payload.roomId);
        // Update summary if exists
        if (state.summary) {
          state.summary.totalRooms -= 1;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      })
      
      // Fetch Hostel Photos
      .addCase(getHostelPhotos.pending, (state) => {
        state.photosLoading = true;
        state.photosError = null;
      })
      .addCase(getHostelPhotos.fulfilled, (state, action) => {
        state.photosLoading = false;
        state.photos = action.payload;
      })
      .addCase(getHostelPhotos.rejected, (state, action) => {
        state.photosLoading = false;
        state.photosError = action.payload as string;
      })
      
      // Get Hostel Facilities
      .addCase(getFacilities.pending, (state) => {
        state.facilitiesLoading = true;
        state.facilitiesError = null;
      })
      .addCase(getFacilities.fulfilled, (state, action) => {
        state.facilitiesLoading = false;
        state.facilities = action.payload;
      })
      .addCase(getFacilities.rejected, (state, action) => {
        state.facilitiesLoading = false;
        state.facilitiesError = action.payload as string;
      });
  },
});

export const { clearRoomError, clearRoomSuccess, resetRoomState } = roomSlice.actions;
export default roomSlice.reducer;