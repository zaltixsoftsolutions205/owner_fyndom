// app/api/ApiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "./api_urlLink";

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
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Skip adding token for auth endpoints
        const isAuthEndpoint = config.url?.includes('/auth/login') || 
                              config.url?.includes('/auth/refresh-token');
        
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
        return Promise.reject(error);
      }
    );

    // Response interceptor - simplified without Redux dependency
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors without Redux dependency
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
              
              const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.tokens;
              
              // Store new tokens
              await AsyncStorage.multiSet([
                ['token', accessToken],
                ['refreshToken', newRefreshToken],
              ]);

              // Retry failed requests
              this.failedRequests.forEach(({ resolve }) => resolve());
              this.failedRequests = [];
              
              // Update authorization header and retry original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, clear tokens and reject
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
}

export default new ApiClient(BASE_URL);