import { create } from 'zustand';

export const useAppStore = create((set) => ({
  connectionStatus: 'offline',
  setConnectionStatus: (status) => set({ connectionStatus: status })
}));
