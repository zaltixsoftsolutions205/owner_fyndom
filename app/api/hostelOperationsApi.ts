// app/api/hostelOperationsApi.ts
import ApiClient, { PricingPayload, PricingResponse, GetPricingResponse } from "./ApiClient";

export interface SetFacilitiesRequest {
  hostelId: string; // Added hostelId
  sharingTypes: string[];
  bathroomTypes: string[];
  essentials: string[];
  foodServices: string[];
  customFoodMenu?: string;
}

export interface SetFacilitiesByHostelRequest {
  hostelId: string;
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
    hostelId: string;
    hostelName: string;
    sharingTypes: string[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
    customFoodMenu?: string;
  };
}

export interface GetFacilitiesResponse {
  success: boolean;
  data: {
    hostelId: string;
    hostelName: string;
    sharingTypes: string[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
    customFoodMenu?: string;
  };
}

class HostelOperationsApi {
  // ✅ FIXED: Set Facilities for Specific Hostel
  async setFacilities(data: SetFacilitiesByHostelRequest): Promise<FacilitiesResponse> {
    try {
      console.log("📤 Setting facilities for hostel:", data.hostelId);
      console.log("📤 Request data:", JSON.stringify(data, null, 2));

      const response = await ApiClient.post<FacilitiesResponse>(
        "/hostel-operations/set-facilities-by-hostel",
        data
      );

      console.log("✅ Facilities response:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Set facilities error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || "Failed to set facilities");
    }
  }

  // ✅ FIXED: Get Facilities for Specific Hostel
  async getFacilities(hostelId: string): Promise<GetFacilitiesResponse> {
    try {
      if (!hostelId) {
        throw new Error("Hostel ID is required");
      }

      console.log("📥 Getting facilities for hostel:", hostelId);
      const response = await ApiClient.get<GetFacilitiesResponse>(
        `/hostel-operations/facilities/${hostelId}`
      );
      console.log("📦 Facilities response:", response);
      return response;
    } catch (error: any) {
      console.error("Get facilities error details:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to get facilities");
    }
  }

  // Get All Hostels with Facilities
  async getAllHostelsFacilities(): Promise<any> {
    try {
      console.log("📥 Getting all hostels with facilities...");
      const response = await ApiClient.get("/hostel-operations/all-hostels-facilities");
      return response;
    } catch (error: any) {
      console.error("Get all hostels facilities error:", error);
      throw new Error(error.response?.data?.message || "Failed to get all hostels facilities");
    }
  }

  // Set Pricing - Updated with hostelId
  async setPricing(data: PricingPayload): Promise<PricingResponse> {
    try {
      console.log("💰 Setting pricing:", data);
      const response = await ApiClient.post<PricingResponse>("/hostel-operations/set-pricing", data);
      return response;
    } catch (error: any) {
      console.error("Set pricing error:", error);
      throw new Error(error.response?.data?.message || "Failed to set pricing");
    }
  }

  // Get Pricing - Updated with hostelId parameter
  async getPricing(hostelId?: string): Promise<GetPricingResponse> {
    try {
      let url = "/hostel-operations/pricing";
      if (hostelId) {
        url += `?hostelId=${hostelId}`;
      }

      console.log("📥 Getting pricing for hostel:", hostelId || "all");
      const response = await ApiClient.get<GetPricingResponse>(url);
      return response;
    } catch (error: any) {
      console.error("Get pricing error:", error);
      throw new Error(error.response?.data?.message || "Failed to get pricing");
    }
  }

  // Get Price Summary
  async getPriceSummary(hostelId?: string): Promise<any> {
    try {
      let url = "/hostel-operations/price-summary";
      if (hostelId) {
        url += `?hostelId=${hostelId}`;
      }

      const response = await ApiClient.get(url);
      return response;
    } catch (error: any) {
      console.error("Get price summary error:", error);
      throw new Error(error.response?.data?.message || "Failed to get price summary");
    }
  }

  // Set Hostel Summary - Updated to use hostelId
  async setSummary(data: { hostelId: string; summary: string }): Promise<any> {
    try {
      console.log("📝 Setting summary for hostel:", data.hostelId);
      console.log("📤 Request data:", JSON.stringify(data, null, 2));

      const response = await ApiClient.post("/hostel-operations/set-summary", data);
      console.log("✅ Summary response:", response);
      return response;
    } catch (error: any) {
      console.error("Set summary error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || "Failed to set summary");
    }
  }

  // Get Hostel Summary - Updated with hostelId parameter
  async getSummary(hostelId?: string): Promise<any> {
    try {
      if (!hostelId) {
        throw new Error("Hostel ID is required to get summary");
      }

      console.log("📥 Getting summary for hostel:", hostelId);
      const response = await ApiClient.get(`/hostel-operations/summary?hostelId=${hostelId}`);
      console.log("📦 Summary response:", response);
      return response;
    } catch (error: any) {
      console.error("Get summary error details:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to get summary");
    }
  }

  // Upload Photos with hostelId
  async uploadPhotos(formData: FormData): Promise<any> {
    try {
      const response = await ApiClient.postFormData("/hostel-operations/upload-photos", formData);
      return response;
    } catch (error: any) {
      console.error("Upload photos error:", error);
      throw new Error(error.response?.data?.message || "Failed to upload photos");
    }
  }

  // Get Photos with hostelId
  async getPhotos(hostelId?: string): Promise<any> {
    try {
      let url = "/hostel-operations/photos";
      if (hostelId) {
        url += `?hostelId=${hostelId}`;
      }

      const response = await ApiClient.get(url);
      return response;
    } catch (error: any) {
      console.error("Get photos error:", error);
      throw new Error(error.response?.data?.message || "Failed to get photos");
    }
  }
}

export default new HostelOperationsApi();