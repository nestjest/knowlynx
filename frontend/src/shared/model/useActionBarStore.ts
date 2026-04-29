import type { LucideIcon } from 'lucide-react';
import { create } from 'zustand';

export type ActionBarVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'outline'
  | 'danger'
  | 'danger-soft';

export type ActionBarAction = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: ActionBarVariant;
  isDisabled?: boolean;
  onPress: () => void;
};

type ActionBarState = {
  mode: 'navigation' | 'context';
  actions: ActionBarAction[];
  ownerId: string | null;
  setContext: (ownerId: string, actions: ActionBarAction[]) => void;
  clearContext: (ownerId: string) => void;
};

export const useActionBarStore = create<ActionBarState>((set, get) => ({
  mode: 'navigation',
  actions: [],
  ownerId: null,
  setContext: (ownerId, actions) => {
    set({ mode: 'context', actions, ownerId });
  },
  clearContext: (ownerId) => {
    if (get().ownerId === ownerId) {
      set({ mode: 'navigation', actions: [], ownerId: null });
    }
  },
}));
