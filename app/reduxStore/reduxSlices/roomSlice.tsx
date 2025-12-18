import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { roomApi, RoomData, RoomResponse, AllRoomsResponse, Room, HostelPhoto } from "../../api/roomApi";

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


};

export const addRoom = createAsyncThunk(
  "rooms/addRoom",
  async (roomData: RoomData, { rejectWithValue }) => {
    try {
      const response = await roomApi.addRoom(roomData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add room"
      );
    }
  }
);

// Add this new thunk for getting all rooms
export const getAllRooms = createAsyncThunk(
  "rooms/getAllRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomApi.getRooms();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch rooms"
      );
    }
  }
);



export const getHostelPhotos = createAsyncThunk(
  "rooms/getHostelPhotos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomApi.getHostelPhotos();
      return response.data; // returns the array
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
      return response.data; // API contains { success, data }
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
    },
    clearRoomSuccess: (state) => {
      state.success = false;
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
        if (action.payload.data) {
          // Use type assertion or create a proper Room object
          const roomData = action.payload.data;
          const room: Room = {
            _id: roomData._id,
            floor: roomData.floor,
            roomNumber: roomData.roomNumber,
            sharingType: roomData.sharingType || "single", // Default value
            capacity: roomData.capacity,
            occupied: roomData.occupied,
            remaining: roomData.remaining,
            isAvailable: roomData.isAvailable,
            status: `${roomData.occupied}/${roomData.capacity} filled`, // Generate status
            hostelOwner: roomData.hostelOwner,
            createdAt: roomData.createdAt,
            updatedAt: roomData.updatedAt,
            __v: roomData.__v,
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
        state.allRooms = action.payload.data.rooms;
        state.summary = action.payload.data.summary;
        state.sharingTypeAvailability = action.payload.data.sharingTypeAvailability;
      })
      .addCase(getAllRooms.rejected, (state, action) => {
        state.allRoomsLoading = false;
        state.allRoomsError = action.payload as string;
      })


      // Fetch Hostel Photos
      .addCase(getHostelPhotos.pending, (state) => {
        state.photosLoading = true;
        state.photosError = null;
      })

      .addCase(getHostelPhotos.fulfilled, (state, action) => {
        state.photosLoading = false;
        state.photos = action.payload; // array of photos
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
        state.facilities = action.payload; // stores full `data`
      })

      .addCase(getFacilities.rejected, (state, action) => {
        state.facilitiesLoading = false;
        state.facilitiesError = action.payload as string;
      });


  },
});

export const { clearRoomError, clearRoomSuccess } = roomSlice.actions;
export default roomSlice.reducer;