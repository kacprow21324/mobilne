import { create } from 'zustand';

export type CurrentUser = {
  id: string;
  email: string | null;
  username: string;
};

type AuthState = {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
}));
