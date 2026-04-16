import { create } from 'zustand';

export type ConnectionStatus = 'online' | 'offline' | 'error';

type AppState = {
  connectionStatus: ConnectionStatus;
  isSidebarExpanded: boolean;
  setConnectionStatus: (status: ConnectionStatus) => void;
  toggleSidebar: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  connectionStatus: 'offline',
  isSidebarExpanded: false,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded }))
}));
