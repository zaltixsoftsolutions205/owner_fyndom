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
  hostelOwner?: string;
  bookingHistory?: any[];
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

// New interface for occupancy update
export interface UpdateOccupancyData {
  occupied: number;
}

export interface UpdateOccupancyResponse {
  success: boolean;
  message: string;
  data: {
    room: Room;
    updatedOccupancy: number;
    remainingBeds: number;
  };
}

export const roomApi = {
  // Add a new room
  addRoom: async (roomData: RoomData): Promise<any> => {
    if (!roomData.hostelId) {
      throw new Error("hostelId is required");
    }

    return ApiClient.post(
      "/hostel-operations/add-room",
      roomData
    );
  },


  // Get all rooms for a specific hostel
  getRooms: async (hostelId: string) => {
    return ApiClient.get(
      `/hostel-operations/rooms?hostelId=${hostelId}`
    );
  },


  // Update room occupancy
  updateRoomOccupancy: async (roomId: string, occupied: number): Promise<UpdateOccupancyResponse> => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required");
      }

      console.log(`🔄 Updating occupancy for room: ${roomId} to ${occupied}`);
      const response = await ApiClient.patch<UpdateOccupancyResponse>(
        `/hostel-rooms/${roomId}/occupancy`,
        { occupied }
      );

      console.log("✅ Update occupancy API response:", {
        success: response.success,
        roomNumber: response.data?.room?.roomNumber,
        updatedOccupancy: response.data?.updatedOccupancy,
        remainingBeds: response.data?.remainingBeds
      });

      return response;
    } catch (error: any) {
      console.error("❌ Update occupancy API error:", {
        roomId,
        occupied,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Delete room
  deleteRoom: async (roomId: string): Promise<DeleteRoomResponse> => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required");
      }

      console.log(`🗑️ Deleting room: ${roomId}`);
      const response = await ApiClient.delete<DeleteRoomResponse>(`/hostel-rooms/delete/${roomId}`);

      console.log("✅ Delete room API response:", {
        success: response.success,
        deletedRoomId: response.data?.deletedRoomId,
        hostelId: response.data?.hostelId
      });

      return response;
    } catch (error: any) {
      console.error("❌ Delete room API error:", {
        roomId,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Get Hostel Photos
  getHostelPhotos: async (hostelId?: string): Promise<HostelPhotosResponse> => {
    try {
      let url = "/hostel-operations/photos";
      if (hostelId) {
        url += `?hostelId=${hostelId}`;
      }

      console.log(`📸 Fetching hostel photos${hostelId ? ` for hostel: ${hostelId}` : ''}`);
      const response = await ApiClient.get<HostelPhotosResponse>(url);

      console.log("✅ Get hostel photos API:", {
        success: response.success,
        photoCount: response.data?.length || 0
      });

      return response;
    } catch (error: any) {
      console.error("❌ Get hostel photos API error:", {
        hostelId,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Get Hostel Facilities
  getFacilities: async (hostelId?: string): Promise<FacilitiesResponse> => {
    try {
      let url = "/hostel-operations/facilities";
      if (hostelId) {
        url += `?hostelId=${hostelId}`;
      }

      console.log(`🏨 Fetching facilities${hostelId ? ` for hostel: ${hostelId}` : ''}`);
      const response = await ApiClient.get<FacilitiesResponse>(url);

      console.log("✅ Get facilities API:", {
        success: response.success,
        sharingTypes: response.data?.roomSharingTypes?.length || 0,
        bathroomTypes: response.data?.bathroomTypes?.length || 0,
        essentials: response.data?.essentials?.length || 0,
        foodServices: response.data?.foodServices?.length || 0
      });

      return response;
    } catch (error: any) {
      console.error("❌ Get facilities API error:", {
        hostelId,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // New: Get room details by ID
  getRoomById: async (roomId: string) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required");
      }

      console.log(`🔍 Fetching room details for: ${roomId}`);
      const response = await ApiClient.get(`/hostel-rooms/${roomId}`);

      console.log("✅ Get room by ID API response:", {
        success: response.success,
        roomNumber: response.data?.roomNumber,
        floor: response.data?.floor
      });

      return response;
    } catch (error: any) {
      console.error("❌ Get room by ID API error:", {
        roomId,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // New: Update room details
  updateRoom: async (roomId: string, roomData: Partial<RoomData>) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required");
      }

      console.log(`✏️ Updating room: ${roomId}`, roomData);
      const response = await ApiClient.put(`/hostel-rooms/${roomId}`, roomData);

      console.log("✅ Update room API response:", {
        success: response.success,
        roomNumber: response.data?.roomNumber
      });

      return response;
    } catch (error: any) {
      console.error("❌ Update room API error:", {
        roomId,
        roomData,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // New: Get rooms by floor
  getRoomsByFloor: async (hostelId: string, floor: string) => {
    try {
      if (!hostelId) {
        throw new Error("Hostel ID is required");
      }
      if (!floor) {
        throw new Error("Floor is required");
      }

      console.log(`🏢 Fetching rooms for hostel: ${hostelId}, floor: ${floor}`);
      const response = await ApiClient.get(`/hostel-rooms/floor?hostelId=${hostelId}&floor=${floor}`);

      console.log("✅ Get rooms by floor API response:", {
        success: response.success,
        roomCount: response.data?.rooms?.length || 0
      });

      return response;
    } catch (error: any) {
      console.error("❌ Get rooms by floor API error:", {
        hostelId,
        floor,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // New: Get room statistics
  getRoomStatistics: async (hostelId: string) => {
    try {
      if (!hostelId) {
        throw new Error("Hostel ID is required");
      }

      console.log(`📊 Fetching room statistics for hostel: ${hostelId}`);
      const response = await ApiClient.get(`/hostel-rooms/statistics?hostelId=${hostelId}`);

      console.log("✅ Get room statistics API response:", {
        success: response.success,
        statistics: response.data
      });

      return response;
    } catch (error: any) {
      console.error("❌ Get room statistics API error:", {
        hostelId,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // New: Check room availability
  checkRoomAvailability: async (roomId: string) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required");
      }

      console.log(`🔍 Checking availability for room: ${roomId}`);
      const response = await ApiClient.get(`/hostel-rooms/${roomId}/availability`);

      console.log("✅ Check room availability API response:", {
        success: response.success,
        isAvailable: response.data?.isAvailable,
        remainingBeds: response.data?.remainingBeds
      });

      return response;
    } catch (error: any) {
      console.error("❌ Check room availability API error:", {
        roomId,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // New: Bulk update room occupancy
  bulkUpdateOccupancy: async (hostelId: string, occupancyData: Array<{ roomId: string; occupied: number }>) => {
    try {
      if (!hostelId) {
        throw new Error("Hostel ID is required");
      }
      if (!occupancyData || occupancyData.length === 0) {
        throw new Error("Occupancy data is required");
      }

      console.log(`🔄 Bulk updating occupancy for hostel: ${hostelId}`, {
        roomCount: occupancyData.length
      });

      const response = await ApiClient.post(`/hostel-rooms/bulk/occupancy`, {
        hostelId,
        occupancyData
      });

      console.log("✅ Bulk update occupancy API response:", {
        success: response.success,
        updatedCount: response.data?.updatedCount,
        failedCount: response.data?.failedCount
      });

      return response;
    } catch (error: any) {
      console.error("❌ Bulk update occupancy API error:", {
        hostelId,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },

  // New: Export rooms data (CSV/Excel)
  exportRoomsData: async (hostelId: string, format: 'csv' | 'excel' = 'csv') => {
    try {
      if (!hostelId) {
        throw new Error("Hostel ID is required");
      }

      console.log(`📥 Exporting rooms data for hostel: ${hostelId} in ${format} format`);

      const response = await ApiClient.get(`/hostel-rooms/export?hostelId=${hostelId}&format=${format}`, {
        responseType: 'blob' // Important for file downloads
      });

      console.log("✅ Export rooms data API response:", {
        success: true,
        contentType: response.headers?.['content-type'],
        contentLength: response.headers?.['content-length']
      });

      return response;
    } catch (error: any) {
      console.error("❌ Export rooms data API error:", {
        hostelId,
        format,
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  }
};