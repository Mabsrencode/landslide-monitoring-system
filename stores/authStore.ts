import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: UserCredential | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: UserCredential | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "bantay-auth-storage",
    }
  )
);
