import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Apartment } from "@/types/apartments";

interface ApartmentState {
  apartment: Partial<Apartment> | null;
  editedApartment: Partial<Apartment> | null;
  changedFields: Set<string>;
  isEditing: boolean;
  loading: boolean;
  error: Error | null;

  setApartment: (apartment: Partial<Apartment> | null) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  updateField: <K extends keyof Apartment>(
    field: K,
    value: Apartment[K],
  ) => void;
  resetChanges: () => void;
  getChangedFields: () => Partial<Apartment>;
  getFullApartmentData: () => Partial<Apartment>;
  hasChanges: () => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  saveApartmentSuccess: (updatedApartment: Partial<Apartment>) => void;
}

export const useApartmentStore = create<ApartmentState>()(
  persist(
    (set, get) => ({
      apartment: null,
      editedApartment: null,
      changedFields: new Set<string>(),
      isEditing: false,
      loading: false,
      error: null,

      setApartment: (apartment) => {
        set({
          apartment,
          editedApartment: apartment ? { ...apartment } : null,
          changedFields: new Set<string>(),
        });
      },

      startEditing: () => {
        const { apartment } = get();
        set({
          isEditing: true,
          editedApartment: apartment ? { ...apartment } : null,
          changedFields: new Set<string>(),
        });
      },

      cancelEditing: () => {
        const { apartment } = get();
        set({
          isEditing: false,
          editedApartment: apartment ? { ...apartment } : null,
          changedFields: new Set<string>(),
        });
      },

      updateField: <K extends keyof Apartment>(
        field: K,
        value: Apartment[K],
      ) => {
        set((state) => {
          const currentEditedApartment =
            state.editedApartment ||
            (state.apartment ? { ...state.apartment } : {});

          const newEditedApartment = {
            ...currentEditedApartment,
            [field]: value,
          };

          const newChangedFields = new Set(state.changedFields);

          if (
            state.apartment &&
            JSON.stringify(state.apartment[field]) !== JSON.stringify(value)
          ) {
            newChangedFields.add(String(field));
          } else {
            newChangedFields.delete(String(field));
          }

          return {
            editedApartment: newEditedApartment,
            changedFields: newChangedFields,
          };
        });
      },

      resetChanges: () => {
        const { apartment } = get();
        set({
          editedApartment: apartment ? { ...apartment } : null,
          changedFields: new Set<string>(),
        });
      },

      getChangedFields: () => {
        const { editedApartment, changedFields } = get();
        const changes: Partial<Apartment> = {};

        if (!editedApartment) return changes;

        changedFields.forEach((fieldName) => {
          const field = fieldName as keyof Apartment;
          if (field in editedApartment) {
            // @ts-ignore
            changes[field] = editedApartment[field];
          }
        });

        return changes;
      },

      // Новый метод для получения полных данных апартамента
      getFullApartmentData: () => {
        const { editedApartment, apartment } = get();
        return editedApartment || apartment || {};
      },

      hasChanges: () => {
        return get().changedFields.size > 0;
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      saveApartmentSuccess: (updatedApartment) => {
        const currentApartment = get().apartment || {};
        const newApartment = { ...currentApartment, ...updatedApartment };

        set({
          apartment: newApartment,
          editedApartment: { ...newApartment },
          isEditing: false,
          changedFields: new Set<string>(),
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: "apartment-storage",
      partialize: (state) => ({
        apartment: state.apartment,
        isEditing: false,
      }),
    },
  ),
);

export const useLoadApartment = () => {
  const { setApartment, setLoading, setError } = useApartmentStore();

  return {
    loadApartment: async (fetchFunction: () => Promise<Partial<Apartment>>) => {
      setLoading(true);
      try {
        const data = await fetchFunction();
        setApartment(data);
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

export const useSaveApartment = () => {
  const { getFullApartmentData, saveApartmentSuccess, setLoading, setError } =
    useApartmentStore();

  return {
    saveChanges: async (
      updateFunction: (data: Partial<Apartment>) => Promise<Partial<Apartment>>,
    ) => {
      setLoading(true);

      try {
        // Используем полные данные вместо только изменённых
        const fullData = getFullApartmentData();

        if (Object.keys(fullData).length === 0) {
          throw new Error("No apartment data to save");
        }

        const updatedData = await updateFunction(fullData);

        saveApartmentSuccess(updatedData);

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
