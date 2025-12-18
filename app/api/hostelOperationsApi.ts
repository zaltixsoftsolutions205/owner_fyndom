// app/api/hostelOperationsApi.ts
import ApiClient from "./ApiClient";

export interface SetFacilitiesRequest {
  sharingTypes: string[];
  bathroomTypes: string[];
  essentials: string[];
  foodServices: string[];
  customFoodMenu?: string;
}

export interface FacilitiesResponse {
  success: boolean;
  message: string;
  data?: {
    sharingTypes: string[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
    customFoodMenu?: string;
  };
}

class HostelOperationsApi {
  // Set Facilities - UPDATED to match backend
  async setFacilities(data: SetFacilitiesRequest): Promise<FacilitiesResponse> {
    try {
      console.log("📤 Setting facilities data:", data);
      const response = await ApiClient.post<FacilitiesResponse>("/hostel-operations/set-facilities", data);
      return response;
    } catch (error: any) {
      console.error("Set facilities error:", error);
      throw new Error(error.response?.data?.message || "Failed to set facilities");
    }
  }

  // Get Facilities - UPDATED to match backend
  async getFacilities(): Promise<FacilitiesResponse> {
    try {
      console.log("📥 Getting facilities...");
      const response = await ApiClient.get<FacilitiesResponse>("/hostel-operations/facilities");
      console.log("📦 Facilities response:", response);
      return response;
    } catch (error: any) {
      console.error("Get facilities error:", error);
      throw new Error(error.response?.data?.message || "Failed to get facilities");
    }
  }

  // Set Hostel Summary
  async setSummary(data: { summary: string }): Promise<any> {
    try {
      const response = await ApiClient.post("/hostel-operations/set-summary", data);
      return response;
    } catch (error: any) {
      console.error("Set summary error:", error);
      throw new Error(error.response?.data?.message || "Failed to set summary");
    }
  }

  // Get Hostel Summary
  async getSummary(): Promise<any> {
    try {
      const response = await ApiClient.get("/hostel-operations/summary");
      return response;
    } catch (error: any) {
      console.error("Get summary error:", error);
      throw new Error(error.response?.data?.message || "Failed to get summary");
    }
  }
}

export default new HostelOperationsApi();