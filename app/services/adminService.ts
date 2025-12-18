// services/adminService.ts
import ApiClient from "../api/ApiClient";

interface RegisterOwnerPayload {
  fullName: string;
  hostelName: string;
  email: string;
  mobileNumber: string;
  registrationId: string;
  fullAddress: string;
  documents: string[]; // array of URLs or file names after upload
}

export const registerHostelOwner = async (payload: RegisterOwnerPayload) => {
  return await ApiClient.post("/admin/register", payload);
};
