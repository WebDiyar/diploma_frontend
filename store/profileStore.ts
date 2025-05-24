import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";

interface ProfileState {
  profile: Partial<User> | null;
  editedProfile: Partial<User> | null;
  changedFields: Set<string>;
  isEditing: boolean;
  loading: boolean;
  error: Error | null;

  setProfile: (profile: Partial<User> | null) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  updateField: <K extends keyof User>(field: K, value: User[K]) => void;
  resetChanges: () => void;
  getChangedFields: () => Partial<User>;
  hasChanges: () => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  saveProfileSuccess: (updatedProfile: Partial<User>) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      editedProfile: null,
      changedFields: new Set<string>(),
      isEditing: false,
      loading: false,
      error: null,

      setProfile: (profile) => {
        set({
          profile,
          editedProfile: profile ? { ...profile } : null,
          changedFields: new Set<string>(),
        });
      },

      startEditing: () => {
        const { profile } = get();
        set({
          isEditing: true,
          editedProfile: profile ? { ...profile } : null,
          changedFields: new Set<string>(),
        });
      },

      cancelEditing: () => {
        const { profile } = get();
        set({
          isEditing: false,
          editedProfile: profile ? { ...profile } : null,
          changedFields: new Set<string>(),
        });
      },

      updateField: <K extends keyof User>(field: K, value: User[K]) => {
        set((state) => {
          const currentEditedProfile =
            state.editedProfile || (state.profile ? { ...state.profile } : {});

          const newEditedProfile = {
            ...currentEditedProfile,
            [field]: value,
          };

          const newChangedFields = new Set(state.changedFields);

          if (
            state.profile &&
            JSON.stringify(state.profile[field]) !== JSON.stringify(value)
          ) {
            newChangedFields.add(String(field));
          } else {
            newChangedFields.delete(String(field));
          }

          return {
            editedProfile: newEditedProfile,
            changedFields: newChangedFields,
          };
        });
      },

      resetChanges: () => {
        const { profile } = get();
        set({
          editedProfile: profile ? { ...profile } : null,
          changedFields: new Set<string>(),
        });
      },

      getChangedFields: () => {
        const { editedProfile, changedFields } = get();
        const changes: Partial<User> = {};

        if (!editedProfile) return changes;

        changedFields.forEach((fieldName) => {
          const field = fieldName as keyof User;
          if (field in editedProfile) {
            // @ts-ignore
            changes[field] = editedProfile[field];
          }
        });

        return changes;
      },

      hasChanges: () => {
        return get().changedFields.size > 0;
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      saveProfileSuccess: (updatedProfile) => {
        const currentProfile = get().profile || {};
        const newProfile = { ...currentProfile, ...updatedProfile };

        set({
          profile: newProfile,
          editedProfile: { ...newProfile },
          isEditing: false,
          changedFields: new Set<string>(),
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: "user-profile-storage",
      partialize: (state) => ({
        profile: state.profile,
        isEditing: false,
      }),
    },
  ),
);

export const useLoadProfile = () => {
  const { setProfile, setLoading, setError } = useProfileStore();

  return {
    loadProfile: async (fetchFunction: () => Promise<Partial<User>>) => {
      setLoading(true);
      try {
        const data = await fetchFunction();
        setProfile(data);
        setError(null);
        return data;
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        setLoading(false);
      }
    },
  };
};

export const useSaveProfile = () => {
  const { getChangedFields, saveProfileSuccess, setLoading, setError } =
    useProfileStore();

  return {
    saveChanges: async (
      updateFunction: (data: Partial<User>) => Promise<Partial<User>>,
    ) => {
      setLoading(true);

      try {
        const changedData = getChangedFields();

        if (Object.keys(changedData).length === 0) {
          return null;
        }

        const updatedData = await updateFunction(changedData);

        saveProfileSuccess(updatedData);

        setError(null);
        return updatedData;
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        setLoading(false);
      }
    },
  };
};
