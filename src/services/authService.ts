/**
 * Authentication Service - Pure API Adapter
 * 
 * This service is responsible solely for making HTTP calls to authentication endpoints.
 * It does NOT manage session state, tokens, or perform side effects like localStorage writes.
 * 
 * Responsibilities:
 * - Send credentials to the backend
 * - Return structured data from the API
 * - Let the caller (UI components, providers) handle persistence and state management
 */
import api from './api';
import { AuthResponse, LeaderBoardResponse, UserDetails, UserProfile } from '@/types/api-responses';
import { LoginInput, RegisterInput } from '@/types/api-requests'; // Importa do novo arquivo


/**
 * Pure Authentication API Adapter
 * 
 * All methods are pure functions that return promises.
 * No side effects (localStorage, cookies, redirects) are performed here.
 */
export const authService = {
  /**
   * Authenticate user with credentials
   * 
   * @param credentials - User email and password
   * @returns Promise resolving to authentication response with token and user data
   * @throws ApiError from the HTTP client layer
   */
  async login(credentials: LoginInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /**
   * Register a new user account
   * 
   * @param credentials - User registration data (username, email, password)
   * @returns Promise resolving to authentication response with token and user data
   * @throws ApiError from the HTTP client layer
   */
  async register(credentials: RegisterInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/users', credentials);
    return data;
  },

  /**
   * Fetch the authenticated user's profile
   * 
   * Requires valid authentication token to be present in the request.
   * Token injection is handled by the API client interceptor.
   * 
   * @returns Promise resolving to user profile data
   * @throws ApiError (401 if not authenticated)
   */
  async getProfile(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>('/Users/profile');
    return data;
  },
  async getLeaderBoard(): Promise<LeaderBoardResponse[]>{
    const {data} = await api.get<LeaderBoardResponse[]>('/Users/player_stats');
    return data;
  },
  /**
   * Validate the current authentication token
   * 
   * Useful for checking if a stored token is still valid.
   * 
   * @returns Promise resolving to true if token is valid, false otherwise
   */
  async validateToken(): Promise<boolean> {
    try {
      await api.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  },
};
