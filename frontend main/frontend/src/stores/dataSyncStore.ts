import { create } from 'zustand';
import { SyncStatus } from '../types/api';

interface DataSyncState {
  platforms: SyncStatus[];
  isLoading: boolean;
  updatePlatformStatus: (platform: string, status: Partial<SyncStatus>) => void;
  setLoading: (loading: boolean) => void;
}

export const useDataSyncStore = create<DataSyncState>((set) => ({
  platforms: [],
  isLoading: false,
  updatePlatformStatus: (platform, status) =>
    set((state) => ({
      platforms: state.platforms.map((p) =>
        p.platform === platform ? { ...p, ...status } : p
      ),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));