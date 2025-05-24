import { User, ApiError } from "@/types/user";
import axios, { AxiosError } from "axios";
import { api } from "../axios";
const API_BASE_URL = "/api/v1";

/* Get user profile information */
export async function getUserProfile(): Promise<User> {
  try {
    const response = await api.get<User>(`${API_BASE_URL}/profile`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/* Create or fill user profile */
export async function createUserProfile(
  profileData: Partial<User>,
): Promise<Record<string, any>> {
  try {
    const response = await api.post<Record<string, any>>(
      `${API_BASE_URL}/profile`,
      profileData,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  profileData: Partial<any>,
): Promise<User> {
  try {
    const response = await api.patch<any>(
      `${API_BASE_URL}/profile`,
      profileData,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User> {
  try {
    const response = await api.get<User>(`${API_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Update user by ID
 */
export async function updateUser(
  userId: string,
  userData: Partial<Record<string, any>>,
): Promise<User> {
  try {
    const response = await api.patch<User>(
      `${API_BASE_URL}/${userId}`,
      userData,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Delete user by ID
 */
export async function deleteUser(userId: string): Promise<string> {
  try {
    const response = await api.delete<string>(`${API_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get all users with pagination
 */
export async function getAllUsers(skip = 0, limit = 10): Promise<User[]> {
  try {
    const response = await api.get<User[]>(`${API_BASE_URL}/`, {
      params: { skip, limit },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get landlords with pagination
 */
export async function getLandlords(skip = 0, limit = 10): Promise<User[]> {
  try {
    const response = await api.get<User[]>(`${API_BASE_URL}/landlords`, {
      params: { skip, limit },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Verify user as landlord
 */
export async function verifyLandlord(userId: string): Promise<User> {
  try {
    const response = await api.post<User>(
      `${API_BASE_URL}/${userId}/verify-landlord`,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get users by university with pagination
 */
export async function getUsersByUniversity(
  university: string,
  skip = 0,
  limit = 10,
): Promise<User[]> {
  try {
    const response = await api.get<User[]>(
      `${API_BASE_URL}/university/${university}`,
      {
        params: { skip, limit },
      },
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<string> {
  try {
    const response = await api.post<string>(
      `${API_BASE_URL}/${userId}/last-login`,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export class ProfileNotFoundError extends Error {
  constructor(message = "Profile not found") {
    super(message);
    this.name = "ProfileNotFoundError";
  }
}

export class ValidationError extends Error {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;

  constructor(detail: ApiError["detail"]) {
    const message = detail.map((item) => item.msg).join(", ");
    super(message);
    this.name = "ValidationError";
    this.detail = detail;
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Not authorized to perform this action") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ServerError extends Error {
  constructor(message = "Server error occurred") {
    super(message);
    this.name = "ServerError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network error occurred") {
    super(message);
    this.name = "NetworkError";
  }
}

// Helper function to process errors
function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response) {
      const status = axiosError.response.status;

      if (status === 404) {
        throw new ProfileNotFoundError();
      } else if (status === 401 || status === 403) {
        throw new AuthorizationError();
      } else if (status === 422 && axiosError.response.data) {
        throw new ValidationError(axiosError.response.data.detail);
      } else if (status >= 500) {
        throw new ServerError();
      }
    } else if (axiosError.request) {
      throw new NetworkError("No response received from server");
    }
  }

  throw new Error("An unexpected error occurred");
}
