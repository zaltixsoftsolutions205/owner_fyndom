import ApiClient from "./ApiClient";

export interface RoomData {
  floor: string;
  roomNumber: string;
  sharingType: string;
  capacity: number;
  occupied: number;
}

export interface RoomResponse {
  success: boolean;
  message: string;
  data: {
    hostelOwner: string;
    floor: string;
    roomNumber: string;
    capacity: number;
    occupied: number;
    isAvailable: boolean;
    _id: string;
    remaining: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

// Add this interface for the getAllRooms response
export interface AllRoomsResponse {
  success: boolean;
  data: {
    rooms: Room[];
    sharingTypeAvailability: {
      single: RoomTypeAvailability;
      double: RoomTypeAvailability;
      triple: RoomTypeAvailability;
      four: RoomTypeAvailability;
      five: RoomTypeAvailability;
    };
    summary: {
      totalBeds: number;
      occupiedBeds: number;
      vacantBeds: number;
      totalRooms: number;
    };
  };
}

export interface Room {
  _id: string;
  floor: string;
  roomNumber: string;
  sharingType: string;
  capacity: number;
  occupied: number;
  remaining: number;
  isAvailable: boolean;
  status: string;
  // Add these optional properties to match the RoomResponse data
  hostelOwner?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface RoomTypeAvailability {
  available: boolean;
  totalRooms: number;
  availableRooms: number;
  totalBeds: number;
  availableBeds: number;
}


// ===============================================

export interface HostelPhoto {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  isPrimary: boolean;
  uploadDate: string;
}

export interface HostelPhotosResponse {
  success: boolean;
  data: HostelPhoto[];
}


// ==================================================================


export interface FacilitiesResponse {
  success: boolean;
  data: {
    roomSharingTypes: {
      roomType: string;
      sharingType: string;
      _id: string;
    }[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
  };
}



export const roomApi = {
  addRoom: async (roomData: RoomData): Promise<RoomResponse> => {
    console.log("🚀 Sending room data:", roomData);
    try {
      const response = await ApiClient.post<RoomResponse>("/hostel-operations/add-room", roomData);
      console.log("✅ Room API response:", response);
      return response;
    } catch (error: any) {
      console.log("❌ Room API error:", error);
      throw error;
    }
  },

  // Get all rooms
  getRooms: async (): Promise<AllRoomsResponse> => {
    try {
      const response = await ApiClient.get<AllRoomsResponse>("/hostel-operations/rooms");
      console.log("✅ Get all rooms API response:", response);
      return response;
    } catch (error: any) {
      console.log("❌ Get all rooms API error:", error);
      throw error;
    }
  },

  // Update room occupancy
  updateRoomOccupancy: async (roomId: string, occupied: number) => {
    return await ApiClient.patch(`/hostel-operations/rooms/${roomId}/occupancy`, { occupied });
  },

  // Delete room
  deleteRoom: async (roomId: string) => {
    return await ApiClient.delete(`/hostel-operations/rooms/${roomId}`);
  },



// Get Hostel Photos
getHostelPhotos: async () => {
  try {
    const response = await ApiClient.get("/hostel-operations/photos");
    console.log("📸 Get hostel photos API:", response);
    return response;
  } catch (error: any) {
    console.log("❌ Get hostel photos API error:", error);
    throw error;
  }
},



// Get Hostel Facilities
getFacilities: async () => {
  try {
    const response = await ApiClient.get("/hostel-operations/facilities");
    console.log("🏨 Get facilities API:", response);
    return response;
  } catch (error: any) {
    console.log("❌ Get facilities API error:", error);
    throw error;
  }
},


};