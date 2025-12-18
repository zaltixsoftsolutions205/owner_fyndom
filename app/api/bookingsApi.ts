import ApiClient from "./ApiClient";

export interface Booking {
  _id: string;
  bookingId: string;
  student: {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    aadhar: string;
  };
  room: {
    roomNumber: string;
    floor: string;
    sharingType: string;
  };
  bookingDetails: {
    checkInDate: string;
    duration: string;
    sharingType: string;
    assignedRoom: string;
    assignmentType: string;
  };
  payment: {
    amount: number;
    pricePerDuration: number;
    status: "completed" | "pending" | "failed";
    razorpayOrderId: string;
  };
  status: {
    bookingStatus: "confirmed" | "pending" | "cancelled";
    paymentStatus: "completed" | "pending" | "failed";
  };
  dates: {
    bookedAt: string;
    checkIn: string;
  };
}

export interface BookingsResponse {
  success: boolean;
  message: string;
  data: Booking[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  summary: {
    totalBookings: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
}

export interface BookingsParams {
  status?: "all" | "confirmed" | "pending" | "cancelled";
  page?: number;
  limit?: number;
}

class BookingsApi {
  async getAllBookings(params: BookingsParams = {}): Promise<BookingsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `/bookings/hostel-owner/bookings${queryString ? `?${queryString}` : ''}`;

    return await ApiClient.get<BookingsResponse>(url);
  }

  async getBookingById(bookingId: string) {
    return await ApiClient.get<{ success: boolean; message: string; data: Booking }>(
      `/bookings/hostel-owner/bookings/${bookingId}`
    );
  }

  async updateBookingStatus(bookingId: string, status: "confirmed" | "cancelled") {
    return await ApiClient.patch<{ success: boolean; message: string; data: Booking }>(
      `/bookings/hostel-owner/bookings/${bookingId}/status`,
      { status }
    );
  }
}

export default new BookingsApi();