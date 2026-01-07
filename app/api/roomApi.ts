// app/api/roomApi.ts
import ApiClient from "./ApiClient";

export interface RoomData {
  hostelId?: string;
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
    room: {
      hostelOwner: string;
      hostelId: string;
      floor: string;
      roomNumber: string;
      sharingType: string;
      capacity: number;
      occupied: number;
      remaining: number;
      isAvailable: boolean;
      _id: string;
      bookingHistory: any[];
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    hostelInfo: {
      hostelId: string;
      hostelName: string;
      hostelType: string;
    };
  };
}

export interface AllRoomsResponse {
  success: boolean;
  data: {
    hostelInfo: {
      hostelId: string;
      hostelName: string;
      hostelType: string;
    };
    rooms: Room[];
    sharingTypeAvailability: {
      [key: string]: RoomTypeAvailability;
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
  hostelId?: string;
}

export interface RoomTypeAvailability {
  available: boolean;
  totalRooms: number;
  availableRooms: number;
  totalBeds: number;
  availableBeds: number;
}

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

export interface DeleteRoomResponse {
  success: boolean;
  message: string;
  data: {
    deletedRoomId: string;
    hostelId: string;
  };
}

export const roomApi = {
  addRoom: async (roomData: RoomData): Promise<RoomResponse> => {
    console.log("🚀 Sending room data:", roomData);
    try {
      // Make sure hostelId is included
      if (!roomData.hostelId) {
        throw new Error("hostelId is required");
      }
      
      const response = await ApiClient.post<RoomResponse>("/hostel-rooms/add", roomData);
      console.log("✅ Room API response:", response);
      return response;
    } catch (error: any) {
      console.log("❌ Room API error:", error);
      throw error;
    }
  },

  // Get all rooms for a specific hostel
  getRooms: async (hostelId: string): Promise<AllRoomsResponse> => {
    try {
      const response = await ApiClient.get<AllRoomsResponse>(`/hostel-rooms?hostelId=${hostelId}`);
      console.log("✅ Get all rooms API response:", response);
      return response;
    } catch (error: any) {
      console.log("❌ Get all rooms API error:", error);
      throw error;
    }
  },

  // Update room occupancy
  updateRoomOccupancy: async (roomId: string, occupied: number) => {
    return await ApiClient.patch(`/hostel-rooms/${roomId}/occupancy`, { occupied });
  },

  // Delete room
  deleteRoom: async (roomId: string): Promise<DeleteRoomResponse> => {
    return await ApiClient.delete<DeleteRoomResponse>(`/hostel-rooms/delete/${roomId}`);
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