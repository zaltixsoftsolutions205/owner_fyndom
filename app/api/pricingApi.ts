// app/api/pricingApi.ts
import ApiClient, { PricingPayload, PricingResponse, GetPricingResponse } from "./ApiClient";

export interface SharingTypeOption {
  label: string;
  value: string;
  key: string;
}

export const SHARING_OPTIONS: SharingTypeOption[] = [
  { label: "Single Sharing", value: "single", key: "single" },
  { label: "Double Sharing", value: "double", key: "double" },
  { label: "Triple Sharing", value: "triple", key: "triple" },
  { label: "Four Sharing", value: "four", key: "four" },
  { label: "Five Sharing", value: "five", key: "five" },
  { label: "Six Sharing", value: "six", key: "six" },
  { label: "Seven Sharing", value: "seven", key: "seven" },
  { label: "Eight Sharing", value: "eight", key: "eight" },
  { label: "Nine Sharing", value: "nine", key: "nine" },
  { label: "Ten Sharing", value: "ten", key: "ten" },
];

export interface OrganizedPricing {
  [key: string]: {
    label: string;
    daily: {
      price: number;
      currency: string;
      isSet: boolean;
    };
    monthly: {
      price: number;
      currency: string;
      isSet: boolean;
    };
  };
}

class PricingApi {
  // Set pricing for a specific hostel
  async setPricing(data: PricingPayload): Promise<PricingResponse> {
    try {
      console.log("💰 Setting pricing:", data);
      const response = await ApiClient.post<PricingResponse>(
        "/hostel-operations/set-pricing",
        data
      );
      return response;
    } catch (error: any) {
      console.error("Set pricing error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to set pricing"
      );
    }
  }

  // Get pricing for a specific hostel
  async getPricing(hostelId: string): Promise<GetPricingResponse> {
    try {
      console.log("📊 Getting pricing for hostel:", hostelId);
      const response = await ApiClient.get<GetPricingResponse>(
        `/hostel-operations/pricing?hostelId=${hostelId}`
      );
      console.log("📦 Pricing response:", response);
      return response;
    } catch (error: any) {
      console.error("Get pricing error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get pricing"
      );
    }
  }

  // Get organized pricing data
  getOrganizedPricing(data: GetPricingResponse['data']): OrganizedPricing {
    return data.organized;
  }

  // Get price for specific sharing and duration type
  getPriceForSharing(
    pricingData: GetPricingResponse['data'] | null,
    sharingType: string,
    durationType: string
  ): number {
    if (!pricingData) return 0;
    
    const organized = pricingData.organized;
    const durationKey = durationType.toLowerCase();
    
    if (organized[sharingType] && organized[sharingType][durationKey]) {
      return organized[sharingType][durationKey].price || 0;
    }
    
    return 0;
  }

  // Check if price is set for specific sharing and duration type
  isPriceSet(
    pricingData: GetPricingResponse['data'] | null,
    sharingType: string,
    durationType: string
  ): boolean {
    if (!pricingData) return false;
    
    const organized = pricingData.organized;
    const durationKey = durationType.toLowerCase();
    
    if (organized[sharingType] && organized[sharingType][durationKey]) {
      return organized[sharingType][durationKey].isSet || false;
    }
    
    return false;
  }

  // Get sharing option label from value
  getSharingLabel(sharingValue: string): string {
    const option = SHARING_OPTIONS.find(opt => opt.value === sharingValue);
    return option ? option.label : "Unknown Sharing";
  }

  // Get sharing value from label
  getSharingValue(sharingLabel: string): string {
    const option = SHARING_OPTIONS.find(opt => opt.label === sharingLabel);
    return option ? option.value : "single";
  }
}

export default new PricingApi();