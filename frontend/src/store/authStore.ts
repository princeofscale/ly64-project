import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  desiredDirection?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  _hasHydrated: boolean;

  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  login: (user: User, accessToken: string, refreshToken: string, expiresIn: number) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  isTokenExpired: () => boolean;
  shouldRefreshToken: () => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      tokenExpiresAt: null,
      isAuthenticated: false,
      isLoading: false,
      isRefreshing: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      setUser: user => set({ user, isAuthenticated: true }),

      setToken: token => set({ token }),

      setTokens: (accessToken, refreshToken, expiresIn) =>
        set({
          token: accessToken,
          refreshToken,
          tokenExpiresAt: Date.now() + expiresIn * 1000,
        }),

      login: (user, accessToken, refreshToken, expiresIn) =>
        set({
          user,
          token: accessToken,
          refreshToken,
          tokenExpiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          tokenExpiresAt: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: loading => set({ isLoading: loading }),

      setRefreshing: refreshing => set({ isRefreshing: refreshing }),

      isTokenExpired: () => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return true;
        return Date.now() >= tokenExpiresAt;
      },

      shouldRefreshToken: () => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return false;
        const twoMinutes = 2 * 60 * 1000;
        return Date.now() >= tokenExpiresAt - twoMinutes;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
