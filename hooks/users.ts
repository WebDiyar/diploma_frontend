import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getLandlords,
  verifyLandlord,
  getUsersByUniversity,
  updateLastLogin,
  ValidationError,
  ProfileNotFoundError,
  AuthorizationError,
  ServerError,
  NetworkError,
} from "@/lib/api_from_swagger/users";
import { User } from "@/types/user";

export const handleQueryError = (error: unknown): Error => {
  if (
    error instanceof ValidationError ||
    error instanceof ProfileNotFoundError ||
    error instanceof AuthorizationError ||
    error instanceof ServerError ||
    error instanceof NetworkError
  ) {
    return error;
  }

  return new Error("An unexpected error occurred");
};

export const userKeys = {
  all: ["users"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: { skip?: number; limit?: number }) =>
    [...userKeys.lists(), filters] as const,
  landlords: (filters: { skip?: number; limit?: number }) =>
    [...userKeys.all, "landlords", filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  university: (
    university: string,
    filters: { skip?: number; limit?: number },
  ) => [...userKeys.all, "university", university, filters] as const,
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

export function useUserProfile(
  options?: Omit<ExtendedQueryOptions<User>, "queryKey" | "queryFn">,
) {
  return useQuery<User, Error>({
    queryKey: userKeys.profile(),
    queryFn: () => getUserProfile(),
    ...options,
  });
}

export function useUser(
  userId: string,
  options?: Omit<ExtendedQueryOptions<User>, "qaeryKey" | "queryFn">,
) {
  return useQuery<User, Error>({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserById(userId),
    ...options,
  });
}

export function useUsers(
  { skip = 0, limit = 10 } = {},
  options?: Omit<ExtendedQueryOptions<User[]>, "queryKey" | "queryFn">,
) {
  return useQuery<User[], Error>({
    queryKey: userKeys.list({ skip, limit }),
    queryFn: () => getAllUsers(skip, limit),
    ...options,
  });
}

export function useLandlords(
  { skip = 0, limit = 10 } = {},
  options?: Omit<ExtendedQueryOptions<User[]>, "queryKey" | "queryFn">,
) {
  return useQuery<User[], Error>({
    queryKey: userKeys.landlords({ skip, limit }),
    queryFn: () => getLandlords(skip, limit),
    ...options,
  });
}

export function useUsersByUniversity(
  university: string,
  { skip = 0, limit = 10 } = {},
  options?: Omit<ExtendedQueryOptions<User[]>, "queryKey" | "queryFn">,
) {
  return useQuery<User[], Error>({
    queryKey: userKeys.university(university, { skip, limit }),
    queryFn: () => getUsersByUniversity(university, skip, limit),
    enabled: !!university,
    ...options,
  });
}

// ----- MUTATION HOOKS -----

export function useCreateUserProfile(
  options?: ExtendedMutationOptions<Record<string, any>, Partial<User>>,
) {
  const queryClient = useQueryClient();

  return useMutation<Record<string, any>, Error, Partial<User>>({
    mutationFn: (newProfile) => createUserProfile(newProfile),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}

export function useUpdateProfile(
  options?: ExtendedMutationOptions<
    Record<string, any>,
    Partial<Record<string, any>>
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Record<string, any>, Error, Partial<Record<string, any>>>({
    mutationFn: (profileData) => updateUserProfile(profileData),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.profile(), data);
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}

export function useUpdateUser(
  options?: ExtendedMutationOptions<
    User,
    { userId: string; userData: Partial<Record<string, any>> }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    Error,
    { userId: string; userData: Partial<Record<string, any>> }
  >({
    mutationFn: ({ userId, userData }) => updateUser(userId, userData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}

export function useDeleteUser(
  options?: ExtendedMutationOptions<string, string>,
) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}

export function useVerifyLandlord(
  options?: ExtendedMutationOptions<User, string>,
) {
  const queryClient = useQueryClient();

  return useMutation<User, Error, string>({
    mutationFn: (userId) => verifyLandlord(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.landlords({}) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}

export function useUpdateLastLogin(
  options?: ExtendedMutationOptions<string, string>,
) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: (userId) => updateLastLogin(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
    },
    onError: (error) => handleQueryError(error),
    ...options,
  });
}
