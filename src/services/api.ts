/**
 * HTTP Client Infrastructure
 * 
 * Centralized Axios instance for all API communication.
 * Handles authentication token injection and global error interception.
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { getRefreshToken, getToken, removeRefreshToken, removeToken, setRefreshToken, setToken } from '@/lib/utils';

/**
 * Standardized API error structure
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Create and configure Axios instance
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * Request Interceptor
 * 
 * Injects the Authorization header with Bearer token if available.
 * This ensures all authenticated requests carry the access token automatically.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles global error scenarios, particularly 401 Unauthorized responses.
 * Maintains SPA architecture by avoiding hard redirects.
 */
let isRefreshing = false;


api.interceptors.response.use(
  (response) => response,
  async (error:AxiosError) =>{
    const originalRequest: any = error.config;

  
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

      if (isRefreshing) {
        return Promise.reject(error); //change to queue later
      }

      originalRequest._retry = true; // Mark refresh
      isRefreshing = true;
        
      try {

        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken: refreshToken
        });

        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return api(originalRequest);

      } catch (refreshError) {
        //cleans if refresh fails
        isRefreshing = false;
        removeToken();
        removeRefreshToken();
        
        // redirect
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
  }
    // Handle other errors
    const responseData = error.response?.data as { message?: string } | undefined;
    const apiError: ApiError = {
      message: responseData?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
    };
    
    return Promise.reject(apiError);
  }
);

export default api;
