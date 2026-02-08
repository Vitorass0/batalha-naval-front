/**
 * Authentication Request DTOs
 * * These interfaces define the structure of data sent TO the API.
 * Keeping them separate from responses helps maintain a clean 
 * unidirectional data flow.
 */

/**
 * Input DTO for user login
 * Used in: authService.login
 */
export interface LoginInput {
  username: string;
  password: string;
}

/**
 * Input DTO for user registration
 * Used in: authService.register
 */
export interface RegisterInput {
  username: string;
  password: string;
}