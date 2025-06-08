import axios, { AxiosError } from "axios";
import { api } from "../axios";
import { ApiError } from "@/types/user";

const API_BASE_URL = "/api/v1/bookings";

export enum BookingStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export interface Booking {
  apartmentId: string;
  check_in_date: string;
  check_out_date: string;
  created_at: string;
  message: string;
  updated_at: string;
  bookingId?: string;
  userId?: string;
  status?: BookingStatus;
}

export interface BookingCreationParams {
  apartmentId: string;
  message: string;
  check_in_date: string;
  check_out_date: string;
}

export type BookingUpdateParams = Partial<
  Omit<Booking, "created_at" | "bookingId">
>;

export interface BookingsByStatusParams {
  status: BookingStatus;
  skip?: number;
  limit?: number;
}

export interface AvailabilityCheckParams {
  apartment_id: string;
  check_in: string;
  check_out: string;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export async function createBooking(
  bookingData: BookingCreationParams,
): Promise<Booking> {
  try {
    const response = await api.post<Booking>(API_BASE_URL, bookingData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  try {
    const response = await api.get<Booking>(`${API_BASE_URL}/${bookingId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateBooking(
  bookingId: string,
  bookingData: BookingUpdateParams,
): Promise<Booking> {
  try {
    const response = await api.patch<Booking>(
      `${API_BASE_URL}/${bookingId}`,
      bookingData,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function deleteBooking(bookingId: string): Promise<string> {
  try {
    const response = await api.delete<string>(`${API_BASE_URL}/${bookingId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const response = await api.get<Booking[]>(`${API_BASE_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getApartmentBookings(
  apartmentId: string,
): Promise<Booking[]> {
  try {
    const response = await api.get<Booking[]>(
      `${API_BASE_URL}/apartment/${apartmentId}`,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getBookingsByStatus(
  params: BookingsByStatusParams,
): Promise<Booking[]> {
  try {
    const { status, ...queryParams } = params;
    const response = await api.get<Booking[]>(
      `${API_BASE_URL}/status/${status}`,
      {
        params: queryParams,
      },
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<Booking> {
  try {
    const response = await api.patch<Booking>(
      `${API_BASE_URL}/${bookingId}/status`,
      null,
      { params: { status } },
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function checkAvailability(
  params: AvailabilityCheckParams,
): Promise<string> {
  try {
    const response = await api.get<string>(
      `${API_BASE_URL}/check-availability`,
      {
        params,
      },
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export class BookingNotFoundError extends Error {
  constructor(message = "Booking not found") {
    super(message);
    this.name = "BookingNotFoundError";
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

export class BookingConflictError extends Error {
  constructor(message = "Booking dates conflict with existing bookings") {
    super(message);
    this.name = "BookingConflictError";
  }
}

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response) {
      const status = axiosError.response.status;

      if (status === 404) {
        throw new BookingNotFoundError();
      } else if (status === 401 || status === 403) {
        throw new AuthorizationError();
      } else if (status === 409) {
        throw new BookingConflictError();
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
