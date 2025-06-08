import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import {
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  getUserBookings,
  getApartmentBookings,
  getBookingsByStatus,
  updateBookingStatus,
  checkAvailability,
  BookingCreationParams,
  BookingUpdateParams,
  BookingsByStatusParams,
  AvailabilityCheckParams,
  Booking,
  BookingStatus,
  ValidationError,
  BookingNotFoundError,
  AuthorizationError,
  ServerError,
  NetworkError,
  BookingConflictError,
} from "@/lib/api_from_swagger/booking";

export const handleQueryError = (error: unknown): Error => {
  if (
    error instanceof ValidationError ||
    error instanceof BookingNotFoundError ||
    error instanceof AuthorizationError ||
    error instanceof ServerError ||
    error instanceof NetworkError ||
    error instanceof BookingConflictError
  ) {
    return error;
  }

  return new Error("An unexpected error occurred");
};

export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  user: (userId: string) => [...bookingKeys.all, "user", userId] as const,
  apartment: (apartmentId: string) =>
    [...bookingKeys.all, "apartment", apartmentId] as const,
  status: (params: BookingsByStatusParams) =>
    [...bookingKeys.all, "status", params] as const,
  availability: (params: AvailabilityCheckParams) =>
    [...bookingKeys.all, "availability", params] as const,
};

type ExtendedQueryOptions<TData, TError = Error> = UseQueryOptions<
  TData,
  TError,
  TData,
  QueryKey
>;

type ExtendedMutationOptions<
  TData,
  TVariables,
  TError = Error,
> = UseMutationOptions<TData, TError, TVariables>;

export function useBooking(
  bookingId: string,
  options?: Omit<ExtendedQueryOptions<Booking>, "queryKey" | "queryFn">,
) {
  return useQuery<Booking, Error>({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => getBookingById(bookingId),
    enabled: !!bookingId,
    ...options,
  });
}

export function useUserBookings(
  userId: string,
  options?: Omit<ExtendedQueryOptions<Booking[]>, "queryKey" | "queryFn">,
) {
  return useQuery<Booking[], Error>({
    queryKey: bookingKeys.user(userId),
    queryFn: () => getUserBookings(userId),
    enabled: !!userId,
    ...options,
  });
}

export function useApartmentBookings(
  apartmentId: string,
  options?: Omit<ExtendedQueryOptions<Booking[]>, "queryKey" | "queryFn">,
) {
  return useQuery<Booking[], Error>({
    queryKey: bookingKeys.apartment(apartmentId),
    queryFn: () => getApartmentBookings(apartmentId),
    enabled: !!apartmentId,
    ...options,
  });
}

export function useBookingsByStatus(
  params: BookingsByStatusParams,
  options?: Omit<ExtendedQueryOptions<Booking[]>, "queryKey" | "queryFn">,
) {
  return useQuery<Booking[], Error>({
    queryKey: bookingKeys.status(params),
    queryFn: () => getBookingsByStatus(params),
    enabled: !!params.status,
    ...options,
  });
}

export function useCheckAvailability(
  params: AvailabilityCheckParams,
  options?: Omit<ExtendedQueryOptions<string>, "queryKey" | "queryFn">,
) {
  return useQuery<string, Error>({
    queryKey: bookingKeys.availability(params),
    queryFn: () => checkAvailability(params),
    enabled: !!(params.apartment_id && params.check_in && params.check_out),
    ...options,
  });
}

export function useCreateBooking(
  options?: ExtendedMutationOptions<Booking, BookingCreationParams>,
) {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, BookingCreationParams>({
    mutationFn: (bookingData) => createBooking(bookingData),
    onSuccess: (data) => {
      if (data.userId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.user(data.userId),
        });
      }
      if (data.apartmentId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.apartment(data.apartmentId),
        });
      }
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}

export function useUpdateBooking(
  options?: ExtendedMutationOptions<
    Booking,
    { bookingId: string; bookingData: BookingUpdateParams }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    Booking,
    Error,
    { bookingId: string; bookingData: BookingUpdateParams }
  >({
    mutationFn: ({ bookingId, bookingData }) =>
      updateBooking(bookingId, bookingData),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(bookingKeys.detail(variables.bookingId), data);

      if (data.userId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.user(data.userId),
        });
      }
      if (data.apartmentId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.apartment(data.apartmentId),
        });
      }
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}

export function useDeleteBooking(
  options?: ExtendedMutationOptions<string, string>,
) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: (bookingId) => deleteBooking(bookingId),
    onSuccess: (data, bookingId) => {
      queryClient.removeQueries({
        queryKey: bookingKeys.detail(bookingId),
      });

      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });

      const bookingData = queryClient.getQueryData<Booking>(
        bookingKeys.detail(bookingId),
      );
      if (bookingData?.userId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.user(bookingData.userId),
        });
      }
      if (bookingData?.apartmentId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.apartment(bookingData.apartmentId),
        });
      }
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}

export function useUpdateBookingStatus(
  options?: ExtendedMutationOptions<
    Booking,
    { bookingId: string; status: BookingStatus }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    Booking,
    Error,
    { bookingId: string; status: BookingStatus }
  >({
    mutationFn: ({ bookingId, status }) =>
      updateBookingStatus(bookingId, status),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(bookingKeys.detail(variables.bookingId), data);

      if (data.userId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.user(data.userId),
        });
      }
      if (data.apartmentId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.apartment(data.apartmentId),
        });
      }
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}
