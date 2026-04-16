import { create } from 'zustand';

export type ConnectionStatus = 'online' | 'offline' | 'error';

type AppState = {
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
};

export const useAppStore = create<AppState>((set) => ({
  connectionStatus: 'offline',
  setConnectionStatus: (status) => set({ connectionStatus: status })
}));
