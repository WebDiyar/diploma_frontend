import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import {
  createApartment,
  getApartmentById,
  updateApartment,
  deleteApartment,
  getOwnerApartments,
  searchApartments,
  getNearbyApartments,
  getAvailableApartments,
  getPromotedApartments,
  ApartmentCreationParams,
  Apartment,
  ApartmentSearchParams,
  NearbySearchParams,
  AvailabilitySearchParams,
  PaginationParams,
  ValidationError,
  ApartmentNotFoundError,
  AuthorizationError,
  ServerError,
  NetworkError,
} from "@/lib/api_from_swagger/apartments";

export const handleQueryError = (error: unknown): Error => {
  if (
    error instanceof ValidationError ||
    error instanceof ApartmentNotFoundError ||
    error instanceof AuthorizationError ||
    error instanceof ServerError ||
    error instanceof NetworkError
  ) {
    return error;
  }

  return new Error("An unexpected error occurred");
};

export const apartmentKeys = {
  all: ["apartments"] as const,
  lists: () => [...apartmentKeys.all, "list"] as const,
  list: (filters: ApartmentSearchParams) =>
    [...apartmentKeys.lists(), filters] as const,
  details: () => [...apartmentKeys.all, "detail"] as const,
  detail: (id: string) => [...apartmentKeys.details(), id] as const,
  owner: (ownerId: string) => [...apartmentKeys.all, "owner", ownerId] as const,
  nearby: (params: NearbySearchParams) =>
    [...apartmentKeys.all, "nearby", params] as const,
  available: (params: AvailabilitySearchParams) =>
    [...apartmentKeys.all, "available", params] as const,
  promoted: (params: PaginationParams) =>
    [...apartmentKeys.all, "promoted", params] as const,
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

// ----- QUERY HOOKS -----

/**
 * Hook to get an apartment by ID
 */
export function useApartment(
  apartmentId: string,
  options?: Omit<ExtendedQueryOptions<Apartment>, "queryKey" | "queryFn">,
) {
  return useQuery<Apartment, Error>({
    queryKey: apartmentKeys.detail(apartmentId),
    queryFn: () => getApartmentById(apartmentId),
    enabled: !!apartmentId,
    ...options,
  });
}

/**
 * Hook to get all apartments owned by a specific user
 */
export function useOwnerApartments(
  ownerId: string,
  options?: Omit<ExtendedQueryOptions<Apartment[]>, "queryKey" | "queryFn">,
) {
  return useQuery<Apartment[], Error>({
    queryKey: apartmentKeys.owner(ownerId),
    queryFn: () => getOwnerApartments(ownerId),
    enabled: !!ownerId,
    ...options,
  });
}

/**
 * Hook to search apartments with various filters
 */
export function useSearchApartments(
  params: ApartmentSearchParams = {},
  options?: Omit<ExtendedQueryOptions<Apartment[]>, "queryKey" | "queryFn">,
) {
  return useQuery<Apartment[], Error>({
    queryKey: apartmentKeys.list(params),
    queryFn: () => searchApartments(params),
    ...options,
  });
}

/**
 * Hook to get nearby apartments based on coordinates
 */
export function useNearbyApartments(
  params: NearbySearchParams,
  options?: Omit<ExtendedQueryOptions<Apartment[]>, "queryKey" | "queryFn">,
) {
  return useQuery<Apartment[], Error>({
    queryKey: apartmentKeys.nearby(params),
    queryFn: () => getNearbyApartments(params),
    enabled: !!(params.latitude && params.longitude),
    ...options,
  });
}

/**
 * Hook to get apartments available within a date range
 */
export function useAvailableApartments(
  params: AvailabilitySearchParams,
  options?: Omit<ExtendedQueryOptions<Apartment[]>, "queryKey" | "queryFn">,
) {
  return useQuery<Apartment[], Error>({
    queryKey: apartmentKeys.available(params),
    queryFn: () => getAvailableApartments(params),
    enabled: !!(params.check_in && params.check_out),
    ...options,
  });
}

/**
 * Hook to get promoted apartments
 */
export function usePromotedApartments(
  params: PaginationParams = {},
  options?: Omit<ExtendedQueryOptions<Apartment[]>, "queryKey" | "queryFn">,
) {
  return useQuery<Apartment[], Error>({
    queryKey: apartmentKeys.promoted(params),
    queryFn: () => getPromotedApartments(params),
    ...options,
  });
}

// ----- MUTATION HOOKS -----

/**
 * Hook to create a new apartment
 */
export function useCreateApartment(
  options?: ExtendedMutationOptions<Apartment, ApartmentCreationParams>,
) {
  const queryClient = useQueryClient();

  return useMutation<Apartment, Error, ApartmentCreationParams>({
    mutationFn: (apartmentData) => createApartment(apartmentData),
    onSuccess: (data) => {
      // If the response includes the owner's ID, invalidate the owner's apartments list
      if (data.ownerId) {
        queryClient.invalidateQueries({
          queryKey: apartmentKeys.owner(data.ownerId),
        });
      }
      // Invalidate all apartment lists
      queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}

/**
 * Hook to update an existing apartment
 */
export function useUpdateApartment(
  options?: ExtendedMutationOptions<
    Apartment,
    { apartmentId: string; apartmentData: Partial<ApartmentCreationParams> }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    Apartment,
    Error,
    { apartmentId: string; apartmentData: Partial<ApartmentCreationParams> }
  >({
    mutationFn: ({ apartmentId, apartmentData }) =>
      updateApartment(apartmentId, apartmentData),
    onSuccess: (data, variables) => {
      // Update the apartment in the cache
      queryClient.setQueryData(
        apartmentKeys.detail(variables.apartmentId),
        data,
      );

      // If the response includes the owner's ID, invalidate the owner's apartments list
      if (data.ownerId) {
        queryClient.invalidateQueries({
          queryKey: apartmentKeys.owner(data.ownerId),
        });
      }

      // Invalidate all apartment lists
      queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}

/**
 * Hook to delete an apartment
 */
export function useDeleteApartment(
  options?: ExtendedMutationOptions<string, string>,
) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: (apartmentId) => deleteApartment(apartmentId),
    onSuccess: (data, apartmentId) => {
      // Remove the apartment from the cache
      queryClient.removeQueries({
        queryKey: apartmentKeys.detail(apartmentId),
      });

      // Invalidate all apartment lists
      queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });

      // Get the current apartment data from the cache to find the owner
      const apartmentData = queryClient.getQueryData<Apartment>(
        apartmentKeys.detail(apartmentId),
      );
      if (apartmentData?.ownerId) {
        queryClient.invalidateQueries({
          queryKey: apartmentKeys.owner(apartmentData.ownerId),
        });
      }
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}
