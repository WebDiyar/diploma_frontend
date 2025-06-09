import axios, { AxiosError } from "axios";
import { api } from "../axios";
import { ApiError } from "@/types/user";
const API_BASE_URL = "/api/v1/apartments";

/**
 * Interface for apartment address
 */
export interface Address {
  street: string;
  house_number: string;
  apartment_number: string;
  entrance: string;
  has_intercom: boolean;
  landmark: string;
}

/**
 * Interface for apartment data
 */
export interface Apartment {
  apartmentId: string;
  ownerId: string;
  apartment_name: string;
  description: string;
  address: Address;
  district_name: string;
  latitude: number;
  longitude: number;
  price_per_month: number;
  area: number;
  kitchen_area: number;
  floor: number;
  number_of_rooms: number;
  max_users: number;
  available_from: string;
  available_until: string; // ISO date string
  university_nearby: string;
  pictures: string[];
  is_promoted: boolean;
  is_pet_allowed: boolean;
  rental_type: string;
  roommate_preferences: string;
  included_utilities: string[];
  rules: string[];
  contact_phone: string;
  contact_telegram: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  is_active: boolean;
}

/**
 * Type for apartment creation/update parameters
 */
export type ApartmentCreationParams = Omit<
  Apartment,
  "created_at" | "updated_at"
>;

/**
 * Search parameters for apartments
 */
export interface ApartmentSearchParams {
  min_price?: number;
  max_price?: number;
  location?: string;
  university?: string;
  room_type?: string;
  skip?: number;
  limit?: number;
}

/**
 * Nearby search parameters
 */
export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius_km?: number;
  skip?: number;
  limit?: number;
}

/**
 * Available apartments search parameters
 */
export interface AvailabilitySearchParams {
  check_in: string; // ISO date string
  check_out: string; // ISO date string
  skip?: number;
  limit?: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

/* Create a new apartment */
export async function createApartment(
  apartmentData: ApartmentCreationParams,
): Promise<Apartment> {
  try {
    const response = await api.post<Apartment>(API_BASE_URL, apartmentData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/* Get apartment by ID */
export async function getApartmentById(
  apartmentId: string,
): Promise<Apartment> {
  try {
    const response = await api.get<Apartment>(`${API_BASE_URL}/${apartmentId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/* Update apartment by ID */
export async function updateApartment(
  apartmentId: string,
  apartmentData: Partial<ApartmentCreationParams>,
): Promise<Apartment> {
  try {
    const response = await api.patch<Apartment>(
      `${API_BASE_URL}/${apartmentId}`,
      apartmentData,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/* Delete apartment by ID */
export async function deleteApartment(apartmentId: string): Promise<string> {
  try {
    const response = await api.delete<string>(`${API_BASE_URL}/${apartmentId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/* Get apartments by owner ID */
export async function getOwnerApartments(
  ownerId: string,
): Promise<Apartment[]> {
  try {
    const response = await api.get<Apartment[]>(
      `${API_BASE_URL}/owner/${ownerId}`,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/* Search apartments with filters */
export async function searchApartments(
  params: ApartmentSearchParams = {},
): Promise<Apartment[]> {
  try {
    const response = await api.get<Apartment[]>(`${API_BASE_URL}/search`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/* Find nearby apartments */
export async function getNearbyApartments(
  params: NearbySearchParams,
): Promise<Apartment[]> {
  try {
    const response = await api.get<Apartment[]>(`${API_BASE_URL}/nearby`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/* Get available apartments for a date range */
export async function getAvailableApartments(
  params: AvailabilitySearchParams,
): Promise<Apartment[]> {
  try {
    const response = await api.get<Apartment[]>(`${API_BASE_URL}/available`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/* Get promoted apartments */
export async function getPromotedApartments(
  params: PaginationParams = {},
): Promise<Apartment[]> {
  try {
    const response = await api.get<Apartment[]>(`${API_BASE_URL}/promoted`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Custom error for when an apartment is not found
 */
export class ApartmentNotFoundError extends Error {
  constructor(message = "Apartment not found") {
    super(message);
    this.name = "ApartmentNotFoundError";
  }
}

/**
 * Custom error for validation errors
 */
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

/**
 * Custom error for authorization failures
 */
export class AuthorizationError extends Error {
  constructor(message = "Not authorized to perform this action") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Custom error for server errors
 */
export class ServerError extends Error {
  constructor(message = "Server error occurred") {
    super(message);
    this.name = "ServerError";
  }
}

/**
 * Custom error for network issues
 */
export class NetworkError extends Error {
  constructor(message = "Network error occurred") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Helper function to process API errors
 */
function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response) {
      const status = axiosError.response.status;

      if (status === 404) {
        throw new ApartmentNotFoundError();
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
