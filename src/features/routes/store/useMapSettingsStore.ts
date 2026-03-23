import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface MapSettingsState {
  selectedMapStyleUrl: string | null;
  setSelectedMapStyleUrl: (url: string | null) => void;
}

export const useMapSettingsStore = create<MapSettingsState>()(
  persist(
    (set) => ({
      selectedMapStyleUrl: null, // Si es null, el UI usa el estilo por defecto según el tema (Dark / Satellite)
      setSelectedMapStyleUrl: (url) => set({ selectedMapStyleUrl: url }),
    }),
    {
      name: "map-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
