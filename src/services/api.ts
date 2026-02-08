/**
 * HTTP Client Infrastructure
 * 
 * Centralized Axios instance for all API communication.
 * Handles authentication token injection and global error interception.
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { getToken, removeToken } from '@/lib/utils';

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
api.interceptors.response.use(
  (response) => {
    // Success path - return response as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear invalid/expired token
      removeToken();
      
      // TODO: Implement Silent Refresh Token flow here
      // - Attempt to refresh the access token using a refresh token
      // - If refresh succeeds, retry the original request
      // - If refresh fails, emit an auth event for UI to handle redirect
      
      // For now, reject with a standardized error
      const apiError: ApiError = {
        message: 'Session expired. Please log in again.',
        status: 401,
        code: 'UNAUTHORIZED',
      };
      
      return Promise.reject(apiError);
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
