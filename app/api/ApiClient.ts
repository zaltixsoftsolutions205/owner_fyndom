// app/api/ApiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "./api_urlLink";
import { Platform, Alert } from "react-native";

// Add Pricing Interfaces
export interface PricingPayload {
  hostelId?: string;
  sharingType: string;
  durationType: string;
  price: number;
}

export interface PricingResponse {
  success: boolean;
  message: string;
  data?: {
    pricing: any;
    hostelInfo: {
      hostelId: string;
      hostelName: string;
      hostelType: string;
    };
  };
}

export interface GetPricingResponse {
  success: boolean;
  data: {
    organized: {
      [key: string]: {
        label: string;
        daily: PricingItem;
        monthly: PricingItem;
      };
    };
    summary: Array<{
      sharing: string;
      daily: number;
      monthly: number;
    }>;
    rawData: any[];
    totalItems: number;
    hostelId: string;
  };
}

export interface PricingItem {
  price: number;
  currency: string;
  isSet: boolean;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedRequests: any[] = [];

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // Increased to 30 seconds
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        console.log('🌐 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          fullUrl: config.baseURL + config.url,
          timeout: config.timeout,
          platform: Platform.OS
        });

        // Skip adding token for auth endpoints
        const isAuthEndpoint = config.url?.includes('/auth/login') ||
          config.url?.includes('/auth/refresh-token') ||
          config.url?.includes('/auth/forgot-password') ||
          config.url?.includes('/auth/reset-password') ||
          config.url?.includes('/auth/verify-otp');

        if (!isAuthEndpoint) {
          try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error("Error getting token from AsyncStorage:", error);
          }
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', {
          status: response.status,
          url: response.config.url,
          success: response.data?.success
        });
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // console.error('❌ API Error:', {
        //   message: error.message,
        //   code: error.code,
        //   url: error.config?.url,
        //   baseURL: error.config?.baseURL,
        //   status: error.response?.status
        // });

        // Better error messages
        if (error.code === 'ECONNABORTED') {
          error.message = 'Request timeout. Please check your internet connection.';
        } else if (error.message === 'Network Error') {
          error.message = `Network error. Cannot connect to server at ${BASE_URL}`;
        } else if (!error.response) {
          error.message = 'No response from server. Please check if server is running.';
        }

        // Handle 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedRequests.push({ resolve, reject });
            }).then(async () => {
              const newToken = await AsyncStorage.getItem("token");
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }).catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem("refreshToken");
            if (refreshToken) {
              const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh-token`, {
                refreshToken,
              });

              const newAccessToken = refreshResponse.data.data.tokens.accessToken;
              const newRefreshToken = refreshResponse.data.data.tokens.refreshToken;

              // ✅ STORE IMMEDIATELY (THIS IS FIX #3)
              await AsyncStorage.setItem("token", newAccessToken);
              await AsyncStorage.setItem("refreshToken", newRefreshToken);


              this.failedRequests.forEach(({ resolve, originalRequest }) => {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                resolve(this.axiosInstance(originalRequest));
              });
              this.failedRequests = [];

              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.failedRequests.forEach(({ reject }) => reject(refreshError));
            this.failedRequests = [];
            await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  async postFormData<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/auth/health');
      console.log('✅ Server connection test passed:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Server connection test failed:', error);
      return false;
    }
  }

  // Add these forgot password methods if not already present
  async sendForgotPasswordOTP(email: string): Promise<any> {
    return this.post('/auth/forgot-password', {
      email,
      role: 'hostelOwner'
    });
  }

  async verifyForgotPasswordOTP(email: string, otp: string): Promise<any> {
    return this.post('/auth/verify-otp', {
      email,
      otp,
      role: 'hostelOwner'
    });
  }

  async resetPasswordWithToken(data: {
    email: string;
    resetToken: string;
    newPassword: string;
  }): Promise<any> {
    return this.post('/auth/reset-password', {
      ...data,
      role: 'hostelOwner'
    });
  }
}

// Create and export a single instance
const apiClient = new ApiClient(BASE_URL);
export default apiClient;